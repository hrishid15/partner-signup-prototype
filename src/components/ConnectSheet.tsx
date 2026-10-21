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

export default function ConnectSheet({ channel, onClose, onConnected }: Props) {
  const { state } = useProto()
  const ref = useRef<HTMLDialogElement>(null)
  const [view, setView] = useState<View>(channel.linkOnly ? 'link' : 'login')
  const [link, setLink] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const baseHandle = `@${firstNameOf(state).toLowerCase()}`

  useEffect(() => {
    const el = ref.current
    if (el && !el.open) el.showModal()
  }, [])

  useEffect(() => {
    if (view !== 'working') return
    const t = window.setTimeout(() => {
      if (state.connectBehavior === 'fails') {
        track('channel_connect_failed', { channel: channel.id, reason: 'window_closed', attempt })
        setView('error')
        return
      }
      const handle = channel.id === 'website' ? 'yoursite.com' : baseHandle
      const c: Connected = { id: channel.id, handle, via: 'login', reach: sampleReach(channel.id + handle) }
      track('channel_connect_succeeded', { channel: channel.id, via: 'login' })
      onConnected(c)
    }, 1300)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, attempt])

  function startLogin() {
    track('channel_connect_started', { channel: channel.id, via: 'login' })
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
        ? `Connecting ${channel.name}`
        : view === 'link'
          ? channel.id === 'website'
            ? 'Add your website'
            : channel.id === 'other'
              ? 'Add a link'
              : `Add your ${channel.name} link`
          : `Connect ${channel.name}`

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="sheet-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close()
      }}
    >
      <div className="sheet-body">
        <div className="sheet-head">
          <span className="chbadge" style={{ background: channel.color }} aria-hidden="true">
            {channel.badge}
          </span>
          <h2 id="sheet-title">{title}</h2>
        </div>

        {view === 'login' && (
          <>
            <p>A new window opens for {channel.name}. Sign in there, then come back here. We ask to read your profile name and follower count, nothing else.</p>
            {channel.id === 'instagram' && (
              <p className="sheet-hint">
                Don't use Facebook? Choose <strong>Log in with Instagram</strong> in the window that opens.
              </p>
            )}
            <div className="sheet-actions">
              <button type="button" className="btn btn-primary" onClick={startLogin}>
                Continue with {channel.name}
              </button>
              <button type="button" className="btn btn-quiet" onClick={() => setView('link')}>
                Add link instead
              </button>
              <button type="button" className="btn btn-quiet" onClick={() => ref.current?.close()}>
                Cancel
              </button>
            </div>
          </>
        )}

        {view === 'working' && (
          <>
            <div className="sheet-wait" role="status">
              <span className="spinner" aria-hidden="true" />
              <p>Waiting for {channel.name}. This takes a few seconds.</p>
            </div>
            <div className="sheet-actions">
              <button type="button" className="btn btn-quiet" onClick={() => setView('login')}>
                Cancel
              </button>
            </div>
          </>
        )}

        {view === 'error' && (
          <>
            <div className="sheet-error" role="alert">
              <p>
                <strong>The {channel.name} sign-in window closed before it finished.</strong> Nothing was connected.
              </p>
              <ul>
                <li>Allow pop-ups for this site, then try again.</li>
                <li>Check that you're signed in to the right {channel.name} account.</li>
              </ul>
            </div>
            <div className="sheet-actions">
              <button type="button" className="btn btn-primary" onClick={startLogin}>
                Try again
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setView('link')}>
                Add {channel.name} link instead
              </button>
              <button type="button" className="btn btn-quiet" onClick={() => ref.current?.close()}>
                Close
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
                autoFocus
                type="text"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={link}
                placeholder={channel.placeholder}
                aria-invalid={err ? true : undefined}
                aria-describedby={err ? 'link-err' : 'link-help'}
                onChange={(e) => {
                  setLink(e.target.value)
                  if (err) setErr(null)
                }}
              />
              {err ? (
                <span id="link-err" className="field-error">
                  {err}
                </span>
              ) : (
                <span id="link-help" className="field-help">
                  No sign-in needed. Brands see the link, and we check it during review.
                </span>
              )}
            </label>
            <div className="sheet-actions">
              <button type="submit" className="btn btn-primary">
                {channel.id === 'website' ? 'Add website' : channel.id === 'other' ? 'Add link' : `Add ${channel.name}`}
              </button>
              {!channel.linkOnly && (
                <button type="button" className="btn btn-quiet" onClick={() => setView('login')}>
                  Sign in instead
                </button>
              )}
              <button type="button" className="btn btn-quiet" onClick={() => ref.current?.close()}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  )
}
