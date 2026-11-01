// Static content that isn't stored in the database yet (marketing copy, the class booking
// screen, progress history and achievements). Exercises, workouts, stats and the dashboard
// all come from /api now.

export const membership = {
  name: 'Pulse Elite',
  level: 18,
  xp: 7420,
  xpNext: 8000,
  homeGym: 'PulseFit Downtown',
}

export const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

export const strengthHistory = {
  'Bench Press': [
    { week: 'Jul 6', kg: 72.5 }, { week: 'Jul 13', kg: 75 }, { week: 'Jul 20', kg: 75 },
    { week: 'Jul 27', kg: 77.5 }, { week: 'Aug 3', kg: 80 }, { week: 'Aug 10', kg: 80 },
    { week: 'Aug 17', kg: 82.5 }, { week: 'Aug 24', kg: 82.5 }, { week: 'Aug 31', kg: 85 },
    { week: 'Sep 7', kg: 87.5 }, { week: 'Sep 14', kg: 87.5 }, { week: 'Sep 21', kg: 90 },
    { week: 'Sep 28', kg: 92.5 }, { week: 'Oct 5', kg: 92.5 }, { week: 'Oct 12', kg: 95 },
    { week: 'Oct 19', kg: 97.5 },
  ],
  'Back Squat': [
    { week: 'Jul 6', kg: 100 }, { week: 'Jul 13', kg: 102.5 }, { week: 'Jul 20', kg: 105 },
    { week: 'Jul 27', kg: 107.5 }, { week: 'Aug 3', kg: 107.5 }, { week: 'Aug 10', kg: 110 },
    { week: 'Aug 17', kg: 112.5 }, { week: 'Aug 24', kg: 115 }, { week: 'Aug 31', kg: 115 },
    { week: 'Sep 7', kg: 117.5 }, { week: 'Sep 14', kg: 120 }, { week: 'Sep 21', kg: 122.5 },
    { week: 'Sep 28', kg: 122.5 }, { week: 'Oct 5', kg: 125 }, { week: 'Oct 12', kg: 127.5 },
    { week: 'Oct 19', kg: 130 },
  ],
  Deadlift: [
    { week: 'Jul 6', kg: 130 }, { week: 'Jul 13', kg: 132.5 }, { week: 'Jul 20', kg: 135 },
    { week: 'Jul 27', kg: 137.5 }, { week: 'Aug 3', kg: 140 }, { week: 'Aug 10', kg: 142.5 },
    { week: 'Aug 17', kg: 142.5 }, { week: 'Aug 24', kg: 145 }, { week: 'Aug 31', kg: 147.5 },
    { week: 'Sep 7', kg: 150 }, { week: 'Sep 14', kg: 152.5 }, { week: 'Sep 21', kg: 152.5 },
    { week: 'Sep 28', kg: 155 }, { week: 'Oct 5', kg: 157.5 }, { week: 'Oct 12', kg: 160 },
    { week: 'Oct 19', kg: 162.5 },
  ],
  'Overhead Press': [
    { week: 'Jul 6', kg: 45 }, { week: 'Jul 13', kg: 45 }, { week: 'Jul 20', kg: 47.5 },
    { week: 'Jul 27', kg: 47.5 }, { week: 'Aug 3', kg: 50 }, { week: 'Aug 10', kg: 50 },
    { week: 'Aug 17', kg: 52.5 }, { week: 'Aug 24', kg: 52.5 }, { week: 'Aug 31', kg: 52.5 },
    { week: 'Sep 7', kg: 55 }, { week: 'Sep 14', kg: 55 }, { week: 'Sep 21', kg: 57.5 },
    { week: 'Sep 28', kg: 57.5 }, { week: 'Oct 5', kg: 60 }, { week: 'Oct 12', kg: 60 },
    { week: 'Oct 19', kg: 62.5 },
  ],
}

export const personalRecords = [
  { lift: 'Deadlift', value: '162.5 kg', date: 'Oct 19', delta: '+2.5 kg', tier: 'gold' },
  { lift: 'Back Squat', value: '130 kg', date: 'Oct 19', delta: '+2.5 kg', tier: 'gold' },
  { lift: 'Bench Press', value: '97.5 kg', date: 'Oct 19', delta: '+2.5 kg', tier: 'silver' },
  { lift: 'Overhead Press', value: '62.5 kg', date: 'Oct 19', delta: '+2.5 kg', tier: 'silver' },
  { lift: '5K Row', value: '19:42', date: 'Oct 2', delta: '−0:31', tier: 'bronze' },
  { lift: 'Pull-Ups (max)', value: '18 reps', date: 'Sep 24', delta: '+3 reps', tier: 'bronze' },
]

export const classTypes = {
  Yoga: { color: 'from-violet-400/30 to-fuchsia-400/10', dot: 'bg-violet-400', blurb: 'Flow, breathe, recover.' },
  HIIT: { color: 'from-orange-400/30 to-rose-400/10', dot: 'bg-orange-400', blurb: 'Short bursts. Max effort.' },
  Spin: { color: 'from-sky-400/30 to-blue-500/10', dot: 'bg-sky-400', blurb: 'Climb, sprint, sweat.' },
  Boxing: { color: 'from-emerald-400/30 to-teal-400/10', dot: 'bg-emerald-400', blurb: 'Combos, footwork, power.' },
}

export const weekDays = [
  { key: 'mon', short: 'Mon', date: 26 },
  { key: 'tue', short: 'Tue', date: 27 },
  { key: 'wed', short: 'Wed', date: 28 },
  { key: 'thu', short: 'Thu', date: 29 },
  { key: 'fri', short: 'Fri', date: 30 },
  { key: 'sat', short: 'Sat', date: 31 },
  { key: 'sun', short: 'Sun', date: 1 },
]

export const classes = [
  { id: 'c1', day: 'mon', type: 'Yoga', title: 'Sunrise Vinyasa', time: '06:30', duration: 50, coach: 'Priya N.', room: 'Studio A', spots: 6, capacity: 20 },
  { id: 'c2', day: 'mon', type: 'HIIT', title: 'Lunch Burn', time: '12:15', duration: 30, coach: 'Jordan K.', room: 'Turf', spots: 2, capacity: 16 },
  { id: 'c3', day: 'mon', type: 'Spin', title: 'Rhythm Ride', time: '18:00', duration: 45, coach: 'Sam T.', room: 'Cycle Lab', spots: 0, capacity: 24 },
  { id: 'c4', day: 'tue', type: 'Boxing', title: 'Fight Club Fundamentals', time: '07:00', duration: 60, coach: 'Marcus D.', room: 'Ring', spots: 8, capacity: 14 },
  { id: 'c5', day: 'tue', type: 'Yoga', title: 'Mobility & Restore', time: '19:30', duration: 45, coach: 'Priya N.', room: 'Studio A', spots: 11, capacity: 20 },
  { id: 'c6', day: 'wed', type: 'HIIT', title: 'Tabata Thunder', time: '06:00', duration: 30, coach: 'Jordan K.', room: 'Turf', spots: 5, capacity: 16 },
  { id: 'c7', day: 'wed', type: 'Spin', title: 'Hill Climb 45', time: '12:00', duration: 45, coach: 'Lena R.', room: 'Cycle Lab', spots: 14, capacity: 24 },
  { id: 'c8', day: 'wed', type: 'Boxing', title: 'Power Combos', time: '18:30', duration: 50, coach: 'Marcus D.', room: 'Ring', spots: 1, capacity: 14 },
  { id: 'c9', day: 'thu', type: 'Yoga', title: 'Power Yoga', time: '07:00', duration: 60, coach: 'Aiko M.', room: 'Studio A', spots: 3, capacity: 20 },
  { id: 'c10', day: 'thu', type: 'Spin', title: 'Neon Night Ride', time: '20:00', duration: 45, coach: 'Sam T.', room: 'Cycle Lab', spots: 9, capacity: 24 },
  { id: 'c11', day: 'fri', type: 'HIIT', title: 'Friday Finisher', time: '17:30', duration: 40, coach: 'Jordan K.', room: 'Turf', spots: 0, capacity: 16 },
  { id: 'c12', day: 'fri', type: 'Boxing', title: 'Heavy Bag Rounds', time: '19:00', duration: 45, coach: 'Marcus D.', room: 'Ring', spots: 6, capacity: 14 },
  { id: 'c13', day: 'sat', type: 'Spin', title: 'Weekend Warrior Ride', time: '09:00', duration: 60, coach: 'Lena R.', room: 'Cycle Lab', spots: 4, capacity: 24 },
  { id: 'c14', day: 'sat', type: 'Yoga', title: 'Yin & Stretch', time: '11:00', duration: 60, coach: 'Aiko M.', room: 'Studio A', spots: 12, capacity: 20 },
]

export const achievements = [
  { id: 'a1', name: 'Iron Streak', desc: '10-day training streak', icon: 'Flame', earned: true },
  { id: 'a2', name: 'Century Club', desc: '100 workouts logged', icon: 'Dumbbell', earned: true },
  { id: 'a3', name: 'Early Bird', desc: '20 workouts before 7 AM', icon: 'Sunrise', earned: true },
  { id: 'a4', name: 'PR Machine', desc: 'Set 10 personal records', icon: 'Trophy', earned: true },
  { id: 'a5', name: 'Class Act', desc: 'Attend 25 group classes', icon: 'Users', earned: true },
  { id: 'a6', name: 'Double Bodyweight', desc: 'Deadlift 2× bodyweight', icon: 'Zap', earned: false, progress: 0.82 },
  { id: 'a7', name: 'Marathon Month', desc: '1,500 active minutes in a month', icon: 'Timer', earned: false, progress: 0.64 },
  { id: 'a8', name: 'Unbreakable', desc: '30-day training streak', icon: 'Shield', earned: false, progress: 0.4 },
]

export const quotes = [
  { text: 'The only bad workout is the one that didn’t happen.', author: 'Unknown' },
  { text: 'Strength doesn’t come from what you can do. It comes from overcoming the things you once thought you couldn’t.', author: 'Rikki Rogers' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln (attributed)' },
  { text: 'Small daily improvements are the key to staggering long-term results.', author: 'Robin Sharma' },
  { text: 'You don’t have to be extreme, just consistent.', author: 'Unknown' },
  { text: 'Sweat is just fat crying.', author: 'Gym wisdom' },
  { text: 'Motivation gets you started. Habit keeps you going.', author: 'Jim Ryun' },
]

export const features = [
  { icon: 'Dumbbell', title: 'Smart workout plans', text: 'Programs that adapt to your progress, schedule and recovery.' },
  { icon: 'Timer', title: 'Live workout mode', text: 'Rest timers, set tracking and a big finish when you crush it.' },
  { icon: 'Trophy', title: 'Progress you can see', text: 'Strength curves, PRs and badges that keep you coming back.' },
  { icon: 'Calendar', title: 'Book classes in a tap', text: 'Yoga, HIIT, Spin and Boxing — reserve your spot in seconds.' },
]

export const testimonials = [
  { name: 'Danielle O.', role: 'Member since 2023', text: 'I’ve tried every gym app. PulseFit is the first one I actually open every single day.' },
  { name: 'Theo M.', role: 'Powerlifter', text: 'Watching my squat line climb week after week is ridiculously motivating.' },
  { name: 'Riya S.', role: 'HIIT regular', text: 'Booking a class takes two taps. The confetti after a workout? Chef’s kiss.' },
]
