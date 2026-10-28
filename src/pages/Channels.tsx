import { Fragment, useEffect, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { track } from '../analytics'
import { BRAND, channelOrder, formatReach, listJoin, plural, shortName, type ChannelDef } from '../data'
import { ActionBar, FlowShell } from '../components/Shell'
import BrandPreview from '../components/BrandPreview'
import ConnectPanel from '../components/ConnectPanel'
import { useProto, type Connected } from '../state'

/** Two tiles across on wide screens, one on phones. Needed so the open panel can sit under its own row. */
function useColumns(): number {
  const query = '(min-width: 600px)'
  const [wide, setWide] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : true))
  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia(query)
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide ? 2 : 1
}

interface TileProps {
  ch: ChannelDef
  connected?: Connected
  open: boolean
  confirming: boolean
  onConnect: () => void
  onAskDisconnect: () => void
  onKeep: () => void
  onDisconnect: () => void
}

function Tile({ ch, connected, open, confirming, onConnect, onAskDisconnect, onKeep, onDisconnect }: TileProps) {
  return (
    <li className={`tile${connected ? ' tile-on' : ''}${open ? ' tile-open' : ''}`}>
      <span className="chbadge chbadge-tint" style={{ '--c': ch.color } as CSSProperties} aria-hidden="true">
        {ch.badge}
      </span>
      <div className="chtext">
        <p className="chname">{ch.name}</p>
        {confirming ? (
          <p className="chmeta" role="alert">
            Disconnect {ch.name}? Brands will stop seeing it.
          </p>
        ) : connected ? (
          <p className="chmeta chmeta-on">
            <span aria-hidden="true">✓ </span>
            {connected.via === 'login' ? `${connected.handle}, ${formatReach(connected.reach)} followers (sample)` : `${connected.handle}. We'll check it in review.`}
          </p>
        ) : (
          <p className="chmeta">{ch.method}</p>
        )}
      </div>
      <div className="tile-act">
        {confirming ? (
          <>
            <button type="button" className="btn btn-danger btn-sm" id={`row-${ch.id}`} onClick={onDisconnect}>
              Disconnect
            </button>
            <button type="button" className="btn btn-quiet btn-sm" onClick={onKeep}>
              Keep
            </button>
          </>
        ) : connected ? (
          <button type="button" id={`row-${ch.id}`} className="btn btn-outline btn-sm" onClick={onAskDisconnect} aria-label={`Disconnect ${ch.name}`}>
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            id={`row-${ch.id}`}
            className="btn btn-dark btn-sm"
            aria-expanded={open}
            aria-label={`${ch.linkOnly ? 'Add' : 'Connect'} ${ch.name}`}
            onClick={onConnect}
          >
            {ch.linkOnly ? 'Add' : 'Connect'}
          </button>
        )}
        {!confirming && <span className={`chstatus${connected ? ' chstatus-on' : ''}`}>{connected ? 'Connected' : 'Not connected'}</span>}
      </div>
    </li>
  )
}

export default function Channels() {
  const { state, connect, disconnect } = useProto()
  const nav = useNavigate()
  const cols = useColumns()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [said, setSaid] = useState('')
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    track('channels_viewed', { persona: state.persona, entry: state.entry })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const order = channelOrder(state.persona)
  const top = order.slice(0, 3)
  const more = order.slice(3)
  const n = state.connected.length
  const byId = (id: string) => state.connected.find((c) => c.id === id)
  const invited = state.entry === 'invite'

  function done(c: Connected, ch: ChannelDef) {
    connect(c)
    setBlocked(false)
    setActiveId(null)
    setSaid(`${ch.name} connected as ${c.handle}. Saved.`)
    window.setTimeout(() => document.getElementById(`row-${c.id}`)?.focus(), 30)
  }

  function closePanel(ch: ChannelDef) {
    setActiveId(null)
    window.setTimeout(() => document.getElementById(`row-${ch.id}`)?.focus(), 30)
  }

  function remove(ch: ChannelDef) {
    disconnect(ch.id)
    setConfirmId(null)
    track('channel_disconnected', { channel: ch.id })
    setSaid(`${ch.name} disconnected.`)
    window.setTimeout(() => document.getElementById(`row-${ch.id}`)?.focus(), 30)
  }

  /** Connecting is required: with nothing connected, Continue explains why and moves focus to the first channel. */
  function proceed() {
    if (n === 0) {
      setBlocked(true)
      track('channels_continue_blocked', { persona: state.persona, entry: state.entry })
      document.getElementById(`row-${top[0].id}`)?.focus()
      return
    }
    track('channels_continued', { count: n, channels: state.connected.map((c) => c.id), entry: state.entry })
    nav('/profile')
  }

  function renderGroup(list: ChannelDef[]) {
    const rows: ChannelDef[][] = []
    for (let i = 0; i < list.length; i += cols) rows.push(list.slice(i, i + cols))
    return rows.map((row) => {
      const active = row.find((c) => c.id === activeId)
      return (
        <Fragment key={row[0].id}>
          <ul className="tiles">
            {row.map((ch) => (
              <Tile
                key={ch.id}
                ch={ch}
                connected={byId(ch.id)}
                open={activeId === ch.id}
                confirming={confirmId === ch.id}
                onConnect={() => {
                  setConfirmId(null)
                  setActiveId(ch.id)
                }}
                onAskDisconnect={() => {
                  setActiveId(null)
                  setConfirmId(ch.id)
                  track('channel_disconnect_asked', { channel: ch.id })
                  window.setTimeout(() => document.getElementById(`row-${ch.id}`)?.focus(), 30)
                }}
                onKeep={() => {
                  setConfirmId(null)
                  window.setTimeout(() => document.getElementById(`row-${ch.id}`)?.focus(), 30)
                }}
                onDisconnect={() => remove(ch)}
              />
            ))}
          </ul>
          {active && !byId(active.id) && (
            <ConnectPanel key={active.id} channel={active} onClose={() => closePanel(active)} onConnected={(c) => done(c, active)} />
          )}
        </Fragment>
      )
    })
  }

  return (
    <FlowShell step={2}>
      <div className="page page-wide">
        <div className="channels-grid">
          <div>
            <p className="eyebrow">Step 3 of 4</p>
            <h1>Show brands where you share</h1>
            <p className="lead">
              {invited
                ? `Connect at least one channel so ${BRAND.name} can see your reach. A link works if you'd rather not sign in.`
                : `Connect at least one channel to continue. Brands look at ${listJoin(top.map((c) => shortName(c.id)))} first.`}
            </p>
            <p className="needone">
              <span className="needone-count">{n === 0 ? 'None connected yet' : `${plural(n, 'channel', 'channels')} connected`}</span>
              <span className="muted">One is enough to continue</span>
            </p>

            <h2 className="group-title">Recommended for you</h2>
            {renderGroup(top)}

            <h2 className="group-title">More places</h2>
            {renderGroup(more)}

            <details className="linkedin" onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && track('linkedin_explainer_opened')}>
              <summary>Why isn't LinkedIn here?</summary>
              <p>
                We can't verify LinkedIn accounts, so connections from it are declined automatically. We left it out rather than let you connect something that won't count. You can still mention it in your profile description.
              </p>
            </details>
          </div>

          <div className="channels-side">
            <BrandPreview />
          </div>
        </div>

        <p className="visually-hidden" role="status" aria-live="polite">
          {said}
        </p>
      </div>

      <ActionBar
        back="/about"
        note={
          n === 0 ? (
            blocked ? (
              <span id="channels-msg" className="field-error" role="alert">
                Connect at least one channel to continue. No sign-in? Choose Add a link instead.
              </span>
            ) : (
              'Connect at least one channel to continue. Adding a link works too.'
            )
          ) : (
            `${plural(n, 'channel', 'channels')} connected. Your progress is saved automatically.`
          )
        }
      >
        <button type="button" className="btn btn-primary" aria-disabled={n === 0} aria-describedby={blocked && n === 0 ? 'channels-msg' : undefined} onClick={proceed}>
          Continue
        </button>
      </ActionBar>
    </FlowShell>
  )
}
