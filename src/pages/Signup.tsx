import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { track } from '../analytics'
import { BRAND, PERSONAS, REVIEW_WINDOW, type Persona } from '../data'
import { BrandBadge, FlowShell } from '../components/Shell'
import Consent from '../components/Consent'
import { useProto } from '../state'

export default function Signup() {
  const { state, patch, setAccount } = useProto()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const consentRef = useRef<HTMLInputElement>(null)
  const [consentError, setConsentError] = useState(false)
  const invited = state.entry === 'invite'

  useEffect(() => {
    track('signup_viewed', { entry: state.entry })
    const as = params.get('as') as Persona | null
    if (as && PERSONAS.some((p) => p.id === as)) patch({ persona: as })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (state.consent) setConsentError(false)
  }, [state.consent])

  function gate(): boolean {
    if (state.consent) return true
    setConsentError(true)
    consentRef.current?.focus()
    track('consent_blocked')
    return false
  }

  function social(method: 'google' | 'apple') {
    if (!gate()) return
    setAccount({ method, email: 'alex@example.com', first: state.account.first || 'Alex', last: state.account.last || 'Rivera' })
    track('account_created', { method })
    nav('/about')
  }

  function email() {
    if (!gate()) return
    track('signup_method_chosen', { method: 'email' })
    nav('/signup/email')
  }

  return (
    <FlowShell step={0}>
      <div className="page">
        {invited ? (
          <header className="invite-head">
            <BrandBadge size="lg" />
            <div>
              <h1>{BRAND.name} invited you to join their partner program</h1>
              <p className="lead">{BRAND.offer}</p>
              <p className="proto-note">
                <strong>Prototype note.</strong> Brand name and offer are sample text. In the product they come from the invite.
              </p>
            </div>
          </header>
        ) : (
          <header>
            <h1>Free to join. Start earning faster.</h1>
            <p className="lead">Create your partner account. It takes about 5 minutes.</p>
          </header>
        )}

        <div className="expect" aria-label="What to expect">
          <p className="expect-title">What to expect</p>
          <ul>
            <li>Four short steps. Two of them are optional.</li>
            {invited ? (
              <li>{BRAND.name} reviews your request after you submit.</li>
            ) : (
              <li>Our team reviews marketplace applications for quality. It usually takes {REVIEW_WINDOW}.</li>
            )}
          </ul>
        </div>

        <div className="signup-options">
          <button type="button" className="btn btn-outline btn-block" aria-disabled={!state.consent} onClick={() => social('google')}>
            Continue with Google
          </button>
          <button type="button" className="btn btn-outline btn-block" aria-disabled={!state.consent} onClick={() => social('apple')}>
            Continue with Apple
          </button>
          <div className="or" aria-hidden="true">
            <span>or</span>
          </div>
          <button type="button" className="btn btn-primary btn-block" aria-disabled={!state.consent} onClick={email}>
            Sign up with email
          </button>
        </div>

        <Consent ref={consentRef} error={consentError} />

        <p className="signin-line">
          Already have an account?{' '}
          <a href="#signin" onClick={(e) => e.preventDefault()}>
            Sign in
          </a>
        </p>
      </div>
    </FlowShell>
  )
}
