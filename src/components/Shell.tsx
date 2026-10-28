import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BRAND, REVIEW_WINDOW, plural } from '../data'
import { fullNameOf, useProto } from '../state'

export interface StepDef {
  key: string
  label: string
  note?: string
  minutes: number
  path: string
}

export const STEPS: StepDef[] = [
  { key: 'account', label: 'Create account', minutes: 1, path: '/signup' },
  { key: 'about', label: 'About you', minutes: 1, path: '/about' },
  { key: 'channels', label: 'Connect channels', note: 'At least one', minutes: 1, path: '/channels' },
  { key: 'profile', label: 'Your profile', note: 'Optional', minutes: 2, path: '/profile' },
]

export function minutesLeft(fromIndex: number): number {
  return STEPS.slice(fromIndex).reduce((sum, s) => sum + s.minutes, 0)
}

/** Text wordmark in the impact.com style (red dot between "impact" and "com"). Not the official logo file. */
export function Mark() {
  return (
    <span className="wordmark" role="img" aria-label="impact.com">
      impact<span className="wordmark-dot" />com
    </span>
  )
}

export function BrandBadge({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`brandbadge brandbadge-${size}`} aria-hidden="true">
      {BRAND.initials}
    </span>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FlowShell({ step, children }: { step: number; children: ReactNode }) {
  const { state } = useProto()
  const left = minutesLeft(step)
  const pct = Math.round((step / STEPS.length) * 100)
  const joining = state.entry === 'invite' ? `Joining ${BRAND.name}` : 'Joining the marketplace'
  const who = step > 0 ? state.workName.trim() || fullNameOf(state) : ''

  return (
    <div className="flow">
      <header className="apphead">
        <Link to="/" className="apphead-brand">
          <Mark />
        </Link>
        <span className="apphead-label">Partner application</span>
        {who && <span className="apphead-who">{who}</span>}
        {step > 0 && (
          <span className="apphead-saved">
            Saved
            <span className="apphead-saved-tick">
              <Check />
            </span>
          </span>
        )}
      </header>

      <aside className="rail" aria-label="Your progress">
        <p className="rail-title">Complete your application</p>
        <p className="rail-joining">{joining}</p>

        <p className="rail-progress">
          <span className="rail-pct">{pct}% complete</span>
          <span className="rail-left">About {plural(left, 'min', 'min')} left</span>
        </p>
        <div className="rail-bar" aria-hidden="true">
          <span style={{ width: `${Math.max(pct, 4)}%` }} />
        </div>

        <ol className="steps">
          {STEPS.map((s, i) => {
            const status = i < step ? 'done' : i === step ? 'current' : 'todo'
            return (
              <li key={s.key} className={`step step-${status}`} aria-current={status === 'current' ? 'step' : undefined}>
                <span className="step-dot">{status === 'done' ? <Check /> : i + 1}</span>
                <span className="step-text">
                  <span className="step-label">{s.label}</span>
                  {status === 'done' ? <span className="step-note">Complete</span> : s.note && <span className="step-note">{s.note}</span>}
                </span>
                {status === 'current' && (
                  <span className="step-arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            )
          })}
        </ol>

        <p className="rail-foot">
          {state.entry === 'marketplace'
            ? `After step 4, our team reviews your application. It usually takes ${REVIEW_WINDOW}.`
            : `After step 4, ${BRAND.name} reviews your request.`}
        </p>
      </aside>

      <div className="topbar" role="group" aria-label="Your progress">
        <div className="topbar-row">
          <span className="topbar-label">{STEPS[step].label}</span>
          <span className="topbar-step">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <div className="topbar-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Signup progress">
          <span style={{ width: `${Math.max(pct, 6)}%` }} />
        </div>
        <p className="topbar-time">About {plural(left, 'minute', 'minutes')} left</p>
      </div>

      <main className="flow-main">{children}</main>
    </div>
  )
}

/** Sticky footer: optional Back on the left, a note, then the forward action on the right (as in the Figma mockup). */
export function ActionBar({ children, note, back }: { children: ReactNode; note?: ReactNode; back?: string }) {
  return (
    <div className="actionbar">
      <div className="actionbar-inner">
        {back && (
          <Link to={back} className="btn btn-outline actionbar-back">
            <span aria-hidden="true">←</span> Back
          </Link>
        )}
        {note && <p className="actionbar-note">{note}</p>}
        <div className="actionbar-buttons">{children}</div>
      </div>
    </div>
  )
}
