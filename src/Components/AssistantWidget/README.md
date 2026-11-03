# Assistant widget

Floating AI assistant. Answers questions about InstaPay and navigates the user
to the right page.

There is **no AI code and no API key in this repo**. The agent lives in the
`ip-bot` service (`instapay-chatbot`); this is just the chat UI plus the
navigation it is allowed to perform.

Mounted in `src/Layout/Layout.jsx` and `src/Layout/AgentLayout.jsx`, so it only
appears once the user is signed in — the bot verifies their token.

## Session handshake

When the panel first opens, `useAssistantSession` exchanges the user's InstaPay
token for a short-lived assistant token and keeps it in memory. Every message
and voice clip carries that instead.

Without it the bot would verify the InstaPay token against the InstaPay API on
every message — a round-trip per turn, and an assistant that stops working
whenever that API is slow.

`authedFetch` refreshes and retries once on a `401`, so an expired session is
invisible. The token is held in a ref, never in storage, and cleared on sign-out.

## How a turn works

```
widget ──POST {VITE_BOT_API}/api/assistant/chat──► ip-bot
         { message, history, pages }                 └─ WebAssistantAgent
                                                        (@openai/agents)
       ◄────── ndjson stream of deltas, then done ───┘
         └─ text appears as it is written
         └─ useNavigationTool resolves navigateTo → react-router
```

The reply streams as newline-delimited JSON and is rendered chunk by chunk, so
the user watches it being written instead of waiting on a spinner. The closing
`done` event carries the complete text, and `useAssistant` settles on it — a
dropped chunk cannot leave a truncated message on screen.

Plain HTTP, not WebSocket: the exchange is one request then one stream, so a
socket would add reconnects, heartbeats, and a token in the query string
(browsers cannot set headers on a WebSocket) for nothing in return.

## The page list travels with the request

`pages` is built from `knowledge/pages.js`, filtered through `usePermission()`,
and sent on every turn. Two things follow:

- **No duplication.** Routes and permissions stay here, where they already
  live. The bot holds no copy that could drift out of date.
- **No forbidden suggestions.** The agent only ever sees pages this particular
  user may open, so it cannot offer one their role blocks.

Only `id`, `title` and `description` are sent. Routes and permissions never
leave the browser — the bot has no use for them, and `useNavigationTool` checks
both again before anything moves.

## What the model cannot override

`useNavigationTool` resolves `navigateTo` against `PAGES` and re-checks the
permission. An id outside the registry resolves to nothing. This is the second
line of defence rather than the first, but it is the one that runs where the
permissions actually are.

The agent asks before navigating — it explains, offers, and only calls its tool
once the user agrees. That is prompt-level behaviour; the allowlist above is the
part enforced in code.

## Voice input

The mic button records with `MediaRecorder` and posts the clip to
`{VITE_BOT_API}/api/assistant/transcribe`. The transcript lands in the composer
rather than being sent, so a misheard word can be fixed first — worth it for a
fintech, and more so for the mixed-language input these users write.

The container is negotiated rather than hardcoded: Chrome and Firefox get
webm/opus, Safari gets mp4. Hardcoding webm is what breaks dictation on Safari
elsewhere. No `language` hint is sent — pinning one degrades the other when
users code-switch.

Microphone access needs HTTPS or localhost. Where `isVoiceInputSupported()` is
false the button simply is not rendered.

## Launcher choreography

The launcher is a gradient orb with a face, animated with framer-motion in
four acts (`useLauncherChoreography`):

1. **Waiting** — the orb stays hidden while anything modal covers the page:
   Bootstrap/reactstrap modals, MUI modals and drawers, any
   `[role=dialog][aria-modal=true]`, or a scroll lock on `body` (which the
   custom forced-files modal sets). The layout opens several of these at sign-in,
   and an intro played under a backdrop is an intro nobody sees. Two
   `MutationObserver`s watch for them. The intro starts once the page has
   finished loading (`window` `load`) and nothing has covered it for a quiet
   period: `QUIET_MS` (2.5 s) on a clean load, because the browser is still
   painting the dashboard and an earlier drop-in loses its frames; only
   `QUIET_AFTER_MODAL_MS` (0.6 s) once something has covered the page, because
   by the time a modal is dismissed the page has long settled. A modal opening
   mid-intro sends the orb back here so the intro replays once it closes. The
   beats (`QUIET_MS`, `QUIET_AFTER_MODAL_MS`, `BUBBLE_DELAY_MS`, `WINK_AT_MS`,
   `WINK_MS`, `INTRO_MS`) are exported from the hook and the tests read them, so
   retuning them does not break the tests.
2. **Intro** — on every page load, the orb drops in from above and floats
   mid-screen with a greeting bubble for about three seconds, winks one eye,
   then docks into the corner. Clicking it opens the chat and ends the intro
   early. Route changes do not replay it: the widget stays mounted in the
   layout.
3. **Docked** — the orb rests over the launcher button, which is a transparent
   hit area, with an "Ask InstaPay" label beside it. Modals opened later cover
   it like any other page content.
4. **Open** — the panel fades and slides in from the right as an overlay; the
   page behind it never shifts. The orb flies into the header slot, and back
   again on close.

Flight targets are measured from layout offsets (`offsetLeft`/`offsetTop`),
not bounding rects, so the panel's entrance transform cannot skew where the
orb lands, and RTL layouts need no special case. `prefers-reduced-motion`
skips the intro and the idle bob and swaps the springs for short fades.

## Files

| File                         | Role                                                    |
| ---------------------------- | ------------------------------------------------------- |
| `index.jsx`                  | Launcher, panel, composer, signed-in gate               |
| `Orb.jsx`                    | The orb: gradient sphere, eyes, idle float              |
| `useLauncherChoreography.js` | Intro, dock and header flight — state and measurement   |
| `useAssistantSession.js`     | Token handshake, refresh-and-retry on 401               |
| `useAssistant.js`            | Conversation state, the call to ip-bot, history         |
| `MessageList.jsx`            | Message rendering and starter prompts                   |
| `useNavigationTool.js`       | Allowlist + permission check, then navigate             |
| `useVoiceInput.js`           | Recording, container negotiation, transcription         |
| `knowledge/pages.js`         | Page registry — the allowlist and the agent's page list |
| `Icons.jsx`                  | Inline icons                                            |
| `styles.module.css`          | Styles                                                  |

Tests: `src/test/Components/` — registry integrity, navigation guards, voice
input, and the chat flow.

## Configuration

One variable, and it is a public URL rather than a secret:

```
VITE_BOT_API_URL=https://your-ip-bot-origin
```

The `VITE_` prefix is not decoration — Vite only exposes prefixed variables to
client code, and anything else is `undefined` in the browser. Without it the
base collapses to an empty string and requests go to the web app's own origin,
where there is no `/api/assistant/*` and every call 404s.

Vite reads `.env` at start-up, so restart the dev server after changing it.

Leave it unset and requests go to the same origin, which is what you want if
ip-bot is reverse-proxied under the web app's domain.

## Adding a page

Append to `PAGES` in `knowledge/pages.js`:

```js
{
    id: "snake_case_id",
    title: "Human Readable",
    route: "/some-page?tab=x",   // stays in the browser
    permission: "some.view",     // optional; an array means any of them
    description: "What the page does, in prose — the agent reads this to decide when to offer it.",
}
```

Optional account flags: `agentOnly`, `businessOnly`, `individualOnly`, `thirdPartyOnly`.
`canOpenPage` in `pages.js` applies all gates, for both the list and navigation.
Keep descriptions to what and where; step-by-step how-to belongs in the user manual the bot searches.

Nothing to redeploy on the bot side: the list is sent with each request. The
registry tests fail on a duplicate id, a non-snake_case id, a relative route or
a missing field.
