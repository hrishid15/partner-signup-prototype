import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { track } from '../analytics'
import { BRAND, REVIEW_WINDOW } from '../data'
import { BrandBadge, Mark } from '../components/Shell'
import { emailOf, useProto, type State } from '../state'

function declineReasons(state: State): { text: string; fix: string; to: string }[] {
  const out: { text: string; fix: string; to: string }[] = []
  if (state.connected.length === 0)
    out.push({ text: 'No channel is connected, so we could not see your reach or your content.', fix: 'Connect a channel', to: '/channels' })
  if (state.profile.description.trim().length < 80)
    out.push({ text: 'Your description is short. Brands use it to decide if you fit their program.', fix: 'Edit your description', to: '/profile' })
  if (out.length === 0)
    out.push({ text: 'We could not find enough recent public activity on your connected channels.', fix: 'Add another channel', to: '/channels' })
  return out
}

function Timeline({ at }: { at: 1 | 2 }) {
  const items = ['Submitted', 'In review', 'Decision']
  return (
    <ol className="timeline" aria-label="Application status">
      {items.map((label, i) => {
        const status = i < at ? 'done' : i === at ? 'now' : 'todo'
        return (
          <li key={label} className={`tl tl-${status}`} aria-current={status === 'now' ? 'step' : undefined}>
            <span className="tl-dot" aria-hidden="true" />
            <span>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default function Result() {
  const { state, patch } = useProto()
  const nav = useNavigate()
  const invited = state.entry === 'invite'
  const outcome = state.outcome

  useEffect(() => {
    track('result_viewed', { outcome, entry: state.entry })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome])

  const email = emailOf(state)

  return (
    <div className="result-screen">
      <header className="result-top">
        <Link to="/" className="rail-brand dark">
          <Mark />
          <span>Partners</span>
        </Link>
        <button
          type="button"
          className="btn btn-quiet btn-sm"
          onClick={() => {
            track('result_closed', { outcome })
            nav('/dashboard')
          }}
        >
          Close and go to dashboard
        </button>
      </header>

      <main className="result-main">
        {outcome === 'review' && (
          <>
            {invited && <BrandBadge size="lg" />}
            <h1>{invited ? `Your request is with ${BRAND.name}` : 'Your application is in review'}</h1>
            <p className="lead">
              We'll email <strong>{email}</strong> as soon as there is a decision. It also shows on your dashboard.
            </p>
            <Timeline at={1} />
            <dl className="facts">
              <div>
                <dt>Usual wait</dt>
                <dd>{REVIEW_WINDOW}</dd>
              </div>
              <div>
                <dt>Who reviews</dt>
                <dd>{invited ? BRAND.name : 'The partner quality team'}</dd>
              </div>
            </dl>
            <p className="proto-note">
              <strong>Prototype note.</strong> The wait is a placeholder until we have real review times.
            </p>

            <h2>While you wait</h2>
            <ul className="todo">
              {state.connected.length === 0 && (
                <li>
                  <div>
                    <p className="todo-title">Connect a channel</p>
                    <p className="muted">Reviewers and brands can't see your reach yet.</p>
                  </div>
                  <Link className="btn btn-outline btn-sm" to="/channels">
                    Connect
                  </Link>
                </li>
              )}
              {state.profile.description.trim().length === 0 && (
                <li>
                  <div>
                    <p className="todo-title">Add a description</p>
                    <p className="muted">A few lines on who you are helps brands decide.</p>
                  </div>
                  <Link className="btn btn-outline btn-sm" to="/profile">
                    Add
                  </Link>
                </li>
              )}
              <li>
                <div>
                  <p className="todo-title">Take the Academy course on first partnerships</p>
                  <p className="muted">About 15 minutes. Sample item.</p>
                </div>
              </li>
              <li>
                <div>
                  <p className="todo-title">Browse the resource hub</p>
                  <p className="muted">Guides on how partnerships work. Sample item.</p>
                </div>
              </li>
            </ul>
            <div className="result-actions">
              <button type="button" className="btn btn-primary" onClick={() => nav('/dashboard')}>
                Go to dashboard
              </button>
            </div>
          </>
        )}

        {outcome === 'declined' && (
          <>
            <h1>Not approved yet</h1>
            <p className="lead">Your application did not meet the marketplace requirements this time. Fix the points below and you can apply again.</p>
            <h2>What to change</h2>
            <ul className="todo">
              {declineReasons(state).map((r) => (
                <li key={r.text}>
                  <div>
                    <p className="todo-title">{r.text}</p>
                  </div>
                  <Link
                    className="btn btn-outline btn-sm"
                    to={r.to}
                    onClick={() => {
                      patch({ submitted: false })
                      track('decline_fix_clicked', { fix: r.fix })
                    }}
                  >
                    {r.fix}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="proto-note">
              <strong>Prototype note.</strong> These reasons are built from what you entered. The real screen needs the review team's reason codes.
            </p>

            <div className="result-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  track('reapply_clicked')
                  patch({ submitted: false })
                  nav('/channels')
                }}
              >
                Update profile and reapply
              </button>
              <p className="muted">After you update, a review takes {REVIEW_WINDOW}.</p>
            </div>

            <h2>Another way in</h2>
            <p>
              Brands can invite you straight to their program. An invite skips the marketplace review, and the brand decides.
            </p>
          </>
        )}

        {outcome === 'approved' && (
          <>
            {invited && <BrandBadge size="lg" />}
            <h1>{invited ? `You're in the ${BRAND.name} program` : "You're approved for the marketplace"}</h1>
            <p className="lead">
              {invited ? 'You can start with their tracking links and offers right away.' : 'Brands can now find you and you can apply to their programs.'}
            </p>
            <div className="result-actions">
              <button type="button" className="btn btn-primary" onClick={() => nav('/dashboard')}>
                {invited ? 'Open the program' : 'Go to dashboard'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
