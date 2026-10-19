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

## Files

| File                     | Role                                                    |
| ------------------------ | ------------------------------------------------------- |
| `index.jsx`              | Launcher, panel, composer, signed-in gate               |
| `useAssistantSession.js` | Token handshake, refresh-and-retry on 401               |
| `useAssistant.js`        | Conversation state, the call to ip-bot, history         |
| `MessageList.jsx`        | Message rendering and starter prompts                   |
| `useNavigationTool.js`   | Allowlist + permission check, then navigate             |
| `useVoiceInput.js`       | Recording, container negotiation, transcription         |
| `knowledge/pages.js`     | Page registry — the allowlist and the agent's page list |
| `Icons.jsx`              | Inline icons                                            |
| `styles.module.css`      | Styles                                                  |

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
