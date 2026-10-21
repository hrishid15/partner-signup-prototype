import { formatReach, PERSONAS, CHANNELS } from '../data'
import { fullNameOf, useProto } from '../state'

/**
 * Live preview of the profile a brand sees. It exists to answer "why connect?"
 * with something the partner can watch change, instead of one line of copy.
 */
export default function BrandPreview({ compact = false }: { compact?: boolean }) {
  const { state } = useProto()
  const name = state.profile.display.trim() || state.workName.trim() || fullNameOf(state)
  const persona = PERSONAS.find((p) => p.id === state.persona)
  const first = state.connected[0]
  const firstDef = first ? CHANNELS[first.id] : null
  const total = state.connected.reduce((n, c) => n + c.reach, 0)

  return (
    <section className={`preview${compact ? ' preview-compact' : ''}`} aria-label="How brands will see you">
      <h2 className="preview-title">How brands will see you</h2>
      <div className="preview-card">
        <div className="preview-head">
          <span className="avatar" style={firstDef ? { background: firstDef.color } : undefined} aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="preview-name">{name}</p>
            <p className="preview-sub">{persona ? persona.label : 'Partner'}</p>
          </div>
        </div>

        {state.connected.length > 0 ? (
          <>
            <p className="preview-reach">
              <strong>{formatReach(total)}</strong> total followers <span className="muted">(sample)</span>
            </p>
            <ul className="preview-chips">
              {state.connected.map((c) => (
                <li key={c.id}>
                  <span className="chipdot" style={{ background: CHANNELS[c.id].color }} aria-hidden="true" />
                  {CHANNELS[c.id].name}
                  <span className="muted"> {c.handle}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="preview-empty">
            <p>No channels yet.</p>
            <p className="muted">Brands can't see your reach or your content until you connect one.</p>
          </div>
        )}
      </div>
      <p className="preview-note">Brands look at your reach, your content and your description before they approve you.</p>
    </section>
  )
}
