import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { track } from '../analytics'
import { PERSONAS } from '../data'
import { ActionBar, FlowShell } from '../components/Shell'
import { fullNameOf, useProto } from '../state'

export default function About() {
  const { state, patch } = useProto()
  const nav = useNavigate()
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    track('about_viewed', { preselected: state.persona })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const name = state.workName || fullNameOf(state)

  function next() {
    if (!state.persona) {
      setBlocked(true)
      document.getElementById('persona-group')?.focus()
      return
    }
    track('persona_selected', { persona: state.persona })
    nav('/channels')
  }

  return (
    <FlowShell step={1}>
      <div className="page">
        <Link to="/signup" className="backlink">
          Back
        </Link>
        <h1>What best describes you?</h1>
        <p className="lead">Your answer decides which channels and brands we suggest. You can change it later.</p>

        <fieldset className="personas" id="persona-group" tabIndex={-1} aria-describedby={blocked ? 'persona-msg' : undefined}>
          <legend className="visually-hidden">I am a</legend>
          {PERSONAS.map((p) => (
            <label key={p.id} className={`persona${state.persona === p.id ? ' on' : ''}`}>
              <input
                type="radio"
                name="persona"
                value={p.id}
                checked={state.persona === p.id}
                onChange={() => {
                  patch({ persona: p.id })
                  setBlocked(false)
                }}
              />
              <span className="persona-text">
                <span className="persona-label">{p.label}</span>
                <span className="persona-blurb">{p.blurb}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <label className="field narrow">
          <span className="field-label">Your name, or your company's name</span>
          <input type="text" value={name} onChange={(e) => patch({ workName: e.target.value })} />
          <span className="field-help">Brands see this on your profile.</span>
        </label>
      </div>

      <ActionBar
        note={
          blocked ? (
            <span id="persona-msg" className="field-error" role="alert">
              Pick the option that fits best to continue.
            </span>
          ) : undefined
        }
      >
        <button type="button" className="btn btn-primary" aria-disabled={!state.persona} onClick={next}>
          Continue
        </button>
      </ActionBar>
    </FlowShell>
  )
}
