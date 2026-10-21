import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ISSUES, STATUS_LABEL, type Source, type Status } from '../issues'
import { useProto } from '../state'

const SOURCES: ('All' | Source)[] = ['All', 'UX review', 'Kelly', 'Bobby', 'Rishab']
const STATUSES: ('All' | Status)[] = ['All', 'fixed', 'partial', 'open', 'duplicate']

const BEFORE = [
  'Next stays disabled until a channel is connected. Skip and the "optional" text sit under the header, so partners never see them.',
  'No reason to connect beyond one line of copy.',
  'A failed connection gives little feedback and no other route.',
  'Instagram goes through Facebook first.',
  'No way to add a website or a link without signing in.',
  'No sign of what brands will see.',
]

const AFTER = [
  'One button that changes with the situation: "Skip for now" with no channel, "Continue" with one. It is always visible, in a sticky bar clear of the header.',
  'A line under the button says what skipping costs, and what connecting adds is visible in the preview on the right.',
  'A failure names the channel and the reason, gives two tips, and offers Try again and "Add link instead".',
  'The Instagram sheet offers a direct Instagram sign-in. This needs engineering to confirm.',
  'Every channel can be added by link, and a website or any other address needs no sign-in at all.',
  'The preview shows the partner\'s card as brands would see it, and fills in as they connect.',
]

const FUNNEL: { moment: string; risk: string; change: string; events: string }[] = [
  {
    moment: 'Landing page',
    risk: 'No sign-up button in the hero, so interested partners have to hunt for one.',
    change: '"Join as a partner" in the header and hero. Brand actions moved away.',
    events: 'join_clicked',
  },
  {
    moment: 'First screen',
    risk: 'Partners don\'t know how long this takes or that approval involves a review. Invited partners don\'t see who invited them.',
    change: 'Time and review expectations up front. The invite headline names the brand and the offer. One consent checkbox.',
    events: 'signup_viewed, consent_blocked, account_created',
  },
  {
    moment: 'Email form',
    risk: 'Five fields with unexplained phone and hidden password rules lead to errors and abandons.',
    change: 'A reason for the phone number, live password rules, and specific error messages.',
    events: 'signup_form_invalid, account_created',
  },
  {
    moment: 'Connect channels',
    risk: 'This is where partners without a ready account, or with a failing connection, get stuck. It has no exit.',
    change: 'Visible skip, a cost line, specific errors with another route, add by link, a live preview.',
    events: 'channels_viewed, channel_connect_started, channel_connect_succeeded, channel_connect_failed, channel_link_added, channels_skipped, channels_continued',
  },
  {
    moment: 'Profile',
    risk: 'An empty box that blocks Next is a chore, and the optional step acts mandatory.',
    change: 'Pre-filled editable draft, Regenerate, a labeled counter, and a skip.',
    events: 'profile_draft_shown, profile_draft_regenerated, application_submitted (description_length, draft_unedited)',
  },
  {
    moment: 'Submitting',
    risk: 'About 15 seconds of spinner with the progress stuck at 67% reads as a crash.',
    change: 'One message and a bar that reaches 100%.',
    events: 'application_submitted, submit_completed',
  },
  {
    moment: 'Result',
    risk: 'In Review has no next step. Declined has no reason or route, and disappears when closed.',
    change: 'Status line, expected wait, things to do meanwhile. Declined gives reasons, a reapply action and another route, and stays on the dashboard.',
    events: 'result_viewed, decline_fix_clicked, reapply_clicked, status_viewed',
  },
]

const DECISIONS: { q: string; why: string }[] = [
  {
    q: 'Does skipping channels hurt approval?',
    why: 'The new button makes skipping easy. If marketplace review needs a channel, partners who skip will be declined later. Decide whether to require one for the marketplace only, and tell them on this screen.',
  },
  { q: 'Can we offer direct Instagram sign-in?', why: 'The sheet assumes it. If not, the note comes out and "Add link instead" stays the route.' },
  { q: 'Can the phone number move later in the flow?', why: 'It is the most unexplained field. If 2FA allows it, the email form drops to four fields.' },
  { q: 'Checkbox or "by continuing you agree"?', why: 'We followed the team\'s recommendation for a checkbox. Legal may accept the shorter version, which removes a click.' },
  { q: 'What are the real review time and decline reasons?', why: 'Both are placeholders. The decline screen needs reason codes from the review team.' },
  { q: 'Can account setup run in the background?', why: 'This changes the real wait at the end of the flow. It is engineering work, not design.' },
  { q: 'Does the theme follow the device?', why: 'Finding 16. If yes, disabled and blocked states need checking in both themes.' },
]

export default function Changes() {
  const { patch } = useProto()
  const nav = useNavigate()
  const [source, setSource] = useState<'All' | Source>('All')
  const [status, setStatus] = useState<'All' | Status>('All')

  const counts = useMemo(() => {
    const c = { fixed: 0, partial: 0, open: 0, duplicate: 0 }
    ISSUES.forEach((i) => (c[i.status] += 1))
    return c
  }, [])

  const rows = ISSUES.filter((i) => (source === 'All' || i.source === source) && (status === 'All' || i.status === status))

  return (
    <div className="changes">
      <div className="changes-inner">
        <header>
          <h1>What changed and why</h1>
          <p className="lead">
            We redesigned the partner signup around every issue from Week 1: the 18 findings in the UX review, plus what Kelly, Bobby and Rishab found. The biggest change is on Connect channels, because that is where a partner is most likely to stop.
          </p>
          <ul className="tally" aria-label="Summary">
            <li>
              <strong>{counts.fixed}</strong> addressed
            </li>
            <li>
              <strong>{counts.partial}</strong> partly
            </li>
            <li>
              <strong>{counts.open}</strong> not addressed
            </li>
            <li>
              <strong>{counts.duplicate}</strong> repeat another item
            </li>
          </ul>
          <nav className="jump" aria-label="On this page">
            <a href="#channels">Connect channels</a>
            <a href="#dropoff">Drop-off, step by step</a>
            <a href="#issues">Every issue</a>
            <a href="#decisions">Open decisions</a>
          </nav>
        </header>

        <section id="channels" aria-labelledby="ch-title">
          <h2 id="ch-title">Connect channels, before and after</h2>
          <div className="ba">
            <div className="ba-col ba-before">
              <h3>Before</h3>
              <ul>
                {BEFORE.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="ba-col ba-after">
              <h3>Now</h3>
              <ul>
                {AFTER.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  patch({ persona: 'creator' })
                  nav('/channels')
                }}
              >
                Open Connect channels
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  patch({ persona: 'creator', connectBehavior: 'fails' })
                  nav('/channels')
                }}
              >
                Open it with failing sign-ins
              </button>
            </div>
          </div>
        </section>

        <section id="dropoff" aria-labelledby="do-title">
          <h2 id="do-title">Why this should reduce drop-off</h2>
          <p className="proto-note">
            <strong>These are hypotheses.</strong> We have no PostHog access yet, so no numbers exist. The last column lists the events the prototype already tracks, so the same names can be checked on the real flow.
          </p>
          <div className="tablewrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th scope="col">Moment</th>
                  <th scope="col">Why partners stop</th>
                  <th scope="col">What we changed</th>
                  <th scope="col">Events to watch</th>
                </tr>
              </thead>
              <tbody>
                {FUNNEL.map((f) => (
                  <tr key={f.moment}>
                    <th scope="row">{f.moment}</th>
                    <td data-label="Why partners stop">{f.risk}</td>
                    <td data-label="What we changed">{f.change}</td>
                    <td data-label="Events to watch" className="events">
                      {f.events}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="issues" aria-labelledby="is-title">
          <h2 id="is-title">Every issue and what we did</h2>
          <div className="filters">
            <label>
              <span>From</span>
              <select value={source} onChange={(e) => setSource(e.target.value as 'All' | Source)}>
                {SOURCES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'All' | Status)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All' ? 'All' : STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <span className="filters-count" role="status">
              Showing {rows.length} of {ISSUES.length}
            </span>
          </div>

          <div className="tablewrap">
            <table className="tbl tbl-issues">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">What we saw</th>
                  <th scope="col">What changed</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id}>
                    <th scope="row">
                      <span className="iid">{i.id}</span>
                      <span className="isrc">{i.source}</span>
                      {i.severity && <span className="isev">{i.severity}</span>}
                    </th>
                    <td data-label="What we saw">{i.saw}</td>
                    <td data-label="What changed">
                      {i.change}
                      {i.caveat && <span className="caveat"> {i.caveat}</span>}
                      {i.where && (
                        <button
                          type="button"
                          className="textlink see"
                          onClick={() => {
                            if (i.where?.patch) patch(i.where.patch)
                            nav(i.where!.to)
                          }}
                        >
                          See it: {i.where.label}
                        </button>
                      )}
                    </td>
                    <td data-label="Status">
                      <span className={`pill pill-${i.status}`}>{STATUS_LABEL[i.status]}</span>
                      {i.of && <span className="muted"> of {i.of}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="decisions" aria-labelledby="de-title">
          <h2 id="de-title">Open decisions</h2>
          <p>Things the prototype assumes that someone at impact.com needs to confirm.</p>
          <ul className="decisions">
            {DECISIONS.map((d) => (
              <li key={d.q}>
                <p className="dq">{d.q}</p>
                <p>{d.why}</p>
              </li>
            ))}
          </ul>
          <p className="muted">
            Not tested in Week 1 and still not covered: mobile 2FA, website verification, billing and tax timing, anything after approval, and keyboard and screen reader use on the live product.
          </p>
        </section>
      </div>
    </div>
  )
}
