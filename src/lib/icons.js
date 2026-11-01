import {
  Calendar, Dumbbell, Flame, Shield, Sunrise, Timer, Trophy, Users, Zap,
} from 'lucide-react'

// Lets mock data reference icons by name.
export const iconMap = { Calendar, Dumbbell, Flame, Shield, Sunrise, Timer, Trophy, Users, Zap }

export function getIcon(name) {
  return iconMap[name] ?? Dumbbell
}
