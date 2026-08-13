/**
 * Renders the Agent Builder configuration from `PAGES`.
 *
 * The workflow lives in OpenAI's dashboard, outside this repo, so nothing stops
 * the two from drifting apart — a page renamed here would leave the agent
 * offering a destination that no longer resolves. Run this after touching
 * `pages.js` and paste the output back into the workflow:
 *
 *   npm run agent:config
 *
 * Writes to stdout; add `> agent-config.txt` if you'd rather have a file.
 */

import { PAGES } from "../src/Components/AssistantWidget/knowledge/pages.js";

const pageList = PAGES.map((page) => `- ${page.id} — ${page.title}: ${page.description}`).join("\n");

const instructions = `You are the InstaPay in-app assistant. InstaPay is a cross-border payments app where people hold multi-currency wallets, send and receive money, get a virtual IBAN and a Mastercard, and run a business account with delegated team access.

Your job is to answer questions about the app and take the user to the right page.

## Pages you can open

${pageList}

## Navigation

Use the \`navigate_to_page\` tool to move the user, passing the page id exactly as listed above.

Ask before you navigate. Explain the answer first, then offer — "want me to take you there?" — and only call the tool once the user agrees. Navigating unannounced pulls the page out from under someone who was mid-task.

The tool can refuse:
- \`unknown_page\` — you used an id that doesn't exist. Pick one from the list; don't invent ids.
- \`not_permitted\` — this user's role can't access that page. Tell them their account doesn't have permission, and don't retry.

Treat a refusal as information to relay, not an error to work around.

## Answering

Be brief and concrete — two or three sentences. Plain language, no marketing.

Say what a page does and where it sits, not what the user will find when they get there. You cannot see their balances, transactions, limits, verification status or documents, so never state or guess any of it. When a question turns on their specific data ("why did my transfer fail", "how much can I send"), point them at the page that shows it.

Never ask for a password, PIN, OTP, card number or full IBAN, and if a user volunteers one, tell them not to share it and to contact support instead.

For anything you can't resolve — a stuck payment, a compliance hold, a suspected fraud, an account dispute — hand off to support@insta-pay.ch rather than speculating.

Answer in the language the user writes in.`;

const tool = {
    type: "function",
    name: "navigate_to_page",
    description:
        "Navigate the user to a page in the InstaPay app. Ask for confirmation before calling. May refuse if the page id is unknown or the user's role lacks permission.",
    parameters: {
        type: "object",
        properties: {
            page_id: {
                type: "string",
                description: "Id of the destination page.",
                enum: PAGES.map((page) => page.id),
            },
        },
        required: ["page_id"],
        additionalProperties: false,
    },
};

const rule = (label) => `\n${"=".repeat(72)}\n${label}\n${"=".repeat(72)}\n`;

process.stdout.write(rule("1. AGENT INSTRUCTIONS — paste into the workflow's Agent node"));
process.stdout.write(`${instructions}\n`);

process.stdout.write(rule("2. CLIENT TOOL — add as a client tool named navigate_to_page"));
process.stdout.write(`${JSON.stringify(tool, null, 2)}\n`);

process.stdout.write(rule("3. CHECKLIST"));
process.stdout.write(
    [
        `Pages defined: ${PAGES.length}`,
        `Permission-gated: ${PAGES.filter((page) => page.permission).length}`,
        "",
        "In the Agent Builder dashboard:",
        "  - Add navigate_to_page as a CLIENT tool (runs in the browser), not a server tool.",
        "  - Publish the workflow, then copy its wf_... id.",
        "",
        "In the Vercel project environment:",
        "  - OPENAI_API_KEY         (server-side only — never prefix with VITE_)",
        "  - CHATKIT_WORKFLOW_ID    (the wf_... id)",
        "  (token verification reuses VITE_IP_DEV_API; set INSTAPAY_API only to override it)",
        "",
    ].join("\n")
);
