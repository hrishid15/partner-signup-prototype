export type Persona = 'creator' | 'publisher' | 'agency' | 'network' | 'developer'

export interface PersonaDef {
  id: Persona
  label: string
  blurb: string
  noun: string
}

export const PERSONAS: PersonaDef[] = [
  { id: 'creator', label: 'Creator', blurb: 'You make content on social or video platforms.', noun: 'content creator' },
  { id: 'publisher', label: 'Publisher', blurb: 'You run a website, blog, newsletter or media brand.', noun: 'publisher' },
  { id: 'agency', label: 'Agency', blurb: 'You manage partnerships for brands or creators.', noun: 'partnership agency' },
  { id: 'network', label: 'Network', blurb: 'You manage a group of affiliates or partners.', noun: 'partner network' },
  { id: 'developer', label: 'Developer', blurb: 'You build apps, browser extensions or tools.', noun: 'developer' },
]

export interface ChannelDef {
  id: string
  name: string
  badge: string
  color: string
  /** One line that tells the partner what connecting involves. */
  method: string
  /** Placeholder for the "add by link" input. */
  placeholder: string
  /** Channels with no sign-in route, link only. */
  linkOnly?: boolean
  linkExample: string
  /** Why we ask for this channel, in one sentence. */
  why: string
  /** The exact data we read. Placeholder until engineering confirms scopes. */
  uses: string[]
}

/** Channels we name as "recommended". Placeholder until we have performance data by channel. */
export const RECOMMENDED = ['instagram', 'tiktok', 'youtube']

export const CHANNELS: Record<string, ChannelDef> = {
  instagram: { id: 'instagram', name: 'Instagram', badge: 'IG', color: '#9B2C6B', method: 'Sign in with Instagram', placeholder: '@yourname or instagram.com/yourname', linkExample: 'instagram.com/yourname', why: 'Brands use your follower count and recent posts to judge fit.', uses: ['Your username and profile photo','Your follower count','Your public posts (to show brands your style)'] },
  tiktok: { id: 'tiktok', name: 'TikTok', badge: 'TT', color: '#1B1F23', method: 'Sign in with TikTok', placeholder: '@yourname or tiktok.com/@yourname', linkExample: 'tiktok.com/@yourname', why: 'Brands use your follower count and views to judge fit.', uses: ['Your username and profile photo','Your follower count','Your public videos and view counts'] },
  youtube: { id: 'youtube', name: 'YouTube', badge: 'YT', color: '#B3261E', method: 'Sign in with Google', placeholder: 'youtube.com/@yourchannel', linkExample: 'youtube.com/@yourchannel', why: 'Brands use your subscribers and views to judge fit.', uses: ['Your channel name and photo','Your subscriber count','Your public videos and view counts'] },
  website: { id: 'website', name: 'Website or blog', badge: 'W', color: '#0B6E5F', method: 'Paste your address. No sign-in needed.', placeholder: 'yoursite.com', linkOnly: true, linkExample: 'yoursite.com', why: 'Brands want to see where your links will live.', uses: ['The address you enter, nothing else','We check it is yours during review'] },
  facebook: { id: 'facebook', name: 'Facebook page', badge: 'f', color: '#2F55A4', method: 'Sign in with Facebook', placeholder: 'facebook.com/yourpage', linkExample: 'facebook.com/yourpage', why: 'Brands use your page followers to judge fit.', uses: ['Your page name and photo','Your page follower count','Your public posts'] },
  pinterest: { id: 'pinterest', name: 'Pinterest', badge: 'P', color: '#A61E36', method: 'Sign in with Pinterest', placeholder: 'pinterest.com/yourname', linkExample: 'pinterest.com/yourname', why: 'Brands use your followers and monthly views to judge fit.', uses: ['Your username and profile photo','Your follower count','Your public boards'] },
  twitch: { id: 'twitch', name: 'Twitch', badge: 'Tw', color: '#6A3FB5', method: 'Sign in with Twitch', placeholder: 'twitch.tv/yourname', linkExample: 'twitch.tv/yourname', why: 'Brands use your followers and viewers to judge fit.', uses: ['Your channel name and photo','Your follower count','Your public streams'] },
  x: { id: 'x', name: 'X', badge: 'X', color: '#2B2B2B', method: 'Sign in with X', placeholder: '@yourname or x.com/yourname', linkExample: 'x.com/yourname', why: 'Brands use your followers to judge fit.', uses: ['Your handle and profile photo','Your follower count','Your public posts'] },
  other: { id: 'other', name: 'Another link', badge: '+', color: '#566573', method: 'Newsletter, podcast, store. Paste any link.', placeholder: 'https://', linkOnly: true, linkExample: 'https://yourlink.com', why: 'Brands want to see everything you share on.', uses: ['The link you enter, nothing else','We check it during review'] },
}

const ORDER: Record<Persona | 'none', string[]> = {
  creator: ['instagram', 'tiktok', 'youtube', 'twitch', 'pinterest', 'facebook', 'x', 'website', 'other'],
  publisher: ['website', 'youtube', 'facebook', 'pinterest', 'x', 'instagram', 'tiktok', 'twitch', 'other'],
  agency: ['website', 'instagram', 'youtube', 'tiktok', 'x', 'facebook', 'pinterest', 'twitch', 'other'],
  network: ['website', 'x', 'facebook', 'youtube', 'instagram', 'tiktok', 'pinterest', 'twitch', 'other'],
  developer: ['website', 'x', 'youtube', 'other', 'instagram', 'tiktok', 'facebook', 'pinterest', 'twitch'],
  none: ['instagram', 'tiktok', 'youtube', 'website', 'facebook', 'pinterest', 'twitch', 'x', 'other'],
}

export function channelOrder(persona: Persona | null): ChannelDef[] {
  return ORDER[persona ?? 'none'].map((id) => CHANNELS[id])
}

/** Name used in running text, so "Website or blog" does not read oddly in a sentence. */
export function shortName(id: string): string {
  if (id === 'website') return 'website'
  if (id === 'other') return 'other links'
  return CHANNELS[id]?.name ?? id
}

export function draftName(id: string): string {
  if (id === 'website') return 'my website'
  if (id === 'other') return 'a few other links'
  return CHANNELS[id]?.name ?? id
}

export const BRAND = {
  name: 'Trailhead Outfitters',
  initials: 'TO',
  offer: 'Earn 10% on every sale you send their way, paid monthly.',
}

/** Placeholder review window. Replace with real data once we have it. */
export const REVIEW_WINDOW = '3 to 5 business days'

export function listJoin(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

export function plural(n: number, one: string, many: string) {
  return n === 1 ? `${n} ${one}` : `${n} ${many}`
}

/** Stand-in for the AI-written description. Three variants so Regenerate visibly does something. */
export function makeDraft(opts: {
  persona: Persona | null
  name: string
  channelNames: string[]
  variant: number
}): string {
  const noun = PERSONAS.find((p) => p.id === opts.persona)?.noun ?? 'partner'
  const a = /^[aeiou]/i.test(noun) ? 'an' : 'a'
  const name = opts.name.trim() || 'I'
  const intro = opts.name.trim() ? `I'm ${name}, ${a} ${noun}` : `I'm ${a} ${noun}`
  const where = listJoin(opts.channelNames)
  const v = ((opts.variant % 3) + 3) % 3
  if (where) {
    if (v === 0)
      return `${intro} sharing on ${where}. I recommend products I actually use, with honest notes on what works and what doesn't. My audience comes to me for practical picks, so I only partner with brands I would buy from myself.`
    if (v === 1)
      return `${intro} who writes about the things I use every week on ${where}. I like clear, useful reviews over hype, and I want long partnerships with a few good brands rather than many one-off posts.`
    return `Hi, ${intro.replace(/^I'm /, "I'm ")}. You will find my work on ${where}. I focus on real-life use: how a product fits into a normal week, what it costs, and who it is for. I'm looking for brands that value honest recommendations.`
  }
  if (v === 0)
    return `${intro} looking to work with brands whose products I can stand behind. I focus on honest, practical recommendations and I'm adding my channels so brands can see my work.`
  if (v === 1)
    return `${intro} who wants long partnerships with a few good brands. I care about clear, useful recommendations over hype.`
  return `${intro} building my partner profile. I focus on real-life use and on being upfront about what a product does well and where it falls short.`
}

/** Deterministic fake reach so the preview feels real. Shown with a "sample" label. */
export function sampleReach(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return 1800 + (h % 48000)
}

export function formatReach(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}
