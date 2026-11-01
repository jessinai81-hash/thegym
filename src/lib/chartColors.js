import { useApp } from '../context/AppContext.jsx'

// SVG presentation attributes can't read CSS variables, so charts get concrete colors per theme.
const palette = {
  dark: { bar: '#9fd12f', cursor: 'rgba(255,255,255,0.05)', dotRing: '#07090c', crosshair: 'rgba(255,255,255,0.25)' },
  light: { bar: '#84cc16', cursor: 'rgba(15,23,42,0.05)', dotRing: '#ffffff', crosshair: 'rgba(15,23,42,0.3)' },
}

export default function useChartColors() {
  const { theme } = useApp()
  return palette[theme] ?? palette.dark
}
