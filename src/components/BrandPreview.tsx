import { formatReach, PERSONAS, CHANNELS } from '../data'
import { fullNameOf, useProto } from '../state'

/** Ring of slots around the partner. Each connected channel fills one, so adding a channel visibly changes the picture. */
function Orbit({ initial }: { initial: string }) {
  const { state } = useProto()
  const slots = 6
  const r = 78
  const c = 110
  return (
    <svg className="orbit" viewBox="0 0 220 220" role="img" aria-label={`${state.connected.length} of ${slots} places filled`}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="3 6" />
      <circle cx={c} cy={c} r={r - 34} fill="none" stroke="var(--line)" strokeWidth="1" />
      <ellipse cx={c} cy={c} rx={r + 12} ry={r - 30} fill="none" stroke="var(--primary)" strokeWidth="1.5" transform={`rotate(-24 ${c} ${c})`} />
      {Array.from({ length: slots }).map((_, i) => {
        const a = (-90 + i * (360 / slots)) * (Math.PI / 180)
        const x = c + r * Math.cos(a)
        const y = c + r * Math.sin(a)
        const ch = state.connected[i]
        const def = ch ? CHANNELS[ch.id] : null
        return def ? (
          <g key={i} className="orbit-dot">
            <circle cx={x} cy={y} r="17" fill={def.color} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="var(--font-display)">
              {def.badge}
            </text>
          </g>
        ) : (
          <circle key={i} cx={x} cy={y} r="13" fill="var(--paper)" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="3 3" />
        )
      })}
      <circle cx={c} cy={c} r="34" fill="var(--ink)" />
      <text x={c} y={c + 11} textAnchor="middle" fontSize="30" fontWeight="700" fill="var(--paper)" fontFamily="var(--font-display)">
        {initial}
      </text>
    </svg>
  )
}

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
      {!compact && <Orbit initial={name.charAt(0).toUpperCase()} />}
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
