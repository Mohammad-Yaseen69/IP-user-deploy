import { MENU } from "../../Layout/SidebarNew/SbNMenu";

const TAB_DESCRIPTIONS = {
  Dashboard:
    "Your home screen. Total balance, your wallets, recent transactions and quick transfers to people you pay often.",
  Analytics:
    "Track money in and out over time for any wallet and period, broken down by payment type.",
  "My Wallets":
    "Your currency wallets. Add a currency, top up, convert, withdraw, download statements and check your account limits.",
  "Crypto Hub":
    "Your crypto wallets. Add funds, send crypto to saved beneficiaries and convert between crypto and regular currency.",
  "My virtual IBAN":
    "A bank account number in your own name. Receive bank transfers, send SEPA and SWIFT payments and move money to your wallets.",
  "My Mastercard":
    "Order a virtual Mastercard, top it up, freeze it when you need to and add it to Apple Pay or Google Pay.",
  "My Portfolio":
    "Show your work. Images, videos and PDFs you upload here appear on your public profile.",
  Payments:
    "Send money to InstaPay users or abroad, request money, send a quote, or buy mobile top-ups and eSIMs.",
  "Pay Bills": "Pay electricity, water, internet and government bills straight from your wallet.",
  Beneficiaries:
    "The people and businesses you pay. Save them once, then pick them in any transfer.",
  Transactions:
    "Everything in and out of your account. Search, filter by date, open any entry for full details and export a statement.",
  "Payment Requests": "Requests you have sent, and requests waiting for you to accept or decline.",
  Schedules:
    "Your scheduled and recurring payments, requests and plan subscriptions. Pending ones can be cancelled here.",
  "Pay Via Social":
    "Link WhatsApp, Telegram or Instagram to send and receive money through the InstaPay chatbot.",
  "My Payment Address":
    "Your public pay page, a link anyone can use to pay you. Customise it, then share the link or its QR code.",
  "My QR Code Sticker":
    "A QR code for each wallet. Download it as a sticker or poster so people can scan it and pay you.",
  "My Invoices":
    "Create invoices with a payment link and QR code, then view, edit or download them.",
  Quotations:
    "Quotes you have sent and received. Accept, decline or counter-offer a quote you receive.",
  Referrals: "Invite people with your link, see who joined and collect the rewards you earn.",
  Profile: "How your public profile looks to others. To change your details, go to Settings.",
  "Geo Fencing": "Choose which countries are allowed to send you payment requests.",
  "Third-Party senders":
    "Save the people and businesses you send international transfers for, so you never re-enter their details.",
  Settings: "Your personal info, password, security, verification, notifications and more.",
  "Delegate Access":
    "Invite team members, give them roles and permissions, and manage their access.",
  "Activity Feed": "A log of what your team members have done on the account.",
};

export const tourTabs = (userDetails, can) =>
  MENU[0].menu
    .filter(
      (item) =>
        TAB_DESCRIPTIONS[item.title] &&
        (item.showOnly !== "business" || userDetails?.account_type === "business") &&
        (item.permission !== "payments.send-as-third-party.view" ||
          Boolean(userDetails?.isThirdPartyAllowed)) &&
        (!item.permission || can(item.permission)),
    )
    .map((item) => ({
      title: item.title,
      description: TAB_DESCRIPTIONS[item.title],
      route: new URL(item.url, window.location.origin).pathname,
    }));
