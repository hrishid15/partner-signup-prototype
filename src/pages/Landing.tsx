import { Link, useNavigate } from 'react-router-dom'
import { track } from '../analytics'
import { PERSONAS, REVIEW_WINDOW } from '../data'
import { Mark } from '../components/Shell'
import { useProto } from '../state'

const YEAR = new Date().getFullYear()

export default function Landing() {
  const { patch } = useProto()
  const nav = useNavigate()

  function join(persona?: string) {
    patch({ entry: 'marketplace' })
    track('join_clicked', { source: 'landing', persona: persona ?? null })
    nav(persona ? `/signup?as=${persona}` : '/signup')
  }

  return (
    <div className="landing">
      <header className="land-head">
        <Link to="/" className="rail-brand dark">
          <Mark />
          <span>Partners</span>
        </Link>
        <nav className="land-nav" aria-label="Account">
          <a href="#signin" onClick={(e) => e.preventDefault()}>
            Sign in
          </a>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => join()}>
            Join as a partner
          </button>
        </nav>
      </header>

      <main className="land-main">
        <section className="hero">
          <h1>
            Earn when you recommend <span className="accent">brands you believe in</span>
          </h1>
          <p className="hero-lead">Free to join. Connect where you share, get approved by our team, and start working with brands.</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => join()}>
              Join as a partner
            </button>
            <span className="hero-aside">Takes about 5 minutes</span>
          </div>

          <div className="hero-personas">
            <p>Join as</p>
            <ul>
              {PERSONAS.map((p) => (
                <li key={p.id}>
                  <button type="button" className="textlink" onClick={() => join(p.id)}>
                    {p.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="land-how" aria-labelledby="how-title">
          <h2 id="how-title">What happens when you join</h2>
          <ol>
            <li>
              <strong>Create your account.</strong> Use Google, Apple or email.
            </li>
            <li>
              <strong>Tell us what you do.</strong> This decides which channels and brands we suggest.
            </li>
            <li>
              <strong>Connect your channels.</strong> Optional, but brands can't see your reach without them.
            </li>
            <li>
              <strong>Get reviewed.</strong> Marketplace partners go through a quality review that usually takes {REVIEW_WINDOW}. Invited partners are reviewed by the brand that invited them.
            </li>
          </ol>
          <p className="proto-note">
            <strong>Prototype note.</strong> To see the brand-invite entry, use the Entry control above and choose Brand invite.
          </p>
        </section>
      </main>

      <footer className="land-foot">
        <span>© {YEAR} Impact Tech, Inc</span>
        <a href="#brands" onClick={(e) => e.preventDefault()}>
          Are you a brand? Request a demo
        </a>
      </footer>
    </div>
  )
}
