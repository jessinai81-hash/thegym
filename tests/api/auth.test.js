import { describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import { anon, cookieHeader, getApp, hasDb, newUser, PASSWORD, testEmail } from '../helpers.js'
import request from 'supertest'

describe.skipIf(!hasDb)('auth: sign up', () => {
  it('creates an account and sets an httpOnly session cookie', async () => {
    const email = testEmail('signup')
    const res = await (await anon()).post('/api/auth/signup').send({
      fullName: '  Jamie Lee  ',
      email: email.toUpperCase(),
      password: PASSWORD,
      weeklyGoalWorkouts: 5,
      weeklyGoalMinutes: 240,
    })
    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({ email, fullName: 'Jamie Lee', weeklyGoalWorkouts: 5, weeklyGoalMinutes: 240 })
    expect(res.body.user).not.toHaveProperty('password_hash')
    expect(JSON.stringify(res.body)).not.toContain(PASSWORD)
    const cookie = cookieHeader(res)
    expect(cookie).toMatch(/pf_session=[^;]+/)
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Lax/i)

    // The readable "logged in" hint holds no secret and the session cookie stays httpOnly.
    const cookies = [].concat(res.headers['set-cookie'])
    const hint = cookies.find((c) => c.startsWith('pf_logged_in='))
    expect(hint).toMatch(/^pf_logged_in=1;/)
    expect(hint).not.toMatch(/HttpOnly/i)
    expect(cookies.find((c) => c.startsWith('pf_session='))).toMatch(/HttpOnly/i)
  })

  it('blocks a duplicate email (case-insensitive)', async () => {
    const { credentials } = await newUser()
    const res = await (await anon()).post('/api/auth/signup').send({ ...credentials, email: credentials.email.toUpperCase() })
    expect(res.status).toBe(409)
    expect(res.body.error).toBe('email_taken')
  })

  it.each([
    ['empty', ''],
    ['too short', '1234567'],
    ['missing', undefined],
  ])('blocks a %s password', async (_, password) => {
    const res = await (await anon()).post('/api/auth/signup').send({ fullName: 'Weak Pw', email: testEmail('weak'), password })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('weak_password')
  })

  it('blocks an empty name, a bad email and silly goals', async () => {
    const a = await anon()
    const base = { fullName: 'Ok', email: testEmail('val'), password: PASSWORD }
    expect((await a.post('/api/auth/signup').send({ ...base, fullName: '   ' })).body.error).toBe('invalid_name')
    expect((await a.post('/api/auth/signup').send({ ...base, email: 'not-an-email' })).body.error).toBe('invalid_email')
    expect((await a.post('/api/auth/signup').send({ ...base, weeklyGoalWorkouts: 0 })).body.error).toBe('invalid_goal')
    expect((await a.post('/api/auth/signup').send({ ...base, weeklyGoalMinutes: 5 })).body.error).toBe('invalid_goal')
  })

  it('rejects other HTTP methods and malformed JSON', async () => {
    const a = await anon()
    expect((await a.get('/api/auth/signup')).status).toBe(405)
    const bad = await a.post('/api/auth/signup').set('content-type', 'application/json').send('{"oops"')
    expect(bad.status).toBe(400)
    expect(bad.body.error).toBe('bad_json')
  })
})

describe.skipIf(!hasDb)('auth: login, me, logout', () => {
  it('logs in with the right password', async () => {
    const { credentials } = await newUser()
    const agent = request.agent(await getApp())
    const res = await agent.post('/api/auth/login').send({ email: credentials.email, password: credentials.password })
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(credentials.email)
    expect(res.body.stats).toEqual({ workoutsCompleted: 0, streak: 0 })
    expect(cookieHeader(res)).toMatch(/pf_session=[^;]+;.*HttpOnly/i)
    expect((await agent.get('/api/auth/me')).status).toBe(200)
  })

  it('fails with a wrong password or unknown email, with the same message', async () => {
    const { credentials } = await newUser()
    const a = await anon()
    const wrong = await a.post('/api/auth/login').send({ email: credentials.email, password: 'WrongPass1!' })
    const unknown = await a.post('/api/auth/login').send({ email: testEmail('nobody'), password: PASSWORD })
    expect(wrong.status).toBe(401)
    expect(unknown.status).toBe(401)
    expect(wrong.body.message).toBe(unknown.body.message)
    expect(wrong.headers['set-cookie']).toBeUndefined()
  })

  it('/api/auth/me returns the user when logged in and 401 when logged out', async () => {
    const { agent, user } = await newUser({ fullName: 'Morgan Fit' })
    const me = await agent.get('/api/auth/me')
    expect(me.status).toBe(200)
    expect(me.body.user).toMatchObject({ id: user.id, fullName: 'Morgan Fit', email: user.email })
    expect(typeof me.body.stats.workoutsCompleted).toBe('number')
    expect(typeof me.body.stats.streak).toBe('number')

    const out = await (await anon()).get('/api/auth/me')
    expect(out.status).toBe(401)
    expect(out.body.error).toBe('unauthorized')
  })

  it('logout clears the cookie and ends the session', async () => {
    const { agent } = await newUser()
    const res = await agent.post('/api/auth/logout')
    expect(res.status).toBe(200)
    expect(cookieHeader(res)).toMatch(/pf_session=;.*Max-Age=0/i)
    expect(cookieHeader(res)).toMatch(/pf_logged_in=;.*Max-Age=0/i)
    expect((await agent.get('/api/auth/me')).status).toBe(401)
  })

  it('rejects forged, tampered and wrongly-signed session tokens', async () => {
    const { agent, user } = await newUser()
    const real = cookieHeader(await agent.post('/api/auth/login').send({ email: user.email, password: PASSWORD })).match(/pf_session=([^;]+)/)[1]
    const a = await anon()

    const tampered = real.slice(0, -3) + (real.endsWith('AAA') ? 'BBB' : 'AAA')
    const otherSecret = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(String(user.id)).setExpirationTime('1h').sign(new TextEncoder().encode('x'.repeat(48)))
    const none = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: String(user.id) })).toString('base64url')}.`

    for (const token of [tampered, otherSecret, none, 'garbage']) {
      expect((await a.get('/api/auth/me').set('Cookie', `pf_session=${token}`)).status).toBe(401)
    }
    expect((await a.get('/api/auth/me').set('Cookie', `pf_session=${real}`)).status).toBe(200)
  })
})
