import { useEffect, useRef } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ProtoBar from './components/ProtoBar'
import { ProtoProvider } from './state'
import About from './pages/About'
import Changes from './pages/Changes'
import Channels from './pages/Channels'
import Dashboard from './pages/Dashboard'
import EmailSignup from './pages/EmailSignup'
import Landing from './pages/Landing'
import Profile from './pages/Profile'
import Result from './pages/Result'
import Signup from './pages/Signup'
import Submitting from './pages/Submitting'

const TITLES: Record<string, string> = {
  '/': 'Join as a partner',
  '/signup': 'Create your account',
  '/signup/email': 'Create your account with email',
  '/about': 'About you',
  '/channels': 'Connect channels',
  '/profile': 'Your profile',
  '/submitting': 'Submitting your application',
  '/result': 'Your application status',
  '/dashboard': 'Dashboard',
  '/changes': 'What changed and why',
}

/** Moves focus to the page heading on navigation, so keyboard and screen reader users start at the top. */
function RouteEffects() {
  const { pathname } = useLocation()
  const first = useRef(true)

  useEffect(() => {
    document.title = `${TITLES[pathname] ?? 'Partner signup'} | Partner signup prototype`
    window.scrollTo(0, 0)
    if (first.current) {
      first.current = false
      return
    }
    const id = requestAnimationFrame(() => {
      const h = document.querySelector<HTMLElement>('h1')
      if (h) {
        h.setAttribute('tabindex', '-1')
        h.focus({ preventScroll: true })
      }
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <ProtoProvider>
      <HashRouter>
        <a className="skip" href="#content" onClick={(e) => {
          e.preventDefault()
          document.querySelector<HTMLElement>('h1')?.focus()
        }}>
          Skip to the page
        </a>
        <ProtoBar />
        <div id="content">
          <RouteEffects />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup/email" element={<EmailSignup />} />
            <Route path="/about" element={<About />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/submitting" element={<Submitting />} />
            <Route path="/result" element={<Result />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/changes" element={<Changes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </HashRouter>
    </ProtoProvider>
  )
}
