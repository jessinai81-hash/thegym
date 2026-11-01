import { useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar.jsx'
import BottomNav from './BottomNav.jsx'
import TopBar from './TopBar.jsx'
import Footer from './Footer.jsx'

export default function AppShell() {
  const location = useLocation()
  const outlet = useOutlet()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <Ambient />
      <Sidebar />
      <div className="relative lg:pl-72">
        <TopBar />
        <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-4 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}>{outlet}</motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
      <BottomNav />
    </div>
  )
}

function Ambient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-0" aria-hidden="true">
      <div className="orb -left-32 -top-40 h-[28rem] w-[28rem] bg-lime/40" />
      <div className="orb -right-40 top-1/3 h-[26rem] w-[26rem] bg-cyan/40" />
      <div className="grid-bg absolute inset-0" />
    </div>
  )
}
