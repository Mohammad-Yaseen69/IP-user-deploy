// Gates, all optional: `permission` (a key, or an array meaning any of them),
// `agentOnly`, `businessOnly`, `individualOnly`, `thirdPartyOnly`.
// Step-by-step how-to lives in the user manual the bot searches; keep these to what and where.
export const PAGES = [
  {
    id: "add_funds",
    title: "Add Funds",
    route: "/add-funds",
    permission: "wallet.payment.topup",
    description:
      "Top up a currency wallet. Pick the wallet, the amount, then a channel: Mobile Wallet, PayPal, Bank Deposit, Bank Transfer (Europe, by connecting a bank) or Crypto Transfer (needs verified identity). Card top-ups are currently unavailable. Which channels show depends on the account and country. This does not fund the virtual IBAN; that is Virtual IBAN Crypto or Virtual IBAN Deposit Details.",
  },
  {
    id: "add_crypto_funds",
    title: "Top Up a Crypto Wallet",
    route: "/add-funds?type=crypto",
    permission: "wallet.payment.topup",
    description:
      "Add Funds opened on the crypto option: pick a crypto (USDT) wallet, enter the amount and pay through a hosted crypto checkout. Only available if crypto top-ups are enabled for the account.",
  },
  {
    id: "request_money",
    title: "Request Money",
    route: "/payments?payment_action=req_money",
    permission: "payments.money.request",
    description:
      "Ask one or more people to pay you — pick saved beneficiaries or search users by name, username, email or phone. A request can be one-off, scheduled or recurring. Requests are then tracked in Payment Requests.",
  },
  {
    id: "international_transfer",
    title: "International Transfer",
    route: "/payments?payment_action=send_money&send_type=international",
    permission: "payments.international.send",
    description:
      "Send money abroad. The recipient can receive it to a bank account, cash pickup, mobile wallet or payment card, depending on the destination country. Offer this whenever someone says international, abroad, overseas, or names another country. Accounts allowed to send for third parties choose the sender here too.",
  },
  {
    id: "wallet_transfer",
    title: "Wallet to Wallet Transfer",
    route: "/payments?payment_action=send_money&send_type=wallet",
    permission: "payments.wallet.send",
    description:
      "Send money to another InstaPay user by wallet ID, username, email or phone. It can go now, on a scheduled date, or as a recurring subscription, and several recipients can be paid at once by uploading a CSV (Bulk Recipients). People not on InstaPay can be invited.",
  },
  {
    id: "non_instapay_send",
    title: "Send to Someone Not on InstaPay",
    route: "/payments?payment_action=send_money&send_type=non-instapay",
    permission: "payments.non-instapay.send",
    description:
      "Send money to a phone number that has no InstaPay account; they claim it by signing up. Unclaimed payments are listed under Previous Transactions, where they can be cancelled, and they expire after 40 days.",
  },
  {
    id: "qr_pay",
    title: "Pay by QR",
    route: "/payments?payment_action=send_money&send_type=qr_pay",
    permission: "payments.qr.send",
    description:
      "Pay someone's InstaPay QR code: scan it with the camera, upload a picture of it, or type the payment code. The payment can go now, on a scheduled date, or recur.",
  },
  {
    id: "send_money",
    title: "Send Money",
    route: "/payments?payment_action=send_money",
    permission: [
      "payments.international.send",
      "payments.wallet.send",
      "payments.qr.send",
      "payments.non-instapay.send",
    ],
    description:
      "The choice between the four ways to send: international transfer, wallet to wallet, QR code, or to someone not on InstaPay. Fees and the exchange rate are shown on the confirmation step. The transfer is paid from an InstaPay wallet, PayPal or a mobile wallet depending on the country; card payment is currently unavailable.",
  },
  {
    id: "send_quote",
    title: "Send A Quote",
    route: "/payments?payment_action=send_quote",
    permission: "payments.quote.send",
    description:
      "Propose an amount to someone before any money moves, with a title, description and attachments. Switching on Allow Receiver to Bargain lets them counter-offer. Quotes are then tracked in Quotations.",
  },
  {
    id: "airtime",
    title: "Top-Up and eSIM",
    route: "/payments?payment_action=airtime",
    permission: ["payments.airtime.topup", "payments.esim.buy", "payments.esim.manage"],
    description:
      "Buy mobile airtime for a phone number, or buy an eSIM for travel data; already-bought eSIMs are under Manage purchased eSIM in the same flow. Send anyone asking about top-ups, credit, roaming or a travel data plan here.",
  },
  {
    id: "payments",
    title: "Payments",
    route: "/payments",
    permission: "payments.view",
    description:
      "The payments hub: Send Money, Request Money, Send A Quote, and Top-Up and eSIM. Crypto is not here — it is in Crypto Hub.",
  },
  {
    id: "third_party_senders",
    title: "Third Party Senders",
    route: "/third-party-senders",
    permission: "payments.send-as-third-party.view",
    thirdPartyOnly: true,
    description:
      "Saved senders the user sends international transfers on behalf of, so their details don't have to be re-entered. Add, edit or remove individual and business senders; the sender is chosen during an international transfer.",
  },

  {
    id: "wallets",
    title: "My Wallets",
    route: "/wallets",
    permission: "wallet.view",
    description:
      "The user's currency wallets with total, available and blocked balances. From here: add a currency, set the default wallet, top up, convert, withdraw, download a statement, block a wallet or switch it off, and see the account limits. Crypto wallets are not here; they are in Crypto Hub.",
  },
  {
    id: "account_limits",
    title: "Account Limits",
    route: "/wallets",
    permission: "wallet.limits.view",
    description:
      "The User Account Limit section on My Wallets: balance limit, minimum and maximum top-up, maximum per transaction, incoming and sending limits per day, month and year, and the number of transactions allowed. The page for 'what are my limits'.",
  },
  {
    id: "convert_funds",
    title: "Convert Funds",
    route: "/wallets?action=convert",
    permission: "wallet.payment.conversion",
    description:
      "Convert money between two of the user's wallets, including USDT to and from ordinary currencies. The rate and fee are shown before confirming and the quote expires after a short time. Needs at least two active wallets.",
  },
  {
    id: "withdraw_balance",
    title: "Withdraw Balance",
    route: "/wallets?action=withdraw",
    permission: "wallet.payment.withdraw",
    description:
      "Withdraw from a currency wallet to the default receiving account or another saved one — bank account, cash pickup, mobile wallet, payment card or crypto wallet. Needs verified identity (or business verification), and at least one receiving account saved in Settings.",
  },
  {
    id: "add_currency",
    title: "Add Currency Wallet",
    route: "/wallets?action=add-currency",
    permission: "wallet.currencies.add",
    description:
      "Open a new currency wallet by picking a currency. An account can hold up to 8 wallets.",
  },
  {
    id: "wallet_statement",
    title: "Download Wallet Statement",
    route: "/wallets?action=statement",
    permission: "transactions.wallet.export",
    description:
      "Download a statement for one wallet for a chosen date range, as PDF or CSV. It opens for the selected wallet, so the user may need to switch wallets first.",
  },
  {
    id: "block_wallet",
    title: "Block or Unblock Wallet",
    route: "/wallets",
    permission: "wallet.status.update",
    description:
      "Block or unblock a currency wallet, or switch it on and off with Wallet Status. The user picks the wallet on My Wallets and presses the button themselves. The default wallet cannot be blocked, and a wallet blocked by an admin can only be unblocked by support.",
  },
  {
    id: "crypto_hub",
    title: "Crypto Hub",
    route: "/crypto-wallets",
    permission: "wallet.view",
    description:
      "Where crypto wallets live (USDT today). Add a crypto wallet, add funds to it, send crypto to a saved beneficiary's crypto wallet (Send tab), convert between crypto and ordinary currency (Convert tab), and see each wallet's statement, limits and transactions. Offer this for sending, receiving, converting or cashing out crypto.",
  },
  {
    id: "portfolio",
    title: "My Portfolio",
    route: "/portfolio",
    permission: "portfolio.view",
    description:
      "The user's showcase of their own work — images, videos and PDFs they upload, edit and share, shown on their public profile. Nothing to do with balances or holdings: money across wallets is My Wallets.",
  },
  {
    id: "mastercard",
    title: "My Mastercard",
    route: "/my-mastercard",
    permission: "mastercard.view",
    description:
      "Order a virtual Mastercard (Standard or Premium, in USD; needs verified identity, email, phone and a selfie with ID, and has a fee), then view the card details and balance, freeze and reactivate it, top it up, move money card to card or card to wallet, and add it to Apple Pay or Google Pay. Up to 3 cards.",
  },
  {
    id: "mastercard_add_funds",
    title: "Load Money onto the Card",
    route: "/my-mastercard?addFundsMobile=true",
    permission: "mastercard.funds.add",
    description:
      "Opens My Mastercard with the top-up window up. The card can be loaded from an InstaPay wallet, by card payment or PayPal. Needs an existing card that isn't frozen.",
  },
  {
    id: "mastercard_card_to_card",
    title: "Card to Card Transfer",
    route: "/my-mastercard?ctcMobile=true",
    permission: "mastercard.transfer.card-to-card",
    description:
      "Opens My Mastercard with the card-to-card window up. The recipient card is found by its last 4 digits, the holder's username or saved contacts, and the transfer is confirmed with a code.",
  },
  {
    id: "mastercard_card_to_wallet",
    title: "Card to Wallet Transfer",
    route: "/my-mastercard?ctwMobile=true",
    permission: "mastercard.transfer.card-to-wallet",
    description:
      "Opens My Mastercard with the card-to-wallet window up, for moving money off the card into the user's own wallet or another user's wallet.",
  },
  {
    id: "mastercard_transactions",
    title: "Card Transactions",
    route: "/my-mastercard?showT=true",
    permission: "mastercard.view",
    description:
      "My Mastercard scrolled to the card's transaction list, which can be searched and filtered by date.",
  },
  {
    id: "mastercard_statement",
    title: "Card Statement",
    route: "/my-mastercard",
    permission: "mastercard.statement.download",
    description:
      "Download a card statement for a date range as PDF or DOCX, with the Download Statement button on My Mastercard.",
  },
  {
    id: "virtual_iban",
    title: "My Virtual IBAN",
    route: "/virtual-IBAN",
    permission: "virtual-iban.view",
    description:
      "A bank account number in the user's own name. It receives bank transfers, and crypto through a crypto top-up or a crypto channel. Quick actions: Deposit, Send money (SEPA and SWIFT), Move & Send to a wallet, Crypto, Unsubscribe, Request money, Beneficiaries, Download statement. Tabs: Overview, Transaction History, My vIBAN details, Compliance, Crypto Channels, Manage. An individual without an IBAN opens one here.",
  },
  {
    id: "iban_deposit",
    title: "Virtual IBAN Deposit Details",
    route: "/virtual-IBAN?action=deposit",
    permission: "virtual-iban.details.view",
    description:
      "The details for receiving a bank transfer into the virtual IBAN. From the EU: account holder, IBAN, BIC and bank. From outside the EU: pick USD or EUR, and the payer must quote the payment reference. Opens the deposit window on the virtual IBAN page.",
  },
  {
    id: "iban_move_money",
    title: "Send Money from the Virtual IBAN",
    route: "/onboarding-IBAN/moneymove",
    permission: "virtual-iban.view",
    description:
      "Send money out of the virtual IBAN by SEPA (euro, standard or instant, to a European bank account) or SWIFT (paid from euro and delivered in USD, at a rate locked at review), or move it to an InstaPay wallet. SEPA and SWIFT are disabled when outgoing transfers are blocked on the IBAN.",
  },
  {
    id: "iban_convert_funds",
    title: "Move Virtual IBAN Funds",
    route: "/virtual-IBAN?action=convert",
    permission: "virtual-iban.funds.convert",
    description:
      "Move funds from the virtual IBAN into one of the user's own InstaPay wallets (labelled Move & Send). The amount, destination wallet and fee are shown before confirming. It does not send to other people.",
  },
  {
    id: "iban_crypto",
    title: "Virtual IBAN Crypto",
    route: "/onboarding-IBAN/crypto",
    permission: "virtual-iban.view",
    description:
      "Crypto actions for the virtual IBAN: top up the IBAN by paying in USDT and receiving euro, convert IBAN euro into the user's InstaPay USDT wallet, or pay out from the IBAN to a saved beneficiary's external crypto wallet. Offer this whenever someone wants to fund their IBAN with crypto or move IBAN money into crypto.",
  },
  {
    id: "iban_crypto_channels",
    title: "Virtual IBAN Crypto Channels",
    route: "/virtual-IBAN?tab=crypto-channels",
    permission: "virtual-iban.details.view",
    description:
      "Add a standing crypto receiving address to the virtual IBAN, one per asset (USDT, USDC, ETH or BTC) with a choice of network. Anything sent to it converts automatically to the IBAN's currency. Opens the Crypto Channels tab on the virtual IBAN page.",
  },
  {
    id: "iban_transactions",
    title: "Virtual IBAN Transaction History",
    route: "/virtual-IBAN?tab=transaction-history",
    permission: "virtual-iban.transactions.view",
    description:
      "The virtual IBAN's transactions with search, status filter and sorting. Each transaction opens for details and a proof-of-payment download; statements download as PDF or CSV from here too.",
  },
  {
    id: "iban_compliance",
    title: "Virtual IBAN Compliance",
    route: "/virtual-IBAN?tab=compliance",
    permission: "virtual-iban.view",
    description:
      "Questions and document requests from the compliance team about the virtual IBAN: upload documents, answer a question or message compliance. If a deadline is missed the account is temporarily restricted until it's resolved. The page for 'why is my IBAN restricted'.",
  },
  {
    id: "iban_pause",
    title: "Pause or Resume the Virtual IBAN",
    route: "/virtual-IBAN?action=unsubscribe",
    permission: "virtual-iban.status.update",
    description:
      "Unsubscribe (pause) the virtual IBAN, or subscribe again to resume it, after choosing a reason and confirming. While unsubscribed, deposits, moves and conversions are disabled, but the balance and transactions stay visible.",
  },
  {
    id: "iban_onboarding",
    title: "Business IBAN Application",
    route: "/onboarding-IBAN",
    permission: "virtual-iban.view",
    businessOnly: true,
    description:
      "Business accounts apply for a virtual IBAN here: company, activity, owners and directors, documents, review, then the assigned pricing and an activation fee paid from a wallet. The status of the application is shown afterwards. Individuals open their IBAN from My Virtual IBAN instead.",
  },
  {
    id: "iban_statements",
    title: "Statements & Letters",
    route: "/virtual-IBAN/statements-letters",
    permission: "virtual-iban.view",
    description:
      "Download account statements for a date range as PDF or CSV, plus the Account & IBAN Confirmation Letter and the International / SWIFT Confirmation Letter (USD or EUR). Letters can be previewed, downloaded or shared as a verification link.",
  },
  {
    id: "iban_beneficiaries",
    title: "Virtual IBAN Beneficiaries",
    route: "/virtual-IBAN/beneficiaries-virtual",
    permission: "virtual-iban.view",
    description:
      "The same saved recipients as Beneficiaries, shown for the virtual IBAN, with their payout channels — bank account (SEPA or SWIFT), mobile wallet or crypto wallet.",
  },

  {
    id: "transactions",
    title: "Transactions",
    route: "/transactions",
    permission: "transactions.main.view",
    description:
      "Everything in and out, with tabs for All, Sent, Received, Requested and Quoted, a search box and a date range. Each entry opens for full detail, and transactions can be given a category and a note.",
  },
  {
    id: "transactions_statement",
    title: "Account Statement",
    route: "/transactions",
    permission: "transactions.main.export",
    description:
      "Download a statement of the whole account for a date range as PDF or CSV, with the export button on the Transactions page.",
  },
  {
    id: "schedules",
    title: "Subscriptions & Scheduled",
    route: "/other-transactions",
    permission: "schedules.view",
    description:
      "Scheduled and recurring payments and payment requests, sent and received. Pending ones can be cancelled; they cannot be edited. Payments that have already been scheduled themselves are here — creating one happens in Send Money or Request Money.",
  },
  {
    id: "plan_subscriptions",
    title: "Plan Subscriptions",
    route: "/other-transactions",
    permission: "schedules.view",
    description:
      "The Plans Subscriptions tab of Subscriptions & Scheduled: plans the user subscribed to, with price, billing cycle and next billing, and Cancel Subscription. This is for plans they pay for — plans they charge others for are Plans & Pricing.",
  },
  {
    id: "payment_requests",
    title: "Payment Requests",
    route: "/payment-requests",
    permission: "payment-request.view",
    description:
      "Requests the user has sent and requests waiting on them. A received request can be accepted (choose the wallet to pay from) or declined; a sent request cannot be cancelled.",
  },
  {
    id: "payment_requests_received",
    title: "Requests Waiting on Me",
    route: "/payment-requests?tab=received",
    permission: "payment-request.view",
    description:
      "Payment Requests opened on the received tab — the ones other people sent, waiting for this user to accept or decline.",
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
    description:
      "Every quote sent and received, with its status. A received quote can be accepted, declined or bargained (counter-offer by a percentage or a custom amount).",
  },
  {
    id: "quotations_received",
    title: "Quotes I Received",
    route: "/quotations?tab=received",
    permission: "quotations.view",
    description:
      "Quotations opened on the received tab — quotes other people sent this user to accept, decline or bargain.",
  },
  {
    id: "quotations_sent",
    title: "Quotes I Sent",
    route: "/quotations?tab=sent",
    permission: "quotations.view",
    description:
      "Quotations opened on the sent tab — quotes this user proposed, and any counter-offers to accept or decline.",
  },
  {
    id: "invoices",
    title: "Invoices",
    route: "/invoices",
    permission: "invoices.view",
    description:
      "Create invoices with a payment link and QR code, then view, edit, download the QR or delete them (not once accepted). Tabs for Invoices, Direct Card Invoice and Plans.",
  },
  {
    id: "create_invoice",
    title: "Create Invoice",
    route: "/invoices?action=create",
    permission: "invoices.create",
    description:
      "Opens the create-invoice window: title, description, amount, receiving wallet, and options for multiple payments and shipping. It produces an invoice link and QR code.",
  },
  {
    id: "plans",
    title: "Plans & Pricing",
    route: "/invoices?tab=plans",
    permission: "invoices.view",
    description:
      "Plans people can subscribe to: create one with a price and a billing cycle (one-time, weekly, monthly, quarterly or yearly), share its link, put it on the payment address, and see or cancel subscribers. This is for subscriptions the user charges others for — plans they pay for are Plan Subscriptions.",
  },
  {
    id: "direct_card_invoices",
    title: "Direct Card Invoices",
    route: "/invoices?tab=direct_card",
    permission: "invoices.view",
    description:
      "Invoices a payer settles straight by card, on their own tab of the invoices page. Creating one asks for the country and the payer's details.",
  },
  {
    id: "analytics",
    title: "Analytics",
    route: "/analytics",
    permission: "analytics.view",
    description:
      "Money in and out over time for a chosen wallet and period, filterable by type — international, wallet to wallet, QR, quotations, requests, payment address and conversion.",
  },
  {
    id: "activity_feed",
    title: "Activity Feed",
    route: "/activity",
    permission: "activity-logs.view",
    businessOnly: true,
    description:
      "Business accounts only: a log of what team members (agents) did on the account, filterable by entity and action. Sign-ins are Login Activity instead.",
  },

  {
    id: "beneficiaries",
    title: "Beneficiaries",
    route: "/beneficiaries",
    permission: "beneficiaries.view",
    description:
      "Saved people and businesses the user pays, with their connected accounts. Search, filter by individual or business, sort, and view, edit or delete each one from its menu.",
  },
  {
    id: "add_beneficiary",
    title: "Add a Beneficiary",
    route: "/beneficiaries?action=add",
    permission: "beneficiaries.add",
    description:
      "Opens the add-beneficiary window on Beneficiaries. The required fields depend on the destination country and the payout method — bank account, mobile wallet, cash pickup, payment card, SEPA or SWIFT bank account, or crypto wallet.",
  },
  {
    id: "edit_beneficiary",
    title: "Edit a Beneficiary",
    route: "/beneficiaries",
    permission: "beneficiaries.edit",
    description:
      "Change a saved recipient's details. Takes the user to the beneficiaries list, where they open the person's menu and choose Edit Beneficiary themselves; Delete Beneficiary is in the same menu.",
  },
  {
    id: "referrals",
    title: "Referrals",
    route: "/referrals",
    permission: "referrals.view",
    description:
      "The user's invite link, who signed up through it, and rewards earned. Earnings can be moved to the main balance or withdrawn externally. Needs a username.",
  },
  {
    id: "delegate_access",
    title: "Delegate Access",
    route: "/delegate-access",
    permission: "delegate-access.view",
    businessOnly: true,
    description:
      "Business accounts only: invite team members (called agents), give them roles and permissions, change their status, resend invites or remove them.",
  },

  {
    id: "payment_address",
    title: "My Payment Address",
    route: "/payment-address",
    permission: "payment-address.view",
    description:
      "The user's public pay page at /pay/<username>: switch it on, choose the receiving currency, copy the link or download its QR, customise the title, description, banner and videos, and show plans. Needs a username.",
  },
  {
    id: "insta_media",
    title: "InstaPay Media",
    route: "/Insta-media",
    description:
      "InstaPay's upcoming product for creators. It is not live yet — the page is a waitlist announcement.",
  },
  {
    id: "qr_sticker",
    title: "My QR Code Sticker",
    route: "/chips-in",
    permission: "qr-sticker.view",
    description:
      "A QR code for each currency wallet that others scan to pay into it. Download it as a sticker or poster, switch it on or off, edit its title and description, or share the link.",
  },
  {
    id: "profile",
    title: "Profile",
    route: "/my-profile",
    permission: "user-profile.view",
    description:
      "How the user's public profile looks to others: name, about me, InstaPay ID and QR, ratings, portfolio and reviews. It is view-only — changes are made in Settings.",
  },
  {
    id: "eshop",
    title: "My e-Shop",
    route: "/store-create",
    permission: "eshop.create",
    description:
      "Create an InstaPay online shop. After accepting the terms, the shop's seller dashboard opens in a new tab; if a shop already exists it opens straight away.",
  },

  {
    id: "settings",
    title: "Settings",
    route: "/settings",
    permission: "settings.view",
    description:
      "Basic info, password, security, verification, receiving accounts, saved cards, notifications, data download and account deletion, each on its own tab.",
  },
  {
    id: "edit_basic_info",
    title: "Edit Basic Info",
    route: "/settings?tab=basic&editmode=true",
    permission: "settings.basic-info.view",
    description:
      "Settings opened on Basic Info with editing switched on. Once identity is verified, name, username, date of birth and address are locked; email and phone changes need a code.",
  },
  {
    id: "verification",
    title: "Identity Verification (KYC)",
    route: "/settings?tab=verification",
    permission: "settings.view",
    individualOnly: true,
    description:
      "Verify identity: complete the profile, answer a few questions, pay the verification fee if one applies, then do the ID check. Extra files the team asks for are uploaded here. Limits stay reduced until it's approved — the page for 'why is my account limited'.",
  },
  {
    id: "business_verification",
    title: "Business Verification (KYB)",
    route: "/settings?tab=verification",
    permission: "settings.business-verification.view",
    businessOnly: true,
    description:
      "Business accounts verify the company here: registration and tax details, directors and company documents, plus the verification fee if one applies. Limits stay reduced until it's approved.",
  },
  {
    id: "two_factor",
    title: "Two Factor Authentication",
    route: "/settings?tab=tfa",
    permission: "settings.view",
    description:
      "Choose how verification codes arrive — email, SMS, WhatsApp or Google Authenticator — and register or remove passkeys for biometric sign-in.",
  },
  {
    id: "security_questions",
    title: "Security Questions",
    route: "/settings?tab=security",
    permission: "settings.security-questions.view",
    description: "Three recovery questions used to restore access and confirm sensitive changes.",
  },
  {
    id: "social_accounts",
    title: "Social Network Accounts",
    route: "/settings?tab=social",
    permission: "settings.social-accounts.view",
    description:
      "Link WhatsApp, Telegram and Instagram so the user can transact through the InstaPay chatbot there. A security PIN must be set first, and linking uses a code entered in the chatbot.",
  },
  {
    id: "receiving_accounts",
    title: "Receiving Accounts",
    route: "/settings?tab=withdrawal",
    permission: "settings.receiving-accounts.view",
    description:
      "Accounts to withdraw to, in the user's own name: bank, mobile wallet and cash pickup (one each per country, up to 3 countries) and USDT crypto wallets (up to 3). Set a default, edit or remove. The page for linking a bank account or saving a crypto address (network matters).",
  },
  {
    id: "change_password",
    title: "Change Your Password",
    route: "/settings?tab=password",
    permission: "settings.password.view",
    description:
      "Set a new sign-in password from inside the account, confirmed with a code. Someone locked out and unable to sign in needs the forgotten-password link on the login screen instead.",
  },
  {
    id: "payment_threshold",
    title: "Quick QR Payment Threshold",
    route: "/settings?tab=threshold",
    permission: "settings.payment-threshold.view",
    description:
      "An optional amount below which QR payments go through without a verification code. Switch it on, change the amount or turn it off. Other payments always need a code.",
  },
  {
    id: "financial_info",
    title: "Financial Info",
    route: "/settings?tab=financial",
    permission: "settings.financial-info.view",
    description:
      "The user's answers to the compliance questions about income, source of funds and expected activity, to view or edit. The tab only appears once answers are on file.",
  },
  {
    id: "nominee_information",
    title: "Nominee Information",
    route: "/settings?tab=nominee",
    permission: "settings.nominee.view",
    description:
      "Who the account passes to. Add, update or remove a nominee and their contact details.",
  },
  {
    id: "how_others_find_you",
    title: "How Others Can Find You",
    route: "/settings?tab=find",
    permission: "settings.how-others-find-you.view",
    description:
      "Whether other InstaPay users can find this account by email or phone. Finding by name and username is always on.",
  },
  {
    id: "notification_settings",
    title: "Notifications",
    route: "/settings?tab=notification",
    permission: "settings.notifications.view",
    description:
      "Which alerts arrive on which channel — email, SMS, Telegram or Instagram — for payments, requests, add funds, quotations, referrals and logins, plus browser push on this device. For turning notifications on or off, not for reading them.",
  },
  {
    id: "api_key",
    title: "API Key",
    route: "/settings?tab=apikey",
    permission: "settings.api-key.view",
    businessOnly: true,
    description:
      "Business accounts only: create, reveal, regenerate or delete the API key for connecting their own systems, and set the webhook URL.",
  },
  {
    id: "login_activity",
    title: "Login Activity",
    route: "/settings?tab=activity",
    permission: "settings.login-activity.view",
    description:
      "Devices and sessions that have signed in, with times — the page for 'was someone else in my account'. Sessions can't be signed out from here; for a suspected break-in, change the password and contact support.",
  },
  {
    id: "saved_cards",
    title: "Manage Saved Cards",
    route: "/settings?tab=cards",
    permission: "settings.saved-cards.view",
    description:
      "Cards saved from earlier payments, which can be deleted here (new cards aren't added on this page). This is not the InstaPay Mastercard, which is My Mastercard.",
  },
  {
    id: "download_data",
    title: "Download Your Data",
    route: "/settings?tab=data",
    permission: "settings.download-data.view",
    description:
      "Pick which parts of the account's data to include and download them straight away as PDF or DOCX.",
  },
  {
    id: "delete_account",
    title: "Delete Your Account",
    route: "/settings?tab=delete",
    permission: "settings.delete-account.view",
    description:
      "Closing the account for good; it takes effect immediately. Take the user here if they ask, and let the page state the consequences — do not talk them out of it or through it.",
  },
  {
    id: "create_pin",
    title: "Set Your Chatbot PIN",
    route: "/create-pin",
    permission: "settings.social-accounts.update",
    description:
      "Set the 4-digit security PIN used by the InstaPay chatbot on WhatsApp, Telegram and Instagram. It has to be set before social accounts can be linked.",
  },
  {
    id: "update_pin",
    title: "Change Your Chatbot PIN",
    route: "/update-pin",
    permission: "settings.social-accounts.update",
    description:
      "Change the existing 4-digit chatbot security PIN, confirmed with an SMS code. Someone without a PIN yet sets one with Set Your Chatbot PIN.",
  },
  {
    id: "geo_fencing",
    title: "Geo Fencing",
    route: "/geo-fencing",
    permission: "geo-fencing.view",
    description:
      "Choose which countries can send the user payment requests, by region or country. It does not limit where the account can be used from.",
  },

  {
    id: "dashboard",
    title: "Dashboard",
    route: "/dashboard/default",
    permission: "dashboard.view",
    description:
      "Home: total balance, wallet cards with top-up and withdraw shortcuts, quick links, quick transfer to recent beneficiaries, a currency converter, recent transactions and payment insights.",
  },

  // Agent portal. AgentRoute sends anyone without `isInstapayAgent` back to the
  // dashboard, so `agentOnly` gates these. Portal pages still on sample data are left out.
  {
    id: "agent_overview",
    title: "Agent Overview",
    route: "/agent-commission",
    permission: "agent-commission.view",
    agentOnly: true,
    description:
      "The agent portal's home: totals for leads, clients, commission earned, IBANs generated and fee packs, plus the lead funnel.",
  },
  {
    id: "agent_leads",
    title: "Leads",
    route: "/leads",
    permission: "leads.view",
    agentOnly: true,
    description:
      "People the agent is signing up and the stage each has reached. Add a lead (needs an approved fee pack) or add one by name to match an existing account; resend the invitation, update the fee pack or delete.",
  },
  {
    id: "agent_clients",
    title: "Referred Clients",
    route: "/clients",
    permission: "clients.view",
    agentOnly: true,
    description:
      "Clients who completed sign-up under this agent, filterable by account type and status, with their fee pack editable.",
  },
  {
    id: "agent_commissions",
    title: "Commissions",
    route: "/commissions",
    permission: "commissions.view",
    agentOnly: true,
    description:
      "What the agent has earned, been paid and still has pending, the average per client, and the commission statement.",
  },
  {
    id: "agent_fee_requests",
    title: "Fee Model Requests",
    route: "/fee-model-requests",
    agentOnly: true,
    description:
      "Request and track pricing for a client — IBAN activation and monthly fee, SEPA and SWIFT transfers, crypto on/off ramp, FX margin. Once approved, the client referral code and signup link are here to copy.",
  },
];

export const getPageById = (id) => PAGES.find((page) => page.id === id);

/** Whether this user may be offered and sent to the page. */
export const canOpenPage = (page, userDetails, can) =>
  (!page.agentOnly || Boolean(userDetails?.isInstapayAgent)) &&
  (!page.businessOnly || userDetails?.account_type === "business") &&
  (!page.individualOnly || userDetails?.account_type === "individual") &&
  (!page.thirdPartyOnly || Boolean(userDetails?.isThirdPartyAllowed)) &&
  (!page.permission || [].concat(page.permission).some((key) => can(key)));

export const STARTER_PROMPTS = [
  "How do I send money abroad?",
  "Where can I download my statements?",
  "Why is my account limited?",
  "What fees will I pay on a transfer?",
];
