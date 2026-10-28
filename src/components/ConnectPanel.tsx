import { useEffect, useRef, useState, type FormEvent } from 'react'
import { track } from '../analytics'
import { sampleReach, type ChannelDef } from '../data'
import { useProto, firstNameOf, type Connected } from '../state'

type View = 'login' | 'link' | 'working' | 'error'

interface Props {
  channel: ChannelDef
  onClose: () => void
  onConnected: (c: Connected) => void
}

function handleFrom(raw: string, fallback: string): string {
  const v = raw.trim().replace(/^https?:\/\//, '').replace(/^www\./, '')
  if (!v) return fallback
  const at = v.match(/@([\w.]+)/)
  if (at) return `@${at[1]}`
  const last = v.split('/').filter(Boolean).pop() ?? v
  return last.includes('.') && !v.includes('/') ? v : `@${last.replace(/^@/, '')}`
}

/** What the thing being entered is called, in running text. */
function noun(channel: ChannelDef): string {
  if (channel.id === 'website') return 'website address'
  if (channel.id === 'other') return 'link'
  return `${channel.name} link`
}

function validLink(channel: ChannelDef, raw: string): string | null {
  const v = raw.trim()
  if (!v) return `Enter your ${noun(channel)}. For example, ${channel.linkExample}.`
  if (v.length < 3) return 'That looks too short. Paste the full link or your @handle.'
  const isHandle = /^@[\w.]{2,}$/.test(v)
  const looksLikeLink = /[\w-]+\.[a-z]{2,}/i.test(v)
  if (channel.linkOnly && !looksLikeLink) return `That doesn't look like an address. Try something like ${channel.linkExample}.`
  if (!isHandle && !looksLikeLink) return `Use your @handle or a full link, like ${channel.linkExample}.`
  return null
}

/** Shown before anything is connected, so the partner knows what they are agreeing to. */
function Disclosure({ channel, viaLink }: { channel: ChannelDef; viaLink: boolean }) {
  return (
    <dl className="disclose">
      <div>
        <dt>Why we ask</dt>
        <dd>{channel.why}</dd>
      </div>
      <div>
        <dt>{viaLink ? 'What we keep' : 'What we read'}</dt>
        <dd>
          <ul>
            {(viaLink ? ['The link you enter, nothing else', 'We check it during review'] : channel.uses).map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </dd>
      </div>
      <div>
        <dt>Your control</dt>
        <dd>We only read. Disconnect any time, here or in Settings, and it disappears from your profile.</dd>
      </div>
    </dl>
  )
}

export default function ConnectPanel({ channel, onClose, onConnected }: Props) {
  const { state } = useProto()
  const head = useRef<HTMLHeadingElement>(null)
  const [view, setView] = useState<View>(channel.linkOnly ? 'link' : 'login')
  const [link, setLink] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const baseHandle = `@${firstNameOf(state).toLowerCase()}`

  useEffect(() => {
    head.current?.focus()
    track('channel_panel_opened', { channel: channel.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (view !== 'working') return
    const t = window.setTimeout(() => {
      if (state.connectBehavior === 'fails') {
        track('channel_connect_failed', { channel: channel.id, reason: 'tab_closed', attempt })
        setView('error')
        return
      }
      const handle = channel.id === 'website' ? 'yoursite.com' : baseHandle
      const c: Connected = { id: channel.id, handle, via: 'login', reach: sampleReach(channel.id + handle) }
      track('channel_connect_succeeded', { channel: channel.id, via: 'login' })
      onConnected(c)
    }, 1500)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, attempt])

  function startLogin() {
    track('channel_connect_started', { channel: channel.id, via: 'login', opens: 'new_tab' })
    setAttempt((n) => n + 1)
    setView('working')
  }

  function submitLink(e: FormEvent) {
    e.preventDefault()
    const problem = validLink(channel, link)
    if (problem) {
      setErr(problem)
      track('channel_link_invalid', { channel: channel.id })
      return
    }
    const handle = handleFrom(link, baseHandle)
    const c: Connected = { id: channel.id, handle, via: 'link', reach: sampleReach(channel.id + handle) }
    track('channel_link_added', { channel: channel.id })
    onConnected(c)
  }

  const title =
    view === 'error'
      ? `Couldn't connect ${channel.name}`
      : view === 'working'
        ? `Waiting for ${channel.name}`
        : view === 'link'
          ? channel.id === 'website'
            ? 'Add your website'
            : channel.id === 'other'
              ? 'Add a link'
              : `Add your ${channel.name} link`
          : `Connect ${channel.name}`

  const id = `cp-${channel.id}`

  return (
    <section className="cpanel" aria-labelledby={`${id}-title`}>
      <div className="cpanel-head">
        <h3 id={`${id}-title`} ref={head} tabIndex={-1}>
          {title}
        </h3>
        <button type="button" className="btn btn-quiet btn-sm" onClick={onClose}>
          Close
        </button>
      </div>

      {view === 'login' && (
        <>
          <p className="cpanel-lead">
            {channel.name} opens in a new tab. Sign in there and this page updates on its own.
          </p>
          {channel.id === 'instagram' && (
            <p className="cpanel-hint">
              No Facebook account? Choose <strong>Log in with Instagram</strong> in the new tab. <span className="muted">(Pending engineering check.)</span>
            </p>
          )}
          <Disclosure channel={channel} viaLink={false} />
          <div className="cpanel-actions">
            <button type="button" className="btn btn-dark" onClick={startLogin}>
              Continue with {channel.name}
              <span className="newtab" aria-hidden="true">
                ↗
              </span>
              <span className="visually-hidden"> (opens a new tab)</span>
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setView('link')}>
              Add a link instead
            </button>
          </div>
        </>
      )}

      {view === 'working' && (
        <>
          <div className="cpanel-wait" role="status">
            <span className="spinner" aria-hidden="true" />
            <p>
              Finish signing in to {channel.name} in the other tab. We'll bring you back here when it's done.
            </p>
          </div>
          <div className="cpanel-actions">
            <button type="button" className="btn btn-quiet" onClick={() => setView('login')}>
              Cancel
            </button>
          </div>
        </>
      )}

      {view === 'error' && (
        <>
          <div className="cpanel-error" role="alert">
            <p>
              <strong>The {channel.name} tab closed before sign-in finished.</strong> Nothing was connected.
            </p>
            <ul>
              <li>Allow pop-ups for this site, then try again.</li>
              <li>Check that you're signed in to the right {channel.name} account.</li>
            </ul>
          </div>
          <div className="cpanel-actions">
            <button type="button" className="btn btn-dark" onClick={startLogin}>
              Try again
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setView('link')}>
              Add {channel.name} link instead
            </button>
          </div>
        </>
      )}

      {view === 'link' && (
        <form onSubmit={submitLink} noValidate>
          <label className="field">
            <span className="field-label">
              {channel.id === 'website' ? 'Website address' : channel.id === 'other' ? 'Link' : `Your ${channel.name} link or handle`}
            </span>
            <input
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={link}
              placeholder={channel.placeholder}
              aria-invalid={err ? true : undefined}
              aria-describedby={err ? `${id}-err` : `${id}-help`}
              onChange={(e) => {
                setLink(e.target.value)
                if (err) setErr(null)
              }}
            />
            {err ? (
              <span id={`${id}-err`} className="field-error">
                {err}
              </span>
            ) : (
              <span id={`${id}-help`} className="field-help">
                No sign-in needed. Brands see the link, and we check it during review.
              </span>
            )}
          </label>
          <Disclosure channel={channel} viaLink />
          <div className="cpanel-actions">
            <button type="submit" className="btn btn-dark">
              {channel.id === 'website' ? 'Add website' : channel.id === 'other' ? 'Add link' : `Add ${channel.name}`}
            </button>
            {!channel.linkOnly && (
              <button type="button" className="btn btn-quiet" onClick={() => setView('login')}>
                Sign in instead
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  )
}
