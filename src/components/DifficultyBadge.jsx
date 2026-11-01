const levels = {
  Beginner: { bars: 1, cls: 'text-cyan' },
  Intermediate: { bars: 2, cls: 'text-lime' },
  Advanced: { bars: 3, cls: 'text-orange-600 dark:text-orange-400' },
}

export default function DifficultyBadge({ level }) {
  const { bars, cls } = levels[level] ?? levels.Beginner
  return (
    <span className={`chip ${cls}`}>
      <span className="flex items-end gap-[2px]" aria-hidden="true">
        {[1, 2, 3].map((b) => (
          <span
            key={b}
            className={`w-[3px] rounded-full ${b <= bars ? 'bg-current' : 'bg-current opacity-25'}`}
            style={{ height: 4 + b * 3 }}
          />
        ))}
      </span>
      {level}
    </span>
  )
}
