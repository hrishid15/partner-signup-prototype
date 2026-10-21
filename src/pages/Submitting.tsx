import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { track } from '../analytics'
import { BRAND } from '../data'
import { Mark } from '../components/Shell'
import { useProto } from '../state'

const DURATION = 2800

export default function Submitting() {
  const { state } = useProto()
  const nav = useNavigate()
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(100, Math.round(((now - start) / DURATION) * 100))
      setPct(p)
      if (p < 100) raf = requestAnimationFrame(tick)
      else {
        track('submit_completed')
        window.setTimeout(() => nav('/result', { replace: true }), 450)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [nav])

  const joining = state.entry === 'invite' ? `Sending your request to ${BRAND.name}` : 'Submitting your application'
  const finished = pct >= 100

  return (
    <div className="center-screen">
      <main className="submitting">
        <Mark />
        <h1>{finished ? 'Submitted' : joining}</h1>
        <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Submitting">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="muted" role="status">
          {finished ? 'Taking you to your status.' : 'This takes a few seconds. Please keep this page open.'}
        </p>
      </main>
    </div>
  )
}
