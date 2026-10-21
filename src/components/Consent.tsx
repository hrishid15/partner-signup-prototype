import { forwardRef } from 'react'
import { useProto } from '../state'

interface Props {
  error?: boolean
}

/** The one place a partner accepts the terms. Used on both signup screens. */
const Consent = forwardRef<HTMLInputElement, Props>(function Consent({ error }, ref) {
  const { state, patch } = useProto()
  return (
    <div className={`consent${error ? ' consent-error' : ''}`}>
      <label className="check">
        <input
          ref={ref}
          id="consent-box"
          type="checkbox"
          checked={state.consent}
          aria-describedby="consent-msg"
          onChange={(e) => patch({ consent: e.target.checked })}
        />
        <span>
          I have read and accept the <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Use</a> and{' '}
          <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
        </span>
      </label>
      <p id="consent-msg" className={error ? 'field-error' : 'field-help'} role={error ? 'alert' : undefined}>
        {error ? 'Accept the terms to continue.' : state.consent ? '' : 'Accept the terms to continue.'}
      </p>
    </div>
  )
})

export default Consent
