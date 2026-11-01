import { Calendar, Dumbbell, LayoutDashboard, LineChart, Timer, UserRound } from 'lucide-react'

export const navItems = [
  { to: '/dashboard', label: 'Today', icon: LayoutDashboard },
  { to: '/library', label: 'Library', icon: Dumbbell },
  { to: '/workout', label: 'Workout', icon: Timer, featured: true },
  { to: '/classes', label: 'Classes', icon: Calendar },
  { to: '/progress', label: 'Progress', icon: LineChart },
  { to: '/profile', label: 'Profile', icon: UserRound },
]
