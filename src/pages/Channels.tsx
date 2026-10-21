import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { track } from '../analytics'
import { channelOrder, formatReach, plural, type ChannelDef } from '../data'
import { ActionBar, FlowShell } from '../components/Shell'
import BrandPreview from '../components/BrandPreview'
import ConnectSheet from '../components/ConnectSheet'
import { useProto, type Connected } from '../state'

function Row({ ch, connected, onConnect, onRemove }: { ch: ChannelDef; connected?: Connected; onConnect: () => void; onRemove: () => void }) {
  return (
    <li className={`chrow${connected ? ' chrow-on' : ''}`}>
      <span className="chbadge" style={{ background: ch.color }} aria-hidden="true">
        {ch.badge}
      </span>
      <div className="chtext">
        <p className="chname">{ch.name}</p>
        {connected ? (
          <p className="chmeta chmeta-on">
            Connected as {connected.handle}
            {connected.via === 'login' ? `, ${formatReach(connected.reach)} followers (sample)` : ' (added by link)'}
          </p>
        ) : (
          <p className="chmeta">{ch.method}</p>
        )}
      </div>
      {connected ? (
        <button type="button" id={`row-${ch.id}`} className="btn btn-quiet btn-sm" onClick={onRemove} aria-label={`Remove ${ch.name}`}>
          Remove
        </button>
      ) : (
        <button type="button" id={`row-${ch.id}`} className="btn btn-outline btn-sm" onClick={onConnect} aria-label={`Connect ${ch.name}`}>
          {ch.linkOnly ? 'Add' : 'Connect'}
        </button>
      )}
    </li>
  )
}

export default function Channels() {
  const { state, connect, disconnect, patch } = useProto()
  const nav = useNavigate()
  const [active, setActive] = useState<ChannelDef | null>(null)
  const [said, setSaid] = useState('')

  useEffect(() => {
    track('channels_viewed', { persona: state.persona })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const order = channelOrder(state.persona)
  const suggested = order.slice(0, 3)
  const more = order.slice(3)
  const n = state.connected.length
  const byId = (id: string) => state.connected.find((c) => c.id === id)

  function open(ch: ChannelDef) {
    setActive(ch)
  }

  function done(c: Connected) {
    connect(c)
    const ch = active
    setActive(null)
    setSaid(`${ch?.name ?? 'Channel'} connected as ${c.handle}.`)
    window.setTimeout(() => document.getElementById(`row-${c.id}`)?.focus(), 30)
  }

  function remove(ch: ChannelDef) {
    disconnect(ch.id)
    track('channel_removed', { channel: ch.id })
    setSaid(`${ch.name} removed.`)
  }

  function proceed() {
    if (n === 0) {
      patch({ skippedChannels: true })
      track('channels_skipped', { persona: state.persona })
    } else {
      track('channels_continued', { count: n, channels: state.connected.map((c) => c.id) })
    }
    nav('/profile')
  }

  return (
    <FlowShell step={2}>
      <div className="page page-wide">
        <Link to="/about" className="backlink">
          Back
        </Link>
        <div className="channels-grid">
          <div>
            <h1>Connect where you share</h1>
            <p className="lead">
              Brands prioritize partners with connected channels. Connect what you have, or skip this and add channels later.
            </p>

            <h2 className="group-title">Suggested for you</h2>
            <ul className="chlist">
              {suggested.map((ch) => (
                <Row key={ch.id} ch={ch} connected={byId(ch.id)} onConnect={() => open(ch)} onRemove={() => remove(ch)} />
              ))}
            </ul>

            <h2 className="group-title">More places</h2>
            <ul className="chlist">
              {more.map((ch) => (
                <Row key={ch.id} ch={ch} connected={byId(ch.id)} onConnect={() => open(ch)} onRemove={() => remove(ch)} />
              ))}
            </ul>
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
        note={
          n === 0
            ? "Skipping is fine. Without a channel, brands see a basic profile with no reach, so adding one later helps."
            : `${plural(n, 'channel', 'channels')} connected. You can add more later from your profile.`
        }
      >
        <button type="button" className={n === 0 ? 'btn btn-secondary' : 'btn btn-primary'} onClick={proceed}>
          {n === 0 ? 'Skip for now' : 'Continue'}
        </button>
      </ActionBar>

      {active && <ConnectSheet key={active.id} channel={active} onClose={() => setActive(null)} onConnected={done} />}
    </FlowShell>
  )
}
