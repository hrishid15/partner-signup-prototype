import { useSyncExternalStore } from 'react'

export interface TrackedEvent {
  id: number
  t: number
  name: string
  props?: Record<string, unknown>
}

let events: TrackedEvent[] = []
let counter = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

/**
 * Analytics stub. Every funnel event in the prototype goes through here.
 * To wire PostHog later, call `posthog.capture(name, props)` inside this function.
 * The event names are the ones we proposed for the funnel in the Week 1 review.
 */
export function track(name: string, props?: Record<string, unknown>) {
  counter += 1
  events = [{ id: counter, t: Date.now(), name, props }, ...events].slice(0, 50)
  console.info('[track]', name, props ?? '')
  emit()
}

export function clearEvents() {
  events = []
  emit()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function useEvents() {
  return useSyncExternalStore(subscribe, () => events)
}
