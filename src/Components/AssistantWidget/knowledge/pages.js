/**
 * The pages the assistant is allowed to navigate to.
 *
 * This registry has two jobs:
 *
 *  1. **Client-side allowlist.** When the agent calls the `navigate_to_page`
 *     tool, the handler resolves `id` here. An id that isn't in this list is
 *     refused, so a hallucinated destination can never move the user.
 *  2. **Source for the agent's instructions.** `npm run agent:config` renders
 *     this list into the system prompt and tool schema you paste into the Agent
 *     Builder workflow, so the dashboard and the code cannot drift apart.
 *
 * `permission` uses the same keys as `usePermission()` / `MENU`. The agent is
 * not told which permissions a given user has — it may suggest anything, and
 * the handler refuses with a reason the agent can explain. That keeps the
 * workflow static while staying correct per user.
 */

export const PAGES = [
    /* ---------------------------------------------------------------- money in */
    {
        id: "add_funds",
        title: "Add Funds",
        route: "/add-funds",
        description:
            "Top up a wallet by card, bank transfer or crypto. The user picks the method and the wallet to credit.",
    },
    {
        id: "request_money",
        title: "Request Money",
        route: "/payments?payment_action=req_money",
        permission: "payments.view",
        description:
            "Ask another person to pay you. The recipient gets a request they can approve or decline.",
    },

    /* --------------------------------------------------------------- money out */
    {
        id: "send_money",
        title: "Send Money",
        route: "/payments?payment_action=send_money",
        permission: "payments.view",
        description:
            "Send money to a saved beneficiary or a new one. Fees and the exchange rate are shown on the confirmation step before the transfer goes out.",
    },
    {
        id: "pay_with_crypto",
        title: "Pay With Crypto",
        route: "/payments?payment_action=send_crypto",
        permission: "payments.view",
        description: "Send a payment from a crypto wallet, with the converted value shown before confirming.",
    },
    {
        id: "send_quote",
        title: "Send A Quote",
        route: "/payments?payment_action=send_quote",
        permission: "payments.view",
        description: "Propose an amount and terms to someone before any money moves.",
    },
    {
        id: "airtime",
        title: "Airtime Top-Up",
        route: "/payments?payment_action=airtime",
        permission: "payments.view",
        description: "Buy mobile airtime for a phone number by operator and amount.",
    },
    {
        id: "payments",
        title: "Payments",
        route: "/payments",
        permission: "payments.view",
        description:
            "The hub for everything money-out: send money, request money, quotes, crypto and airtime.",
    },
    {
        id: "third_party_senders",
        title: "Third Party Senders",
        route: "/third-party-senders",
        permission: "payments.send-as-third-party.view",
        description:
            "Register people or companies allowed to send funds on the user's behalf so those transfers clear compliance.",
    },

    /* ---------------------------------------------------------- money at rest */
    {
        id: "wallets",
        title: "My Wallets",
        route: "/wallets",
        permission: "wallet.view",
        description:
            "Every currency wallet the user holds, with available and blocked balances. New currency wallets are opened here.",
    },
    {
        id: "portfolio",
        title: "My Portfolio",
        route: "/portfolio",
        permission: "portfolio.view",
        description: "Combined value of holdings across wallets and assets, converted to the base currency.",
    },
    {
        id: "mastercard",
        title: "My Mastercard",
        route: "/my-mastercard",
        permission: "mastercard.view",
        description:
            "Order a card, view its details, load it from a wallet, or freeze it. Card top-ups draw from a chosen wallet.",
    },
    {
        id: "virtual_iban",
        title: "My Virtual IBAN",
        route: "/virtual-IBAN",
        permission: "virtual-iban.view",
        description:
            "A bank account number in the user's own name for receiving ordinary bank transfers into InstaPay.",
    },
    {
        id: "iban_onboarding",
        title: "IBAN Onboarding",
        route: "/onboarding-IBAN",
        permission: "virtual-iban.view",
        description: "Apply for a virtual IBAN: confirm details, choose a plan, activate.",
    },
    {
        id: "iban_statements",
        title: "Statements & Letters",
        route: "/virtual-IBAN/statements-letters",
        permission: "virtual-iban.view",
        description:
            "Download account statements for a date range, plus official account confirmation letters.",
    },
    {
        id: "iban_beneficiaries",
        title: "Virtual IBAN Beneficiaries",
        route: "/virtual-IBAN/beneficiaries-virtual",
        permission: "virtual-iban.view",
        description: "Bank accounts the virtual IBAN can push funds out to over the banking rails.",
    },

    /* ------------------------------------------------------------------ records */
    {
        id: "transactions",
        title: "Transactions",
        route: "/transactions",
        permission: "transactions.main.view",
        description:
            "Everything in and out, filterable by date, wallet, type and status. Individual entries open for full detail and a downloadable receipt.",
    },
    {
        id: "schedules",
        title: "Schedules",
        route: "/other-transactions",
        permission: "schedules.view",
        description: "Recurring and future-dated transfers. Upcoming runs can be edited or cancelled here.",
    },
    {
        id: "payment_requests",
        title: "Payment Requests",
        route: "/payment-requests",
        permission: "payment-request.view",
        description: "Requests the user has sent and requests waiting on them to approve or decline.",
    },
    {
        id: "quotations",
        title: "Quotations",
        route: "/quotations",
        permission: "quotations.view",
        description: "Every quote sent and received, with current status.",
    },
    {
        id: "invoices",
        title: "Invoices",
        route: "/invoices",
        permission: "invoices.view",
        description: "Create and send invoices, share a payment link per invoice, track which are paid.",
    },
    {
        id: "analytics",
        title: "Analytics",
        route: "/analytics",
        permission: "analytics.view",
        description: "Money flow over time — inflows, outflows and activity by category.",
    },
    {
        id: "activity_feed",
        title: "Activity Feed",
        route: "/activity",
        permission: "activity-logs.view",
        description: "Audit trail: sign-ins, changes and actions taken on the account, with timestamps.",
    },

    /* ------------------------------------------------------------------- people */
    {
        id: "beneficiaries",
        title: "Beneficiaries",
        route: "/beneficiaries",
        permission: "beneficiaries.view",
        description: "Saved list of people and businesses the user pays, with their bank or wallet details.",
    },
    {
        id: "add_beneficiary",
        title: "Add a Beneficiary",
        route: "/beneficiaries/add",
        permission: "beneficiaries.add",
        description:
            "Register a new recipient. The required fields depend on the destination country and payout method.",
    },
    {
        id: "referrals",
        title: "Referrals",
        route: "/referrals",
        permission: "referrals.view",
        description: "Personal invite link, who signed up through it, and rewards earned.",
    },
    {
        id: "delegate_access",
        title: "Delegate Access",
        route: "/delegate-access",
        permission: "delegate-access.view",
        description:
            "Business accounts only: invite team members, assign roles, control what each can see or do.",
    },

    /* ---------------------------------------------------------------- identity */
    {
        id: "payment_address",
        title: "My Payment Address",
        route: "/payment-address",
        permission: "payment-address.view",
        description:
            "The user's shareable public page. Anyone with the link can pay them without needing account details.",
    },
    {
        id: "qr_sticker",
        title: "My QR Code Sticker",
        route: "/chips-in",
        permission: "qr-sticker.view",
        description: "Printable QR pointing at the payment address, downloadable as a poster.",
    },
    {
        id: "profile",
        title: "Profile",
        route: "/my-profile",
        permission: "user-profile.view",
        description:
            "Details other InstaPay users see: display name, username, picture, bio. Legal and KYC details live in Settings instead.",
    },

    /* ---------------------------------------------------------------- settings */
    {
        id: "settings",
        title: "Settings",
        route: "/settings",
        permission: "settings.view",
        description:
            "Basic info, security, verification, receiving accounts, saved cards, data export, account deletion.",
    },
    {
        id: "verification",
        title: "Identity Verification (KYC)",
        route: "/settings?tab=verification",
        permission: "settings.view",
        description:
            "Upload identity documents and track review status. Limits stay reduced until verification is approved — this is the page for 'why is my account limited'.",
    },
    {
        id: "two_factor",
        title: "Two Factor Authentication",
        route: "/settings?tab=tfa",
        permission: "settings.view",
        description: "Link an authenticator app so sign-in and sensitive actions require a code.",
    },
    {
        id: "security_questions",
        title: "Security Questions",
        route: "/settings?tab=security",
        permission: "settings.view",
        description: "Recovery questions used to restore access and confirm sensitive changes.",
    },
    {
        id: "social_accounts",
        title: "Social Network Accounts",
        route: "/settings?tab=social",
        permission: "settings.view",
        description:
            "Link WhatsApp, Telegram and Instagram so the user can transact through the InstaPay chatbot on those apps.",
    },
    {
        id: "receiving_accounts",
        title: "Receiving Accounts",
        route: "/settings?tab=withdrawal",
        permission: "settings.view",
        description:
            "Bank or mobile accounts to withdraw to. This is the page for cashing out or linking a bank account.",
    },
    {
        id: "crypto_accounts",
        title: "Crypto Receiving Accounts",
        route: "/settings?tab=crypto",
        permission: "settings.view",
        description: "External crypto addresses to withdraw to. Network matters when saving an address.",
    },
    {
        id: "update_pin",
        title: "Transaction PIN",
        route: "/update-pin",
        description: "Set or change the PIN that protects payments and sensitive actions.",
    },
    {
        id: "geo_fencing",
        title: "Geo Fencing",
        route: "/geo-fencing",
        permission: "geo-fencing.view",
        description:
            "Restrict which regions the account can be used from. Blocks access from anywhere not allowed.",
    },

    /* --------------------------------------------------------------- overview */
    {
        id: "dashboard",
        title: "Dashboard",
        route: "/dashboard/default",
        permission: "dashboard.view",
        description: "Overview: balances, quick actions, recent transactions and recent beneficiaries.",
    },
];

export const getPageById = (id) => PAGES.find((page) => page.id === id);

/** Starter prompts shown on ChatKit's new-thread screen. */
export const STARTER_PROMPTS = [
    "How do I send money abroad?",
    "Where can I download my statements?",
    "Why is my account limited?",
    "What fees will I pay on a transfer?",
];
