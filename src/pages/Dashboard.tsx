import { Link, useNavigate } from 'react-router-dom'
import { track } from '../analytics'
import { BRAND, REVIEW_WINDOW } from '../data'
import { BrandBadge, Mark } from '../components/Shell'
import { fullNameOf, useProto } from '../state'

function IconHelp() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" />
    </svg>
  )
}
function IconBell() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M6 17V11a6 6 0 1 1 12 0v6l1.5 2h-15z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 21h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function Dashboard() {
  const { state, reset } = useProto()
  const nav = useNavigate()
  const invited = state.entry === 'invite'
  const name = fullNameOf(state)
  const outcome = state.outcome
  const hasChannel = state.connected.length > 0
  const hasDesc = state.profile.description.trim().length > 0

  const nextSteps = [
    !hasChannel && { title: 'Connect a channel', body: 'Brands can see your reach once you do.', to: '/channels', cta: 'Connect' },
    !hasDesc && { title: 'Add a description', body: 'A few lines about you helps brands decide.', to: '/profile', cta: 'Add' },
  ].filter(Boolean) as { title: string; body: string; to: string; cta: string }[]

  return (
    <div className="dash">
      <header className="dash-head">
        <Link to="/dashboard" className="rail-brand dark">
          <Mark />
          <span>Partners</span>
        </Link>
        <nav className="dash-nav" aria-label="Main">
          <a href="#home" aria-current="page" onClick={(e) => e.preventDefault()}>
            Home
          </a>
          <a href="#programs" onClick={(e) => e.preventDefault()}>
            Programs
          </a>
          <a href="#messages" onClick={(e) => e.preventDefault()}>
            Messages
          </a>
        </nav>
        <div className="dash-tools">
          <button type="button" className="iconbtn" title="Help">
            <IconHelp />
            <span>Help</span>
          </button>
          <button type="button" className="iconbtn" title="Notifications">
            <IconBell />
            <span>Notifications</span>
          </button>
          <details className="account">
            <summary>
              <span className="avatar avatar-sm" aria-hidden="true">
                {name.charAt(0).toUpperCase()}
              </span>
              <span>Account</span>
            </summary>
            <div className="menu">
              <p className="menu-name">{name}</p>
              <a href="#profile" onClick={(e) => e.preventDefault()}>
                Profile
              </a>
              <a href="#settings" onClick={(e) => e.preventDefault()}>
                Settings
              </a>
              <button
                type="button"
                onClick={() => {
                  reset()
                  nav('/')
                }}
              >
                Sign out
              </button>
            </div>
          </details>
        </div>
      </header>

      <main className="dash-main">
        <h1>Welcome, {state.account.first.trim() || 'Alex'}</h1>

        {outcome === 'review' && (
          <section className="banner banner-info" aria-label="Application status">
            <div>
              <p className="banner-title">{invited ? `Waiting for ${BRAND.name}` : 'Your application is in review'}</p>
              <p>
                {invited ? 'They will review your request and you will get an email.' : `Reviews usually take ${REVIEW_WINDOW}. We will email you.`}
              </p>
            </div>
            <Link className="btn btn-outline btn-sm" to="/result" onClick={() => track('status_viewed')}>
              View status
            </Link>
          </section>
        )}

        {outcome === 'declined' && (
          <section className="banner banner-warn" aria-label="Application status">
            <div>
              <p className="banner-title">Your application was not approved yet</p>
              <p>Update your profile and you can apply again.</p>
            </div>
            <div className="banner-actions">
              <Link className="btn btn-primary btn-sm" to="/channels" onClick={() => track('reapply_clicked', { from: 'dashboard' })}>
                Update profile and reapply
              </Link>
              <Link className="btn btn-quiet btn-sm" to="/result">
                See why
              </Link>
            </div>
          </section>
        )}

        {outcome === 'approved' && (
          <section className="banner banner-ok" aria-label="Application status">
            <div>
              <p className="banner-title">{invited ? `You're in the ${BRAND.name} program` : "You're approved for the marketplace"}</p>
              <p>{invited ? 'Your tracking links are ready.' : 'Brands can now find you.'}</p>
            </div>
          </section>
        )}

        {invited && (
          <section className="program" aria-labelledby="program-title">
            <BrandBadge size="md" />
            <div>
              <h2 id="program-title">{BRAND.name}</h2>
              <p className="muted">{BRAND.offer}</p>
            </div>
            <span className={`pill pill-${outcome}`}>{outcome === 'review' ? 'Waiting for approval' : outcome === 'approved' ? 'Active' : 'Not approved'}</span>
          </section>
        )}

        {nextSteps.length > 0 && (
          <section aria-labelledby="next-title">
            <h2 id="next-title">Next steps</h2>
            <ul className="todo">
              {nextSteps.map((s) => (
                <li key={s.title}>
                  <div>
                    <p className="todo-title">{s.title}</p>
                    <p className="muted">{s.body}</p>
                  </div>
                  <Link className="btn btn-outline btn-sm" to={s.to}>
                    {s.cta}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {nextSteps.length === 0 && outcome !== 'declined' && (
          <section>
            <h2>Next steps</h2>
            <p className="muted">Your profile is complete. We will tell you here as soon as something changes.</p>
          </section>
        )}
      </main>
    </div>
  )
}
