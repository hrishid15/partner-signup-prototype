import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { Persona } from './data'

export type Entry = 'invite' | 'marketplace'
export type Outcome = 'review' | 'declined' | 'approved'
export type ConnectBehavior = 'works' | 'fails'

export interface Connected {
  id: string
  handle: string
  via: 'login' | 'link'
  reach: number
}

export interface State {
  entry: Entry
  outcome: Outcome
  connectBehavior: ConnectBehavior
  consent: boolean
  account: {
    method: 'email' | 'google' | 'apple' | null
    email: string
    first: string
    last: string
    phone: string
  }
  persona: Persona | null
  workName: string
  connected: Connected[]
  profile: {
    display: string
    description: string
    draftVariant: number
    draftUsed: boolean
    draftTouched: boolean
  }
  submitted: boolean
}

export const initialState: State = {
  entry: 'marketplace',
  outcome: 'review',
  connectBehavior: 'works',
  consent: false,
  account: { method: null, email: '', first: '', last: '', phone: '' },
  persona: null,
  workName: '',
  connected: [],
  profile: { display: '', description: '', draftVariant: 0, draftUsed: false, draftTouched: false },
  submitted: false,
}

type Action =
  | { type: 'patch'; patch: Partial<State> }
  | { type: 'account'; patch: Partial<State['account']> }
  | { type: 'profile'; patch: Partial<State['profile']> }
  | { type: 'connect'; channel: Connected }
  | { type: 'disconnect'; id: string }
  | { type: 'reset'; keep?: Partial<State> }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.patch }
    case 'account':
      return { ...state, account: { ...state.account, ...action.patch } }
    case 'profile':
      return { ...state, profile: { ...state.profile, ...action.patch } }
    case 'connect':
      return {
        ...state,
        connected: [...state.connected.filter((c) => c.id !== action.channel.id), action.channel],
      }
    case 'disconnect':
      return { ...state, connected: state.connected.filter((c) => c.id !== action.id) }
    case 'reset':
      return {
        ...initialState,
        entry: state.entry,
        outcome: state.outcome,
        connectBehavior: state.connectBehavior,
        ...action.keep,
      }
  }
}

const KEY = 'partner-signup-prototype-v1'

function load(): State {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<State>
      return {
        ...initialState,
        ...saved,
        account: { ...initialState.account, ...saved.account },
        profile: { ...initialState.profile, ...saved.profile },
      }
    }
  } catch {
    /* storage can be blocked or empty. The prototype works without it. */
  }
  return initialState
}

interface Ctx {
  state: State
  patch: (patch: Partial<State>) => void
  setAccount: (patch: Partial<State['account']>) => void
  setProfile: (patch: Partial<State['profile']>) => void
  connect: (channel: Connected) => void
  disconnect: (id: string) => void
  reset: (keep?: Partial<State>) => void
}

const ProtoContext = createContext<Ctx | null>(null)

export function ProtoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const value = useMemo<Ctx>(
    () => ({
      state,
      patch: (patch) => dispatch({ type: 'patch', patch }),
      setAccount: (patch) => dispatch({ type: 'account', patch }),
      setProfile: (patch) => dispatch({ type: 'profile', patch }),
      connect: (channel) => dispatch({ type: 'connect', channel }),
      disconnect: (id) => dispatch({ type: 'disconnect', id }),
      reset: (keep) => dispatch({ type: 'reset', keep }),
    }),
    [state],
  )

  return <ProtoContext.Provider value={value}>{children}</ProtoContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProto(): Ctx {
  const ctx = useContext(ProtoContext)
  if (!ctx) throw new Error('useProto must be used inside ProtoProvider')
  return ctx
}

/** Name helpers used across pages. */
export function firstNameOf(state: State): string {
  return state.account.first.trim() || 'Alex'
}
export function fullNameOf(state: State): string {
  const n = `${state.account.first} ${state.account.last}`.trim()
  return n || 'Alex Rivera'
}
export function emailOf(state: State): string {
  return state.account.email.trim() || 'alex@example.com'
}
