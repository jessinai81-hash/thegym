import { Link } from 'react-router-dom'
import Logo from '../Logo.jsx'

// Landing page links jump to its sections; inside the app they go to screens.
const landingLinks = [
  { href: '#features', label: 'Features' },
  { href: '#classes', label: 'Classes' },
  { href: '#stories', label: 'Stories' },
]
const appLinks = [
  { to: '/library', label: 'Library' },
  { to: '/classes', label: 'Classes' },
  { to: '/progress', label: 'Progress' },
]

export default function Footer({ wide = false }) {
  const linkClass = 'inline-block py-2.5 transition hover:text-fg'
  return (
    <footer className={`relative border-t hairline ${wide ? '' : 'hidden lg:block'}`}>
      <div className={`mx-auto flex flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row ${wide ? 'max-w-6xl' : 'max-w-6xl lg:px-10'}`}>
        <Logo to="/" size="sm" />
        <p>© {new Date().getFullYear()} PulseFit. Train smarter. Get stronger.</p>
        <nav className="flex gap-5" aria-label="Footer">
          {wide
            ? landingLinks.map((l) => (
                <a key={l.href} href={l.href} className={linkClass}>
                  {l.label}
                </a>
              ))
            : appLinks.map((l) => (
                <Link key={l.to} to={l.to} className={linkClass}>
                  {l.label}
                </Link>
              ))}
        </nav>
      </div>
    </footer>
  )
}
