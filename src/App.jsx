import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Library from './pages/Library.jsx'
import LiveWorkout from './pages/LiveWorkout.jsx'
import Progress from './pages/Progress.jsx'
import Classes from './pages/Classes.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/workout" element={<LiveWorkout />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
