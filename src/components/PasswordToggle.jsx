import { Eye, EyeOff } from 'lucide-react'

export default function PasswordToggle({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="-m-2.5 shrink-0 p-2.5 text-muted transition hover:text-fg"
      aria-label={shown ? 'Hide password' : 'Show password'}
    >
      {shown ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  )
}
