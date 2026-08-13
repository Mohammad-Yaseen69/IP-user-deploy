# Assistant widget

Floating AI assistant, backed by an **OpenAI Agent Builder** workflow through
**ChatKit**. It answers questions about InstaPay and can navigate the user to
the right page.

Mounted in `src/Layout/Layout.jsx` and `src/Layout/AgentLayout.jsx`, so it only
appears on authenticated pages — the session endpoint needs the user's token.

## Architecture

```
Browser                          This repo                    OpenAI
───────                          ─────────                    ──────
AssistantWidget
  └─ useChatKit
       ├─ getClientSecret ─────► /api/chatkit/session ──────► POST /v1/chatkit/sessions
       │                           (holds OPENAI_API_KEY)       └─ returns client_secret
       │                           verifies the InstaPay token
       │
       └─ <ChatKit> ◄──────────────────────────────────────► Agent Builder workflow
             │                                                  (hosted in the dashboard)
             └─ onClientTool ◄── navigate_to_page ──────────────┘
                  └─ useNavigationTool → react-router navigate()
```

The OpenAI API key never reaches the browser. A Vite bundle is public — a key in
it would be extracted and billed to your account within hours. The browser gets
only a short-lived `client_secret`.

## Two guarantees the model cannot override

- **Allowlist.** `navigate_to_page` resolves its `page_id` against `PAGES` in
  `knowledge/pages.js`. An id that isn't there is refused, so a hallucinated
  destination can never move the user.
- **Permissions.** A page the current user may not open is refused with
  `not_permitted`, which the agent reads back and explains. The workflow is the
  same for everyone; correctness per user is enforced in the browser, where the
  permissions actually live.

Both refusals come back as ordinary tool results, so the agent responds to them
in conversation instead of the turn erroring out.

The agent is also instructed to **ask before navigating** — explain first, offer,
then call the tool once the user agrees. That is a prompt-level behaviour, not a
hard guarantee; the two rules above are the ones enforced in code.

## Files

| File | Role |
| --- | --- |
| `knowledge/pages.js` | Page registry — the allowlist *and* the source of the agent's page list |
| `useNavigationTool.js` | Client tool handler: allowlist + permission checks, then navigate |
| `index.jsx` | Launcher, panel, session handshake, ChatKit config |
| `Icons.jsx` | Launcher icons |
| `styles.module.css` | Launcher and panel styles (ChatKit styles itself) |
| `../../../api/chatkit/session.js` | Vercel function that mints the session |
| `../../../scripts/generateAgentConfig.js` | Renders the dashboard config from `pages.js` |

Tests live in `src/test/Components/`: `AssistantPages` (registry integrity),
`AssistantNavigationTool` (allowlist, permissions, deep links), `AssistantWidget`
(gating, panel, session handshake).

## Setup

### 1. Build the workflow in Agent Builder

Generate the configuration from the page registry so the dashboard and the code
cannot drift apart:

```bash
npm run agent:config
```

Paste section 1 into the workflow's Agent node instructions, and add section 2
as a **client tool** named `navigate_to_page`. It must be a client tool, not a
server tool — it runs in the browser. Publish the workflow and copy its `wf_…`
id.

Re-run this whenever `pages.js` changes.

### 2. Allowlist your domain

ChatKit verifies the host domain before it will render — the widget silently
fails to appear otherwise. Add your domains (production, preview, and
`localhost` for development) at:

<https://platform.openai.com/settings/organization/security/domain-allowlist>

### 3. Set the environment variables

In the Vercel project settings — **not** in the repo, and never with a `VITE_`
prefix, which would inline them into the public bundle:

| Variable | Value |
| --- | --- |
| `OPENAI_API_KEY` | Your OpenAI key |
| `CHATKIT_WORKFLOW_ID` | The `wf_…` id from step 1 |
| `CHATKIT_WORKFLOW_VERSION` | Optional — pins a published version |
| `INSTAPAY_API` | Optional — overrides the origin used for token verification, which otherwise reuses `VITE_IP_DEV_API` |

### 4. The CDN script

`index.html` loads the ChatKit web component from OpenAI's CDN. The npm package
ships **types only** — without that script tag the widget renders nothing. It is
already in place; just don't remove it.

## Local development

`npm run dev` serves the assistant end to end — no Vercel CLI needed.
`scripts/viteApiPlugin.js` runs the `api/**` handlers inside the Vite dev
server, because `vite dev` on its own only serves the SPA and
`/api/chatkit/session` would 404. On Vercel the platform runs those handlers
itself and the plugin is not part of the build.

Put the server-side variables in `.env.local` (gitignored). The plugin loads
non-`VITE_` variables into `process.env` for the handlers; Vite still keeps them
out of the client bundle.

Two things that are easy to miss locally:

- **`http://localhost:5173` must be in the OpenAI domain allowlist**, or ChatKit
  renders nothing at all and reports no error.
- **The widget only appears once signed in**, since it needs the user's token —
  so the app's own `VITE_*` variables have to be working too.

Smoke-test the endpoint without any credentials:

```bash
curl -i -X POST http://localhost:5173/api/chatkit/session -H "Content-Type: application/json" -d "{}"
```

`401 unauthenticated` is the healthy answer: the handler ran and its environment
resolved. `500 assistant_not_configured` means `OPENAI_API_KEY` or
`CHATKIT_WORKFLOW_ID` is missing, and `404` means the plugin isn't loaded.

## Adding a page

Append to `PAGES` in `knowledge/pages.js`:

```js
{
    id: "snake_case_id",        // becomes a value in the tool's enum
    title: "Human Readable",
    route: "/some-page?tab=x",  // must be a real route
    permission: "some.view",    // optional; omit if everyone may open it
    description: "What the page does, in prose — the agent reads this to decide when to offer it.",
}
```

Then re-run `npm run agent:config` and update the workflow. The registry tests
will fail on a duplicate id, a non-snake_case id, a relative route or a missing
field, but **nothing can detect a stale dashboard** — that step is manual.

## Migration: Agent Builder shuts down 30 November 2026

OpenAI has deprecated Agent Builder. ChatKit is not deprecated, and the frontend
here is unaffected by the change — when you move to a self-hosted ChatKit server
built on the Agents SDK, `api/chatkit/session.js` is the only file that changes.
The widget keeps calling the same endpoint and the client tool contract stays as
it is.

Worth doing before the deadline rather than on it.
