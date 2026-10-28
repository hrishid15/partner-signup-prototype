import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { track } from '../analytics'
import { FlowShell } from '../components/Shell'
import Consent from '../components/Consent'
import { useProto } from '../state'

type Errors = Partial<Record<'email' | 'first' | 'last' | 'password' | 'phone' | 'consent', string>>

const rules = [
  { id: 'len', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { id: 'letter', label: 'One letter', test: (v: string) => /[a-z]/i.test(v) },
  { id: 'num', label: 'One number', test: (v: string) => /\d/.test(v) },
]

function validate(v: { email: string; first: string; last: string; password: string; phone: string }, consent: boolean): Errors {
  const e: Errors = {}
  if (!v.email.trim()) e.email = 'Enter your email address.'
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email.trim())) e.email = 'That email is missing something. Try name@example.com.'
  if (!v.first.trim()) e.first = 'Enter your first name.'
  if (!v.last.trim()) e.last = 'Enter your last name.'
  if (!v.password) e.password = 'Choose a password.'
  else if (!rules.every((r) => r.test(v.password))) e.password = 'Your password needs everything in the list below.'
  const digits = v.phone.replace(/\D/g, '')
  if (!digits) e.phone = 'Enter your mobile number. We use it to secure your account.'
  else if (digits.length < 10) e.phone = 'That number looks short. Include the area code.'
  if (!consent) e.consent = 'Accept the terms to continue.'
  return e
}

export default function EmailSignup() {
  const { state, setAccount, patch } = useProto()
  const nav = useNavigate()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState(false)
  const a = state.account

  function run(next = { ...a, password }) {
    const e = validate(next, state.consent)
    setErrors(e)
    return e
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    setTouched(true)
    const e = run()
    const first = Object.keys(e)[0]
    if (first) {
      document.getElementById(first === 'consent' ? 'consent-box' : `f-${first}`)?.focus()
      track('signup_form_invalid', { fields: Object.keys(e) })
      return
    }
    setAccount({ method: 'email' })
    patch({ workName: state.workName || `${a.first} ${a.last}`.trim() })
    track('account_created', { method: 'email' })
    nav('/about')
  }

  const show_ = (k: keyof Errors) => (touched ? errors[k] : undefined)

  return (
    <FlowShell step={0}>
      <div className="page">
        <Link to="/signup" className="backlink">
          Back
        </Link>
        <p className="eyebrow">Step 1 of 4</p>
        <h1>Create your account</h1>
        <p className="lead">Use an email you check often. We send your review decision there.</p>

        <form onSubmit={onSubmit} noValidate className="form">
          <label className="field">
            <span className="field-label">Email</span>
            <input
              id="f-email"
              type="email"
              autoComplete="email"
              value={a.email}
              aria-invalid={show_('email') ? true : undefined}
              aria-describedby={show_('email') ? 'e-email' : undefined}
              onChange={(e) => setAccount({ email: e.target.value })}
              onBlur={() => touched && run()}
            />
            {show_('email') && (
              <span id="e-email" className="field-error">
                {errors.email}
              </span>
            )}
          </label>

          <div className="row2">
            <label className="field">
              <span className="field-label">First name</span>
              <input
                id="f-first"
                type="text"
                autoComplete="given-name"
                value={a.first}
                aria-invalid={show_('first') ? true : undefined}
                aria-describedby={show_('first') ? 'e-first' : undefined}
                onChange={(e) => setAccount({ first: e.target.value })}
              />
              {show_('first') && (
                <span id="e-first" className="field-error">
                  {errors.first}
                </span>
              )}
            </label>
            <label className="field">
              <span className="field-label">Last name</span>
              <input
                id="f-last"
                type="text"
                autoComplete="family-name"
                value={a.last}
                aria-invalid={show_('last') ? true : undefined}
                aria-describedby={show_('last') ? 'e-last' : undefined}
                onChange={(e) => setAccount({ last: e.target.value })}
              />
              {show_('last') && (
                <span id="e-last" className="field-error">
                  {errors.last}
                </span>
              )}
            </label>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="f-password">
              Password
            </label>
            <div className="pw">
              <input
                id="f-password"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                aria-invalid={show_('password') ? true : undefined}
                aria-describedby="pw-rules"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="pw-toggle" aria-pressed={show} onClick={() => setShow(!show)}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            <ul id="pw-rules" className="rules">
              {rules.map((r) => {
                const ok = r.test(password)
                return (
                  <li key={r.id} className={ok ? 'ok' : ''}>
                    <span aria-hidden="true">{ok ? '✓' : '○'}</span> {r.label}
                    <span className="visually-hidden">{ok ? ', met' : ', not met yet'}</span>
                  </li>
                )
              })}
            </ul>
            {show_('password') && <span className="field-error">{errors.password}</span>}
          </div>

          <label className="field">
            <span className="field-label">Mobile number</span>
            <input
              id="f-phone"
              type="tel"
              autoComplete="tel"
              value={a.phone}
              aria-invalid={show_('phone') ? true : undefined}
              aria-describedby={show_('phone') ? 'e-phone' : 'h-phone'}
              onChange={(e) => setAccount({ phone: e.target.value })}
            />
            {show_('phone') ? (
              <span id="e-phone" className="field-error">
                {errors.phone}
              </span>
            ) : (
              <span id="h-phone" className="field-help">
                We text a code to this number when you sign in. We don't use it for marketing.
              </span>
            )}
          </label>

          {!state.consent && <Consent error={show_('consent') !== undefined} />}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block">
              Create account
            </button>
          </div>
        </form>
      </div>
    </FlowShell>
  )
}
