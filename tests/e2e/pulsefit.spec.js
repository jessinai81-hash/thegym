import { expect, test } from '@playwright/test'

const GROUPS = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']
const PASSWORD = 'E2eTest123!'

// Every browser-test account matches pf-e2e-%@example.com and is deleted in global teardown.
const email = (project) => `pf-e2e-${project}-${Date.now()}@example.com`

/** Fails the test on any uncaught page error or unexpected console error. */
function watchForErrors(page) {
  const problems = []
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`console ${m.type()}: ${m.text()}`)
  })
  return problems
}

const visible = (page, selector) => page.locator(`${selector}:visible`)

/** Counters animate when they scroll into view, so look at them the way a user would. */
async function expectCounter(locator, text) {
  await locator.scrollIntoViewIfNeeded()
  await expect(locator).toHaveText(text)
}

test('landing page: branding, animated live counters, CTA goes to sign up', async ({ page }) => {
  const problems = watchForErrors(page)
  await page.goto('/')

  await expect(page).toHaveTitle(/PulseFit/)
  await expect(page.locator('header').getByRole('link', { name: 'PulseFit home' })).toHaveText('PulseFit')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Train smarter\.\s*Get stronger\./)
  await expect(page.locator('footer')).toContainText('PulseFit')

  // Counters count up from 0 to the real /api/stats numbers.
  const stats = await (await page.request.get('/api/stats')).json()
  const key = Object.entries(stats).sort((a, b) => b[1] - a[1])[0][0] // the biggest number animates the longest
  const counter = page.getByTestId(`stat-${key}`).locator('span.tabular-nums')
  await counter.scrollIntoViewIfNeeded()
  const seen = new Set()
  for (let i = 0; i < 40; i++) {
    const t = await counter.textContent().catch(() => null)
    if (t) seen.add(t)
    await page.waitForTimeout(50)
  }
  await expect(counter).toHaveText(stats[key].toLocaleString('en-US'))
  if (stats[key] > 1) expect(seen.size, `counter values seen: ${[...seen].join(', ')}`).toBeGreaterThan(1)

  await page.getByRole('link', { name: /Start Your Workout/ }).first().click()
  await expect(page).toHaveURL(/\/signup$/)
  expect(problems).toEqual([])
})

test('full journey: sign up → library → live workout → dashboard → refresh → logout', async ({ page }, testInfo) => {
  const problems = watchForErrors(page)
  const userEmail = email(testInfo.project.name)

  await test.step('sign up and land on the dashboard', async () => {
    await page.goto('/signup')
    await page.getByLabel('Your name').fill('Playwright Pat')
    await page.getByLabel('Email', { exact: true }).fill(userEmail)
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'More workouts' }).click() // goal 5 workouts/week
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Playwright')
    await expect(page.getByText('No workout yet today.')).toBeVisible()
    await expect(visible(page, '[data-testid="streak-count"]')).toHaveText('0')
  })

  await test.step('library: every muscle-group filter shows only its 5 cards', async () => {
    await page.goto('/library')
    const cards = page.locator('article')
    await expect(cards).toHaveCount(30)
    for (const group of GROUPS) {
      await page.getByRole('tab', { name: group }).click()
      await expect(cards).toHaveCount(5)
      await expect(cards.locator('p.eyebrow')).toHaveText(Array(5).fill(group))
    }
    await page.getByRole('tab', { name: 'All' }).click()
    await expect(cards).toHaveCount(30)
  })

  await test.step('add 2 exercises to today’s workout', async () => {
    await page.getByRole('tab', { name: 'Core' }).click()
    for (const name of ['Plank Hold', 'Pallof Press']) {
      const card = page.locator('article', { hasText: name })
      await card.getByRole('button', { name: /Add to today.s workout/ }).click()
      // optimistic state appears at once; the button re-enables once the server has saved it
      await expect(card.getByRole('button', { name: /^In today.s workout$/ })).toBeEnabled()
    }
    await expect(page.getByRole('link', { name: /Start today.s workout/ })).toContainText('2')
  })

  await test.step('dashboard shows today’s workout, click Start', async () => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: 'Core Day' })).toBeVisible()
    await expect(page.getByText('Plank Hold')).toBeVisible()
    await expect(page.getByText('Pallof Press')).toBeVisible()
    await expect(page.getByText('0/6 sets')).toBeVisible()
    await page.getByRole('link', { name: 'Start', exact: true }).click()
    await expect(page).toHaveURL(/\/workout$/)
  })

  await test.step('live workout: rest timer counts down, tick every set, finish, confetti', async () => {
    const sets = page.locator('button[aria-pressed]')
    await expect(sets).toHaveCount(6)
    await sets.first().click()

    const timer = page.getByTestId('rest-timer')
    await expect(timer).toHaveText(/^0:(29|30)$/) // Plank Hold rests 30 s
    const toSeconds = (t) => Number(t.split(':')[0]) * 60 + Number(t.split(':')[1])
    const before = toSeconds(await timer.textContent())
    await page.waitForTimeout(2500)
    expect(toSeconds(await timer.textContent())).toBeLessThan(before)
    await expect(page.getByText('Recover…')).toBeVisible()

    // The tick survives a refresh mid-workout.
    await page.reload()
    await expect(page.locator('button[aria-pressed="true"]')).toHaveCount(1)

    const remaining = page.locator('button[aria-pressed="false"]')
    while ((await remaining.count()) > 0) {
      await remaining.first().click()
      await page.waitForTimeout(150)
    }
    await expect(page.locator('body > canvas')).toBeAttached() // canvas-confetti draws on a body-level canvas
    await expect(page.getByRole('dialog')).toContainText('crushed!')
    await expect(page.getByRole('dialog')).toContainText('Day 1 of a brand-new streak')
  })

  await test.step('dashboard updates: streak, chart and rings', async () => {
    await page.getByRole('button', { name: 'Back to dashboard' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByText('Completed today')).toBeVisible()
    await expectCounter(visible(page, '[data-testid="streak-count"]'), '1')
    // rings: workouts 1 of 5 → 20%, goals hit includes "trained today"
    await expectCounter(visible(page, '[data-testid="ring-value"]').first(), '1')
    await expect(visible(page, '[data-testid="ring-percent"]').first()).toHaveText('20%')
    await expect(visible(page, '[data-testid="ring-percent"]').nth(2)).toHaveText('33%') // 1 of 3 goals
    const percents = await visible(page, '[data-testid="ring-percent"]').allTextContents()
    for (const p of percents) {
      expect(p).not.toContain('NaN')
      expect(Number.parseInt(p, 10)).toBeLessThanOrEqual(100)
    }
    // chart: today's bar is drawn and the 7-day total is at least 1 minute
    await expect(page.locator('.recharts-bar-rectangle path').first()).toBeAttached()
    const total = page.getByTestId('activity-total')
    await total.scrollIntoViewIfNeeded()
    await expect(total).toHaveText(/^[1-9]\d*\s+active minutes/)
  })

  await test.step('refresh: everything is still there', async () => {
    await page.reload()
    await expect(page.getByText('Completed today')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Core Day' })).toBeVisible()
    await expectCounter(visible(page, '[data-testid="streak-count"]'), '1')
    await page.goto('/workout')
    await expect(page.getByText('Today’s workout is in the books')).toBeVisible()
  })

  await test.step('logout, then protected pages redirect to login', async () => {
    await visible(page, 'button[aria-label="Log out"]').first().click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible()
    for (const path of ['/dashboard', '/library', '/workout', '/profile']) {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login$/)
    }
    // and logging back in returns to the page you wanted
    await page.goto('/library')
    await page.getByLabel('Email', { exact: true }).fill(userEmail)
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page).toHaveURL(/\/library$/)
  })

  expect(problems).toEqual([])
})
