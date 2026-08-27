export const PAGES = [
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
        permission: "payments.money.request",
        description:
            "Ask another person to pay you. The recipient gets a request they can approve or decline.",
    },

    {
        id: "international_transfer",
        title: "International Transfer",
        route: "/payments?payment_action=send_money&send_type=international",
        permission: "payments.international.send",
        description:
            "Send money abroad — bank deposit, cash pickup or mobile wallet depending on the destination country. Offer this whenever someone says international, abroad, overseas, or names another country.",
    },
    {
        id: "wallet_transfer",
        title: "Wallet to Wallet Transfer",
        route: "/payments?payment_action=send_money&send_type=wallet",
        permission: "payments.wallet.send",
        description:
            "Send money to another InstaPay user's wallet. Instant, and stays inside InstaPay.",
    },
    {
        id: "qr_pay",
        title: "Pay by QR",
        route: "/payments?payment_action=send_money&send_type=qr_pay",
        permission: "payments.qr.send",
        description: "Pay someone by scanning their InstaPay QR code.",
    },
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
        permission: "payments.crypto.send",
        description: "Send a payment from a crypto wallet, with the converted value shown before confirming.",
    },
    {
        id: "send_quote",
        title: "Send A Quote",
        route: "/payments?payment_action=send_quote",
        permission: "payments.quote.send",
        description: "Propose an amount and terms to someone before any money moves.",
    },
    {
        id: "airtime",
        title: "Airtime Top-Up",
        route: "/payments?payment_action=airtime",
        permission: "payments.airtime.topup",
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

    {
        id: "wallets",
        title: "My Wallets",
        route: "/wallets",
        permission: "wallet.view",
        description:
            "Every currency wallet the user holds, with available and blocked balances. New currency wallets are opened here.",
    },
    {
        id: "convert_funds",
        title: "Convert Funds",
        route: "/wallets?action=convert",
        permission: "wallet.view",
        description:
            "Convert money from one currency wallet to another. Opens the currency conversion window on the wallets page, where the amount, source and target currencies are chosen and the rate and fee are shown before confirming. Needs at least two currency wallets.",
    },
    {
        id: "withdraw_balance",
        title: "Withdraw Balance",
        route: "/wallets?action=withdraw",
        permission: "wallet.payment.withdraw",
        description:
            "Withdraw money out of a currency wallet to a verified receiving account. Opens the withdrawal window on the wallets page.",
    },
    {
        id: "add_currency",
        title: "Add Currency Wallet",
        route: "/wallets?action=add-currency",
        permission: "wallet.currencies.add",
        description:
            "Open a new currency wallet. Opens the add-currency window on the wallets page, where a currency is picked to create the wallet.",
    },
    {
        id: "wallet_statement",
        title: "Download Wallet Statement",
        route: "/wallets?action=statement",
        permission: "transactions.wallet.export",
        description:
            "Download a statement for a currency wallet as PDF or CSV. Opens the download-statement window on the wallets page.",
    },
    {
        id: "block_wallet",
        title: "Block or Unblock Wallet",
        route: "/wallets",
        permission: "wallet.status.update",
        description:
            "Block or unblock a currency wallet. Takes the user to the wallets page where the 'Block the Wallet' button acts on the selected wallet — the user picks the wallet and presses it themselves. A wallet set as default cannot be blocked.",
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
        id: "mastercard_add_funds",
        title: "Load Money onto the Card",
        route: "/my-mastercard?addFundsMobile=true",
        permission: "mastercard.funds.add",
        description:
            "Opens My Mastercard with the top-up window already up, for moving money from a wallet onto the card.",
    },
    {
        id: "mastercard_card_to_card",
        title: "Card to Card Transfer",
        route: "/my-mastercard?ctcMobile=true",
        permission: "mastercard.transfer.card-to-card",
        description:
            "Opens My Mastercard with the card-to-card transfer window already up, for moving money between two cards.",
    },
    {
        id: "mastercard_card_to_wallet",
        title: "Card to Wallet Transfer",
        route: "/my-mastercard?ctwMobile=true",
        permission: "mastercard.transfer.card-to-wallet",
        description:
            "Opens My Mastercard with the card-to-wallet window already up, for moving money off the card back into a wallet.",
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
        id: "iban_deposit",
        title: "Virtual IBAN Deposit Details",
        route: "/virtual-IBAN?action=deposit",
        permission: "virtual-iban.details.view",
        description:
            "Show the deposit details (IBAN, BIC and reference) for receiving a bank transfer into the virtual IBAN. Opens the deposit window on the virtual IBAN page.",
    },
    {
        id: "iban_convert_funds",
        title: "Move Virtual IBAN Funds",
        route: "/virtual-IBAN?action=convert",
        permission: "virtual-iban.funds.convert",
        description:
            "Move funds from the virtual IBAN into an InstaPay wallet. Opens the convert-funds window on the virtual IBAN page, where the amount and destination wallet are chosen and the fee is shown before confirming.",
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
        id: "payment_requests_received",
        title: "Requests Waiting on Me",
        route: "/payment-requests?tab=received",
        permission: "payment-request.view",
        description:
            "Payment Requests opened on the received tab — the ones other people sent, waiting for this user to approve or decline.",
    },
    {
        id: "payment_requests_sent",
        title: "Requests I Sent",
        route: "/payment-requests?tab=sent",
        permission: "payment-request.view",
        description:
            "Payment Requests opened on the sent tab — the ones this user asked others to pay, and where each stands.",
    },
    {
        id: "quotations",
        title: "Quotations",
        route: "/quotations",
        permission: "quotations.view",
        description: "Every quote sent and received, with current status.",
    },
    {
        id: "quotations_received",
        title: "Quotes I Received",
        route: "/quotations?tab=received",
        permission: "quotations.view",
        description:
            "Quotations opened on the received tab — quotes other people sent this user to accept or decline.",
    },
    {
        id: "quotations_sent",
        title: "Quotes I Sent",
        route: "/quotations?tab=sent",
        permission: "quotations.view",
        description:
            "Quotations opened on the sent tab — quotes this user proposed to others, and their current status.",
    },
    {
        id: "invoices",
        title: "Invoices",
        route: "/invoices",
        permission: "invoices.view",
        description: "Create and send invoices, share a payment link per invoice, track which are paid.",
    },
    {
        id: "create_invoice",
        title: "Create Invoice",
        route: "/invoices?action=create",
        permission: "invoices.create",
        description:
            "Create a new invoice to send to someone. Opens the create-invoice window on the invoices page.",
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

    {
        id: "payment_address",
        title: "My Payment Address",
        route: "/payment-address",
        permission: "payment-address.view",
        description:
            "The user's shareable public page. Anyone with the link can pay them without needing account details.",
    },
    {
        id: "quick_qr_pay",
        title: "Pay from a QR Image",
        route: "/quick-qrpay",
        description:
            "Upload a saved QR code image to pay it, for when the code was sent as a picture rather than shown on a screen to scan.",
    },
    {
        id: "insta_media",
        title: "InstaPay Media",
        route: "/Insta-media",
        description:
            "InstaPay's product for creators — live streaming, posting and publishing video, with one login across the creators a user follows.",
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

    {
        id: "settings",
        title: "Settings",
        route: "/settings",
        permission: "settings.view",
        description:
            "Basic info, security, verification, receiving accounts, saved cards, data export, account deletion.",
    },
    {
        id: "edit_basic_info",
        title: "Edit Basic Info",
        route: "/settings?tab=basic&editmode=true",
        permission: "settings.view",
        description:
            "Settings opened on Basic Info with editing already switched on — for changing name, username or other personal details straight away.",
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

    {
        id: "dashboard",
        title: "Dashboard",
        route: "/dashboard/default",
        permission: "dashboard.view",
        description: "Overview: balances, quick actions, recent transactions and recent beneficiaries.",
    },
];

export const getPageById = (id) => PAGES.find((page) => page.id === id);

export const STARTER_PROMPTS = [
    "How do I send money abroad?",
    "Where can I download my statements?",
    "Why is my account limited?",
    "What fees will I pay on a transfer?",
];
