import instaIcon from "./files/insta.svg";
import whatsappIcon from "./files/whatsappIcon.svg";
import telegramIcon from "./files/telegram.svg";
import messengerIcon from "./files/messengerIcon.svg";
import xIcon from "./files/xIcon.svg";

export const socialPayConfig = {
  header: {
    user: {
      name: "Neko Von Meow",
      notificationsCount: 9,
      avatar: null,
    },
  },
  themes: {
    pink: {
      accent: "#E1306C",
      tint: "#fff0f6",
      border: "#fbcfe8",
      stepBg: "#fce7f3",
      stepText: "#db2777",
    },
    green: {
      accent: "#25D366",
      tint: "#effdf5",
      border: "#bbf7d0",
      stepBg: "#dcfce7",
      stepText: "#16a34a",
    },
    blue: {
      accent: "#24A1DE",
      tint: "#eff8fd",
      border: "#bae6fd",
      stepBg: "#e0f2fe",
      stepText: "#0284c7",
    },
    messenger: {
      accent: "#0A7CFF",
      tint: "#eef5ff",
      border: "#bfdbfe",
      stepBg: "#dbeafe",
      stepText: "#1d4ed8",
    },
    x: {
      accent: "#000000",
      tint: "#f5f5f5",
      border: "#e5e5e5",
      stepBg: "#e5e5e5",
      stepText: "#171717",
    },
  },

  activeChannels: [
    {
      id: "instagram",
      name: "Instagram",
      handle: "@instapay.bot",
      icon: instaIcon,
      isActive: true,
      tagline: "DM to pay.",
      description:
        "Open Instagram, message the InstaPay bot, log in once — then send money, check balances, and request payments without leaving the app.",
      steps: [
        { step: 1, text: "DM @instapay.bot on Instagram" },
        { step: 2, text: 'Type "Hi" — the bot replies instantly' },
        { step: 3, text: "Log in once, then your full wallet is in the chat" },
      ],
      secondaryAction: { label: "Unlink", variant: "button" },
      primaryAction: { label: "Open Instagram" },
      theme: "pink",
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      handle: "+41 XX XXXXX XX",
      icon: whatsappIcon,
      isActive: true,
      tagline: "Chat to transfer.",
      description:
        'Save the InstaPay number, send "Hi", verify once — your wallet lives in WhatsApp from that moment on.',
      steps: [
        { step: 1, text: "Save the InstaPay WhatsApp number" },
        { step: 2, text: 'Send "Hi" to start' },
        { step: 3, text: "Full wallet access right in the chat" },
      ],
      secondaryAction: { label: "Connected", variant: "badge" },
      primaryAction: { label: "Open Whatsapp" },
      theme: "green",
    },
    {
      id: "telegram",
      name: "Telegram",
      handle: "@instapaybot",
      icon: telegramIcon,
      isActive: true,
      tagline: "Tap to send.",
      description:
        "Find @instapaybot on Telegram, tap Start, verify once — then your full InstaPay wallet is a message away.",
      steps: [
        { step: 1, text: "Search @instapaybot on Telegram" },
        { step: 2, text: "Tap Start to begin" },
        { step: 3, text: "Transfer, pay, check balance in chat" },
      ],
      secondaryAction: { label: "Connected", variant: "badge" },
      primaryAction: { label: "Open Telegram" },
      theme: "blue",
    },
  ],

  comingSoonChannels: [
    {
      id: "messenger",
      name: "Facebook Messenger",
      handle: "@instapay.bot",
      icon: messengerIcon,
      tagline: "Messenger pay.",
      description: "Pay through Facebook Messenger — same bot, same wallet, coming soon.",
      note: "We're working on Facebook Messenger integration. Add your account once it's live.",
      theme: "messenger",
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      handle: "@instapay",
      icon: xIcon,
      tagline: "DM to pay.",
      description: "Pay via X Direct Messages — full wallet access in your DMs, coming soon.",
      note: "X integration is in development. You'll be notified when it's ready to connect.",
      theme: "x",
    },
  ],
};
