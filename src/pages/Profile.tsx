import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { track } from '../analytics'
import { BRAND, CHANNELS, draftName, listJoin, makeDraft, REVIEW_WINDOW, shortName } from '../data'
import { ActionBar, FlowShell } from '../components/Shell'
import { fullNameOf, useProto } from '../state'

const MAX = 1000

export default function Profile() {
  const { state, patch, setProfile } = useProto()
  const nav = useNavigate()
  const p = state.profile
  const channelNames = state.connected.map((c) => draftName(c.id))
  const spokenNames = listJoin(state.connected.map((c) => shortName(c.id)))
  const first = state.connected[0] ? CHANNELS[state.connected[0].id] : null
  const display = p.display || state.workName || fullNameOf(state)

  function draft(variant: number) {
    return makeDraft({ persona: state.persona, name: display.split(' ')[0] ?? '', channelNames, variant })
  }

  useEffect(() => {
    track('profile_viewed', { channels: state.connected.length })
    if (!p.description && !p.draftTouched) {
      setProfile({ description: draft(p.draftVariant), draftUsed: true })
      track('profile_draft_shown', { from_channels: channelNames.length > 0 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function regenerate() {
    const v = p.draftVariant + 1
    setProfile({ draftVariant: v, description: draft(v), draftTouched: false, draftUsed: true })
    track('profile_draft_regenerated', { variant: v })
  }

  function submit() {
    track('application_submitted', {
      entry: state.entry,
      channels: state.connected.length,
      description_length: p.description.length,
      draft_unedited: p.draftUsed && !p.draftTouched,
    })
    patch({ submitted: true })
    nav('/submitting')
  }

  const left = MAX - p.description.length
  const empty = p.description.trim().length === 0

  return (
    <FlowShell step={3}>
      <div className="page">
        <p className="eyebrow">Step 4 of 4 · Optional</p>
        <h1>Check your profile</h1>
        <p className="lead">This is what brands read first. You can change it any time in Settings.</p>

        <div className="profile-id">
          <span className="avatar avatar-lg" style={first ? { background: first.color } : undefined} aria-hidden="true">
            {display.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="profile-photo-note">{first ? `Photo from ${first.name} (sample).` : 'No photo yet. Connect a channel later and we will use its photo.'}</p>
          </div>
        </div>

        <label className="field">
          <span className="field-label">Display name</span>
          <input type="text" value={display} onChange={(e) => setProfile({ display: e.target.value })} />
        </label>

        <div className="field">
          <label className="field-label" htmlFor="desc">
            About you
          </label>
          <p className="field-help" id="desc-help">
            {p.draftUsed && !p.draftTouched
              ? channelNames.length > 0
                ? `We drafted this from your ${spokenNames}. Edit anything.`
                : 'We drafted this from what you told us. Connect a channel later for a more specific one.'
              : 'Say who you are and what you like to promote.'}
          </p>
          <textarea
            id="desc"
            rows={7}
            maxLength={MAX}
            value={p.description}
            aria-describedby="desc-help desc-count"
            onChange={(e) => setProfile({ description: e.target.value, draftTouched: true })}
          />
          <div className="desc-foot">
            <span id="desc-count" className="counter" aria-live="polite">
              {left} {left === 1 ? 'character' : 'characters'} left
            </span>
            <span className="desc-tools">
              <button type="button" className="textlink" onClick={regenerate}>
                {p.draftTouched ? 'Regenerate (replaces your edits)' : 'Regenerate'}
              </button>
              {!empty && (
                <button
                  type="button"
                  className="textlink"
                  onClick={() => setProfile({ description: '', draftTouched: true })}
                >
                  Clear
                </button>
              )}
            </span>
          </div>
        </div>

        <p className="proto-note">
          <strong>Prototype note.</strong> The draft is written from templates here. In the product it would come from the AI service.
        </p>
      </div>

      <ActionBar
        back="/channels"
        note={
          state.entry === 'invite'
            ? `Next, ${BRAND.name} reviews your request.`
            : `Next, our team reviews your application. It usually takes ${REVIEW_WINDOW}.`
        }
      >
        <button type="button" className="btn btn-primary" onClick={submit}>
          {empty ? 'Skip and submit' : 'Submit application'}
        </button>
      </ActionBar>
    </FlowShell>
  )
}
