import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearEvents, useEvents } from '../analytics'
import { useProto, type ConnectBehavior, type Entry, type Outcome } from '../state'

const JUMPS: { label: string; to: string }[] = [
  { label: 'Landing page', to: '/' },
  { label: '1 Create account', to: '/signup' },
  { label: '1 Email form', to: '/signup/email' },
  { label: '2 About you', to: '/about' },
  { label: '3 Connect channels', to: '/channels' },
  { label: '4 Your profile', to: '/profile' },
  { label: 'Submitting', to: '/submitting' },
  { label: 'Result', to: '/result' },
  { label: 'Dashboard', to: '/dashboard' },
]

export default function ProtoBar() {
  const { state, patch, reset } = useProto()
  const nav = useNavigate()
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const [showEvents, setShowEvents] = useState(false)
  const events = useEvents()
  const onChanges = loc.pathname === '/changes'

  function restart() {
    reset()
    nav(state.entry === 'invite' ? '/signup' : '/')
  }

  return (
    <div className="protobar">
      <div className="protobar-row">
        <span className="protobar-tag">Prototype</span>
        <button type="button" className="protobar-toggle" aria-expanded={open} aria-controls="protobar-panel" onClick={() => setOpen(!open)}>
          {open ? 'Hide controls' : 'Show controls'}
        </button>
        <span className="protobar-spacer" />
        {onChanges ? (
          <Link className="protobar-link" to="/">
            <span className="pb-long">Back to the prototype</span>
            <span className="pb-short">Prototype</span>
          </Link>
        ) : (
          <Link className="protobar-link" to="/changes">
            <span className="pb-long">What changed and why</span>
            <span className="pb-short">What changed</span>
          </Link>
        )}
      </div>

      {open && (
        <div id="protobar-panel" className="protobar-panel">
          <label className="pb-field">
            <span>Entry</span>
            <select value={state.entry} onChange={(e) => patch({ entry: e.target.value as Entry })}>
              <option value="marketplace">Marketplace signup</option>
              <option value="invite">Brand invite</option>
            </select>
          </label>
          <label className="pb-field">
            <span>Review outcome</span>
            <select value={state.outcome} onChange={(e) => patch({ outcome: e.target.value as Outcome })}>
              <option value="review">In review</option>
              <option value="declined">Not approved</option>
              <option value="approved">Approved</option>
            </select>
          </label>
          <label className="pb-field">
            <span>Channel sign-ins</span>
            <select value={state.connectBehavior} onChange={(e) => patch({ connectBehavior: e.target.value as ConnectBehavior })}>
              <option value="works">Work</option>
              <option value="fails">Fail (to see the error)</option>
            </select>
          </label>
          <label className="pb-field">
            <span>Jump to</span>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) nav(e.target.value)
              }}
            >
              <option value="">Choose a screen</option>
              {JUMPS.map((j) => (
                <option key={j.to} value={j.to}>
                  {j.label}
                </option>
              ))}
            </select>
          </label>
          <div className="pb-actions">
            <button type="button" className="pb-btn" onClick={restart}>
              Restart
            </button>
            <button type="button" className="pb-btn" aria-pressed={showEvents} onClick={() => setShowEvents(!showEvents)}>
              Events ({events.length})
            </button>
          </div>
        </div>
      )}

      {open && showEvents && (
        <div className="protobar-events" aria-live="polite">
          <div className="pb-events-head">
            <strong>Tracked events</strong>
            <span>These are what we would send to PostHog.</span>
            <button type="button" className="pb-btn" onClick={clearEvents}>
              Clear
            </button>
          </div>
          {events.length === 0 ? (
            <p className="pb-empty">Nothing yet. Click through the flow.</p>
          ) : (
            <ul>
              {events.slice(0, 12).map((e) => (
                <li key={e.id}>
                  <code>{e.name}</code>
                  {e.props && <span>{JSON.stringify(e.props)}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
