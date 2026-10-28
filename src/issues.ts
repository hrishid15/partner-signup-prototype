import type { State } from './state'

export type Source = 'UX review' | 'Kelly' | 'Bobby' | 'Rishab' | 'Week 3 notes' | 'Funnel data'
export type Status = 'fixed' | 'partial' | 'open' | 'duplicate'

export interface Where {
  label: string
  to: string
  /** State to set before jumping, so the screen shows the right variant. */
  patch?: Partial<State>
}

export interface Issue {
  id: string
  source: Source
  /** What we saw, in a line. */
  saw: string
  severity?: 'Blocker' | 'Major' | 'Minor' | 'Nitpick'
  /** What the prototype does about it. */
  change: string
  status: Status
  /** Why partial or open, when it is not fully fixed. */
  caveat?: string
  where?: Where
  /** For duplicates, the id this repeats. */
  of?: string
}

const declined: Partial<State> = { outcome: 'declined' }
const review: Partial<State> = { outcome: 'review' }
const invite: Partial<State> = { entry: 'invite' }

export const ISSUES: Issue[] = [
  // UX review, 18 findings
  {
    id: 'F1',
    source: 'UX review',
    severity: 'Blocker',
    saw: 'Connect channels: Next stays disabled until a channel is connected. The Skip button and optional text sit under the header.',
    change: 'Continue is always visible in a footer bar and never fails silently: with no channel it says one is needed and moves focus to the first channel. The page says "one is enough", and adding a link counts.',
    status: 'partial',
    caveat: 'The team decided a channel is required, so the "needs a skip" half of this finding is deliberately not done. The silent disabled button and hidden requirement are fixed.',
    where: { label: 'Connect channels', to: '/channels' },
  },
  {
    id: 'F2',
    source: 'UX review',
    severity: 'Blocker',
    saw: 'Declined: no partner-specific reason, no way to reapply, no other route, unlabeled close button.',
    change: 'Titled "Not approved yet". Reasons come from what the partner entered. Primary action is "Update profile and reapply", with a second route through brand invites. The close button is labeled and the status stays on the dashboard.',
    status: 'fixed',
    caveat: 'The reasons here are examples. The real screen needs the review team\'s reason codes.',
    where: { label: 'Not approved screen', to: '/result', patch: declined },
  },
  {
    id: 'F3',
    source: 'UX review',
    severity: 'Major',
    saw: 'In Review: one card, no timeline, no next step, blank page.',
    change: 'Status line (Submitted, In review, Decision), expected time, how the notification arrives, and a "while you wait" list.',
    status: 'fixed',
    caveat: 'The 3 to 5 business days is a placeholder until we have real review data.',
    where: { label: 'In review screen', to: '/result', patch: review },
  },
  {
    id: 'F4',
    source: 'UX review',
    severity: 'Major',
    saw: 'Progress ring lagged the checkmarks, stuck at 67%, then a spinner of about 15 seconds.',
    change: 'The rail advances as each step is saved. The end screen says "Submitting your application" with a bar that reaches 100%.',
    status: 'fixed',
    caveat: 'The 3 seconds here is a stand-in. The real wait depends on the backend.',
    where: { label: 'Submitting screen', to: '/submitting' },
  },
  {
    id: 'F5',
    source: 'UX review',
    severity: 'Major',
    saw: 'Checklist grows from 2 to 3 steps after a channel is connected. The estimate never recalculates.',
    change: 'All four steps show from the first screen. The time left is recalculated on every step.',
    status: 'fixed',
    where: { label: 'First screen', to: '/signup' },
  },
  {
    id: 'F6',
    source: 'UX review',
    severity: 'Major',
    saw: 'Five fields, no step count, no reason for the phone number, small-print password rules.',
    change: 'Step count in the rail, a reason under the phone field, and password rules that tick off as you type.',
    status: 'partial',
    caveat: 'It is still five fields. Whether the phone number can move to later is a product decision.',
    where: { label: 'Email form', to: '/signup/email' },
  },
  {
    id: 'F7',
    source: 'UX review',
    severity: 'Major',
    saw: 'Brand invite entry shows the same form with a small logo. The brand is named only after signup.',
    change: 'The headline names the brand and what it offers. Google and Apple sign-up stay one click.',
    status: 'fixed',
    where: { label: 'Invite entry', to: '/signup', patch: invite },
  },
  {
    id: 'F8',
    source: 'UX review',
    severity: 'Major',
    saw: 'Profile description is empty with no AI draft. Next is disabled until you type. The counter has no label. Avatar is initials only.',
    change: 'An editable draft is pre-filled from the connected channels, with Regenerate. The counter reads "908 characters left". The photo comes from the first channel. The step can be skipped.',
    status: 'partial',
    caveat: 'The draft is a stand-in written from templates. The real one needs the AI service.',
    where: { label: 'Profile step', to: '/profile' },
  },
  {
    id: 'F9',
    source: 'UX review',
    severity: 'Major',
    saw: 'Marketplace save error with a 403, then Next went grey with no retry. Probably a shared browser session.',
    change: 'Failed connections show a specific message with Try again, and answers are kept in the session so a lost sign-in does not wipe them.',
    status: 'partial',
    caveat: 'Not reproduced outside our test setup, so we only designed for the failure, not the cause.',
    where: { label: 'Connection error', to: '/channels', patch: { connectBehavior: 'fails' } },
  },
  {
    id: 'F10',
    source: 'UX review',
    severity: 'Minor',
    saw: 'Partners page has no sign-up button in the hero. The top bar mixes partner and brand actions.',
    change: '"Join as a partner" in the header and hero. The brand demo link moved to the footer.',
    status: 'fixed',
    where: { label: 'Landing page', to: '/' },
  },
  {
    id: 'F11',
    source: 'UX review',
    severity: 'Minor',
    saw: 'Persona list cuts off below the fold. Nothing says why the answers matter.',
    change: 'All five options show at once, each with a line. A sentence says the answer shapes which channels we suggest. The landing page links can pre-select one.',
    status: 'fixed',
    where: { label: 'About you', to: '/about' },
  },
  {
    id: 'F12',
    source: 'UX review',
    severity: 'Minor',
    saw: 'The floating assistant button covers the right end of Next.',
    change: 'The primary button sits at the left of a sticky action bar, away from the bottom-right corner where floating widgets usually sit.',
    status: 'fixed',
    caveat: 'The real chat widget is not in the prototype, so this needs a check against it.',
  },
  {
    id: 'F13',
    source: 'UX review',
    severity: 'Minor',
    saw: 'Broken logo image on every screen. Checklist title uses the raw account name.',
    change: 'Brand mark falls back to initials. Titles use the display name.',
    status: 'fixed',
    where: { label: 'Invite entry', to: '/signup', patch: invite },
  },
  {
    id: 'F14',
    source: 'UX review',
    severity: 'Minor',
    saw: 'US region, UK spelling ("Maximise", "prioritise").',
    change: 'All copy uses US spelling. In the product, spelling should follow the region setting.',
    status: 'fixed',
  },
  {
    id: 'F15',
    source: 'UX review',
    severity: 'Minor',
    saw: 'Row of unlabeled icons, with a "10" badge on a brand-new account.',
    change: 'Icons carry text labels (collapsing to tooltips on narrow screens). Badges only appear when they count something we can name.',
    status: 'fixed',
    caveat: 'Still need to find out what the "10" counts.',
    where: { label: 'Dashboard', to: '/dashboard' },
  },
  {
    id: 'F16',
    source: 'UX review',
    severity: 'Nitpick',
    saw: 'Marketplace flow in dark theme, invite flow in light, same browser.',
    change: 'Not addressed. The prototype is light only.',
    status: 'open',
    caveat: 'We still need to know whether the theme follows the device. If it does, disabled states need checking in both.',
  },
  {
    id: 'F17',
    source: 'UX review',
    severity: 'Nitpick',
    saw: 'Disabled buttons are so pale their labels are hard to read.',
    change: 'Blocked buttons stay readable and a message says what is missing. Clicking one explains instead of doing nothing.',
    status: 'fixed',
    where: { label: 'About you', to: '/about' },
  },
  {
    id: 'F18',
    source: 'UX review',
    severity: 'Nitpick',
    saw: 'Footer says © 2025.',
    change: 'The year is read from the date.',
    status: 'fixed',
    where: { label: 'Landing page', to: '/' },
  },

  // Kelly
  {
    id: 'K1',
    source: 'Kelly',
    saw: 'Declined is a dead end, and once dismissed the status is gone.',
    change: 'Same fix as F2. The dashboard keeps a banner with the reapply button after the card is closed.',
    status: 'fixed',
    where: { label: 'Dashboard banner', to: '/dashboard', patch: declined },
  },
  {
    id: 'K2',
    source: 'Kelly',
    saw: 'Brand-invited sign-in lands on an empty home screen.',
    change: 'The dashboard opens on the brand\'s program with its status and the next steps for the partner.',
    status: 'fixed',
    where: { label: 'Invite dashboard', to: '/dashboard', patch: { entry: 'invite', outcome: 'review' } },
  },
  {
    id: 'K3',
    source: 'Kelly',
    saw: 'Browser Back works from Sign in but not from Continue with email.',
    change: 'Every screen is its own address, so Back steps through them the same way on every path.',
    status: 'fixed',
    where: { label: 'Email form', to: '/signup/email' },
  },
  {
    id: 'K4',
    source: 'Kelly',
    saw: 'Terms consent sits in an odd spot.',
    change: 'One checkbox directly under the sign-up buttons. Pressing a button without it focuses the box and says "Accept the terms to continue".',
    status: 'fixed',
    caveat: 'Legal may prefer "By continuing you agree". That would remove a click.',
    where: { label: 'First screen', to: '/signup' },
  },
  {
    id: 'K5',
    source: 'Kelly',
    saw: 'The frame around the first sign-in page adds clutter.',
    change: 'No frame. The options sit on the page.',
    status: 'fixed',
    where: { label: 'First screen', to: '/signup' },
  },
  {
    id: 'K6',
    source: 'Kelly',
    saw: '"1 more minutes to go!" plus a countdown that adds little.',
    change: 'Correct plural ("About 1 minute left") and the step count in the rail.',
    status: 'fixed',
    where: { label: 'Profile step', to: '/profile' },
  },
  {
    id: 'K7',
    source: 'Kelly',
    saw: 'Two identical "K" profile icons, top left and top right.',
    change: 'One account menu, labeled. The rail has no avatar.',
    status: 'fixed',
    where: { label: 'Dashboard', to: '/dashboard' },
  },
  {
    id: 'K8',
    source: 'Kelly',
    saw: '"Personalize your profile" only appears after channels are connected.',
    change: 'Same as F5.',
    status: 'duplicate',
    of: 'F5',
  },

  // Bobby
  {
    id: 'B1',
    source: 'Bobby',
    saw: '"Tell us about yourself" is a fill-in-the-blank sentence of dropdowns. Options are unclear and a dropdown is cut off.',
    change: 'Replaced with a plain list of five options with a line each, and a name field pre-filled from the account.',
    status: 'fixed',
    where: { label: 'About you', to: '/about' },
  },
  {
    id: 'B2',
    source: 'Bobby',
    saw: 'Partners accept terms twice.',
    change: 'One consent checkbox, on the first screen only.',
    status: 'fixed',
    where: { label: 'First screen', to: '/signup' },
  },
  {
    id: 'B3',
    source: 'Bobby',
    saw: 'Mobile number is required but nothing says it is for 2FA.',
    change: 'Under the field: "We text a code to this number when you sign in."',
    status: 'fixed',
    where: { label: 'Email form', to: '/signup/email' },
  },
  {
    id: 'B4',
    source: 'Bobby',
    saw: 'About a minute of loading screens in a 3 minute video.',
    change: 'The account is created when the first screen is submitted, so the end only submits the application.',
    status: 'partial',
    caveat: 'Only the sequence is changed here. Making account setup run in the background is engineering work.',
    where: { label: 'Submitting screen', to: '/submitting' },
  },
  {
    id: 'B5',
    source: 'Bobby',
    saw: 'Four closing loading messages.',
    change: 'One message, "Submitting your application", with one progress bar.',
    status: 'fixed',
    where: { label: 'Submitting screen', to: '/submitting' },
  },

  // Rishab
  {
    id: 'R1',
    source: 'Rishab',
    saw: 'After signup there is no next step and no explanation of what happens.',
    change: 'Same as F3. The result screen says what is happening, when to expect an answer and what to do meanwhile.',
    status: 'fixed',
    where: { label: 'In review screen', to: '/result', patch: review },
  },
  {
    id: 'R2',
    source: 'Rishab',
    saw: 'Little feedback when a channel connection fails.',
    change: 'A message that names the channel and the reason, two tips, Try again, and "Add link instead" as another route.',
    status: 'fixed',
    where: { label: 'Connection error', to: '/channels', patch: { connectBehavior: 'fails' } },
  },
  {
    id: 'R3',
    source: 'Rishab',
    saw: 'Continue only appears after connecting a channel. Needs a skip.',
    change: 'Same as F1.',
    status: 'duplicate',
    of: 'F1',
  },
  {
    id: 'R4',
    source: 'Rishab',
    saw: 'Connecting Instagram goes through Facebook first, which is harder for partners without a Facebook account.',
    change: 'The Instagram panel offers a direct Instagram sign-in and "Add a link instead".',
    status: 'partial',
    caveat: 'Whether direct Instagram sign-in is available to us needs engineering to confirm. "Add link instead" works either way.',
    where: { label: 'Connect Instagram', to: '/channels' },
  },

  // Week 3: team discussion and funnel data
  {
    id: 'W1',
    source: 'Week 3 notes',
    saw: 'Instagram OAuth goes through the Meta Creator page and needs a Facebook account. Linktree signs in with Instagram directly.',
    change: 'The Instagram panel says "No Facebook account? Choose Log in with Instagram" and keeps "Add a link instead" as the other route.',
    status: 'partial',
    caveat: 'Gauravee is checking with engineering whether Meta\'s OAuth can be limited to Instagram. If not, the note comes out.',
    where: { label: 'Connect Instagram', to: '/channels' },
  },
  {
    id: 'W2',
    source: 'Week 3 notes',
    severity: 'Major',
    saw: 'LinkedIn connections are declined automatically because LinkedIn has no verification step, and the product never says so. About 100 Ask Impact questions a week are about declines and reapplying.',
    change: 'LinkedIn is not offered. "Why isn\'t LinkedIn here?" under the list explains it in two sentences, so nobody connects a channel that won\'t count.',
    status: 'fixed',
    caveat: 'Partners who already connected LinkedIn still see "Disconnected" on the dashboard. That is a dashboard fix (see the Week 3 brief).',
    where: { label: 'Connect channels', to: '/channels' },
  },
  {
    id: 'W3',
    source: 'Week 3 notes',
    severity: 'Major',
    saw: 'The connect UI does not say why a channel is requested or what data it uses.',
    change: 'Opening a channel shows three short lines before anything is connected: why we ask, what we read, and how to disconnect. A link-only add says it keeps the link and nothing else.',
    status: 'fixed',
    caveat: 'The data lists are placeholders until engineering confirms the real OAuth scopes.',
    where: { label: 'Connect TikTok', to: '/channels' },
  },
  {
    id: 'W4',
    source: 'Week 3 notes',
    saw: 'Disconnect is hard to find, so partners cannot tell how to remove a channel.',
    change: 'Every connected tile has a Disconnect button. It asks once, on the tile, and says what happens ("Brands will stop seeing it").',
    status: 'fixed',
    where: { label: 'Connect channels', to: '/channels' },
  },
  {
    id: 'W5',
    source: 'Week 3 notes',
    saw: 'Popups and modals add steps and are harder on mobile. The mockup uses an inline layout.',
    change: 'The connect modal is gone. A panel opens under the tile you picked, on desktop and on phones, and focus moves into it and back out.',
    status: 'fixed',
    where: { label: 'Connect channels', to: '/channels' },
  },
  {
    id: 'W6',
    source: 'Week 3 notes',
    saw: '"Optional but recommended" should name the highest-performing channels. OAuth should open in a new tab.',
    change: 'The line under the headline names the three suggested channels for the partner\'s type. Sign-in is described as opening in a new tab, with a "waiting for the other tab" state and a way back.',
    status: 'partial',
    caveat: 'We have no performance data by channel, so the named channels are the first three for each partner type, not a measured ranking. The new tab is simulated.',
    where: { label: 'Connect channels', to: '/channels' },
  },
  {
    id: 'W7',
    source: 'Week 3 notes',
    saw: 'Rishi\'s mockup puts the brand-view preview (today in Settings) into onboarding, updating as channels are added.',
    change: 'The preview stays on the connect page and now has an orbit graphic that fills in, one slot per channel, next to the card brands see.',
    status: 'fixed',
    where: { label: 'Connect channels', to: '/channels' },
  },
  {
    id: 'W8',
    source: 'Week 3 notes',
    saw: 'Upfluence lets partners paste a handle now and verify later. Adobe returns the user to a confirmation after connecting.',
    change: 'Adding by link marks the tile "We\'ll check it in review" and moves on. Connecting by sign-in returns to the same tile with a confirmation and an updated preview.',
    status: 'fixed',
    where: { label: 'Connect channels', to: '/channels' },
  },
  {
    id: 'D1',
    source: 'Funnel data',
    severity: 'Blocker',
    saw: 'Connect your channels is the biggest leak. Marketplace partners complete it 65 to 67% of the time and brand-invited partners 54 to 59%, against 90 to 97% on the other steps. Invited partners drop more even though a brand already invited them.',
    change: 'Invited partners are told one channel lets the brand see their reach, with adding a link as the no-sign-in route. Everyone gets the inline panel, a "one is enough" line and plain data-use lines.',
    status: 'partial',
    caveat: 'This is a hypothesis, and requiring a channel could make this drop worse rather than better. We do not know whether "completed" counts skipped steps. Needs PostHog.',
    where: { label: 'Connect channels, brand invite', to: '/channels', patch: invite },
  },
]

export const STATUS_LABEL: Record<Status, string> = {
  fixed: 'Addressed',
  partial: 'Partly',
  open: 'Not addressed',
  duplicate: 'Same as another',
}
