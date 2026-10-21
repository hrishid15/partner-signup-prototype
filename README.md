# Partner signup prototype

A clickable redesign of the impact.com partner signup flow, built for the Week 2 Onboarding work. It takes every issue from our Week 1 findings and shows the fix in a working flow, with the most attention on the **Connect channels** step.

It is a front-end prototype only. There is no backend, no real sign-in and no real AI. Everything resets when you close the tab.

**Live:** https://partner-signup-prototype-seven.vercel.app (hosted on Vercel, redeploys on every push to `main`)

## Run it

You need Node 20 or newer.

```bash
git clone <this repo>
cd partner-signup-prototype
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

Other commands: `npm run build` (typecheck and production build), `npm run preview` (serve the build), `npm run lint`.

## How to use it

The dark bar at the top is for us, not for partners.

- **Show controls** opens the prototype controls:
  - **Entry**: marketplace signup or brand invite. These start differently and end differently.
  - **Review outcome**: in review, not approved, or approved. This decides what the result screen and dashboard show.
  - **Channel sign-ins**: make them work, or make them fail so you can see the error state.
  - **Jump to**: go to any screen.
  - **Restart** clears the session. **Events** lists what we track.
- **What changed and why** opens the page that maps every issue to a change. Each row has a "See it" link that sets the right state and jumps to the screen.

Two quick tours:

1. Start at the landing page, join, pick Creator, and open Connect channels. Try Skip for now, then connect one and watch the button change.
2. Set Channel sign-ins to Fail, then try to connect a channel. Use "Add link instead".

## What is in it

| Screen | Address | Main issues it fixes |
| --- | --- | --- |
| Landing | `#/` | F10, F18 |
| Create account | `#/signup` | F5, F7, F13, K4, K5, B2 |
| Email form | `#/signup/email` | F6, B3, K3 |
| About you | `#/about` | F11, F17, B1 |
| Connect channels | `#/channels` | F1, F9, R2, R3, R4 |
| Your profile | `#/profile` | F8, K6 |
| Submitting | `#/submitting` | F4, B4, B5 |
| Result | `#/result` | F2, F3, K1, R1 |
| Dashboard | `#/dashboard` | F15, K1, K2, K7 |
| What changed and why | `#/changes` | the full map |

IDs: `F` is the 18 findings in our UX review, `K` is Kelly, `B` is Bobby, `R` is Rishab. The full table, with status and caveats, is in `src/issues.ts`.

## Placeholders to replace

Be careful not to present these as facts.

- **Review time** (3 to 5 business days) is made up. It lives in `REVIEW_WINDOW` in `src/data.ts`.
- **Decline reasons** are written from what the tester entered. The real product needs reason codes from the review team.
- **Brand name and offer** (Trailhead Outfitters) are sample text.
- **impact.com wordmark** is typed text with a red dot (`Mark` in `src/components/Shell.tsx`), not the official logo file. The colors and Lexend font come from impact.com, but their heading typeface is proprietary, so Lexend stands in for it.
- **Follower counts** are generated. They are labeled "sample" on screen.
- **AI profile draft** is three templates in `makeDraft` in `src/data.ts`.
- **Academy and resource hub items** on the result screen are sample items.

## Things we could not confirm

These are listed on the Changes page too.

- Direct Instagram sign-in (without Facebook) may not be available. If not, remove the note in `src/components/ConnectSheet.tsx`.
- Whether skipping channels hurts marketplace approval.
- Whether the phone number can move later in the flow.
- Whether the theme follows the device (finding 16). The prototype is light only.
- Mobile 2FA and website verification were never tested in Week 1.

## Analytics

Every funnel event goes through `track()` in `src/analytics.ts`, which logs to the console and the Events panel. To send them to PostHog, call `posthog.capture(name, props)` inside that function. The event names are listed on the Changes page next to each step.

## Stack and layout

Vite, React 19, TypeScript, React Router (hash routing, so it works on any static host). Plain CSS in `src/styles.css`, with fonts from `@fontsource-variable`.

```
src/
  analytics.ts       track() stub and the events list
  data.ts            personas, channels, sample copy and numbers
  issues.ts          the master issue list behind the Changes page
  state.tsx          one context for the whole flow, kept in sessionStorage
  components/        progress rail, control bar, connect sheet, brand preview
  pages/             one file per screen
```

## Accessibility notes

Visible keyboard focus, focus moves to the page heading on each screen, the connect sheet is a native dialog (Escape closes it), the character counter and channel changes are announced, and motion respects `prefers-reduced-motion`. It has not had a screen reader pass or a contrast audit by a person yet.
