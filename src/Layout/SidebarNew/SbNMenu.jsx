import { CreditCard, DollarSign, Home, User } from "react-feather";
import acc from "./files/acc.svg";
import acc_a from "./files/acc_a.svg";
import analytics from "./files/analytics.svg";
import analytics_a from "./files/analytics_a.svg";
import ben from "./files/ben.svg";
import ben_a from "./files/ben_a.svg";
import crypto_icon from "./files/crypto.svg";
import crypto_icon_a from "./files/crypto_a.svg";
import dash from "./files/dash.svg";
import dash_a from "./files/dash_a.svg";
import location from "./files/location.svg";
import location_a from "./files/location_a.svg";
import logout from "./files/logout.svg";
import logout_a from "./files/logout_a.svg";
import mastercard from "./files/master_card.svg";
import mastercard_a from "./files/master_card_a.svg";
import pa from "./files/pa.svg";
import pa_a from "./files/pa_a.svg";
import paym from "./files/paym.svg";
import paym_a from "./files/paym_a.svg";
import pen from "./files/pen.svg";
import pen_a from "./files/pen_a.svg";
import portfolio from "./files/portfolio.svg";
import portfolio_a from "./files/portfolio_a.svg";
import qr_s from "./files/qr_s.svg";
import qr_s_a from "./files/qr_s_a.svg";
import quotations from "./files/quotations.svg";
import quotations_a from "./files/quotations_a.svg";
import rec from "./files/rec.svg";
import rec_a from "./files/rec_a.svg";
import ref from "./files/ref.svg";
import ref_a from "./files/ref_a.svg";
import schedules from "./files/schedules.svg";
import schedules_a from "./files/schedules_a.svg";
import settings from "./files/settings.svg";
import settings_a from "./files/settings_a.svg";
import support from "./files/support.svg";
import support_a from "./files/support_a.svg";
import tran from "./files/tran.svg";
import tran_a from "./files/tran_a.svg";
import wallets from "./files/wallets.svg";
import wallets_a from "./files/wallets_a.svg";
import delegate_a from "./files/delegate_a.svg";
import delegate from "./files/delegate.svg";
import Feed from "./files/Feed.svg";
import Feed_a from "./files/Feed_a.svg";
import v_bank_a from "./files/v_bank_a.svg";
import v_bank from "./files/v_bank.svg";
import payviasocial from "./files/payviasocial.svg";
import payviasocial_unactive from "./files/payviasocial_unactive.svg";

export const MENU = [
  {
    className: "menu-box",
    menu: [
      {
        title: "HOME",
        type: "text",
      },
      {
        title: "Dashboard",
        icon: <img loading="lazy" src={dash} />,
        activeIcon: <img loading="lazy" src={dash_a} />,
        type: "link",
        url: `${window.location.origin}/dashboard/default`,
        permission: "dashboard.view",
      },
      {
        title: "Analytics",
        url: "/store",
        icon: <img loading="lazy" src={analytics} />,
        activeIcon: <img loading="lazy" src={analytics_a} />,
        type: "link",
        url: `${window.location.origin}/analytics`,
        permission: "analytics.view",
      },
      {
        title: "Accounts & Assets",
        type: "text",
      },
      {
        title: "My Wallets",
        icon: <img loading="lazy" src={wallets} />,
        activeIcon: <img loading="lazy" src={wallets_a} />,
        type: "link",
        url: `${window.location.origin}/wallets`,
        permission: "wallet.view",
      },
      {
        title: "Crypto Hub",
        icon: <img loading="lazy" src={crypto_icon} />,
        activeIcon: <img loading="lazy" src={crypto_icon_a} />,
        type: "link",
        url: `${window.location.origin}/crypto-wallets`,
        permission: "wallet.view",
      },
      {
        title: "My virtual IBAN",
        url: "/virtual-IBAN",

        icon: (
          <img
            loading="lazy"
            src={v_bank}
            style={{
              width: "17px",
              height: "18px",
            }}
          />
        ),
        activeIcon: (
          <img
            loading="lazy"
            src={v_bank_a}
            style={{
              width: "17px",
              height: "18px",
            }}
          />
        ),
        type: "link",
        url: `${window.location.origin}/virtual-IBAN`,
        permission: "virtual-iban.view",
      },
      {
        title: "My Mastercard",
        icon: <img loading="lazy" src={mastercard} />,
        activeIcon: <img loading="lazy" src={mastercard_a} />,
        type: "link",
        url: `${window.location.origin}/my-mastercard`,
        permission: "mastercard.view",
      },
      {
        title: "My Portfolio",
        icon: <img loading="lazy" src={portfolio} />,
        activeIcon: <img loading="lazy" src={portfolio_a} />,
        type: "link",
        url: `${window.location.origin}/portfolio`,
        permission: "portfolio.view",
      },
      {
        title: "Payments & Activity",
        type: "text",
      },
      {
        title: "Payments",
        icon: <img loading="lazy" src={paym} />,
        activeIcon: <img loading="lazy" src={paym_a} />,
        type: "link",
        url: `${window.location.origin}/payments`,
        permission: "payments.view",
      },
      {
        title: "Pay Bills",
        icon: <img loading="lazy" src={paym} />,
        activeIcon: <img loading="lazy" src={paym_a} />,
        type: "link",
        url: `${window.location.origin}/pay-bills`,
        permission: "payments.view",
      },
      {
        title: "Beneficiaries",
        icon: <img loading="lazy" src={ben} />,
        activeIcon: <img loading="lazy" src={ben_a} />,
        type: "link",
        url: `${window.location.origin}/beneficiaries`,
        permission: "beneficiaries.view",
      },
      {
        title: "Transactions",
        icon: <img loading="lazy" src={tran} />,
        activeIcon: <img loading="lazy" src={tran_a} />,
        type: "link",
        url: `${window.location.origin}/transactions`,
        permission: "transactions.main.view",
      },
      {
        title: "Payment Requests",
        icon: <img loading="lazy" src={pen} />,
        activeIcon: <img loading="lazy" src={pen_a} />,
        type: "link",
        url: `${window.location.origin}/payment-requests`,
        permission: "payment-request.view",
      },
      {
        title: "Schedules",
        icon: <img loading="lazy" src={schedules} />,
        activeIcon: <img loading="lazy" src={schedules_a} />,
        type: "link",
        url: `${window.location.origin}/other-transactions`,
        permission: "schedules.view",
      },
      {
        title: "Pay Via Social",
        icon: <img loading="lazy" src={payviasocial_unactive} />,
        activeIcon: <img loading="lazy" src={payviasocial} />,
        type: "link",
        url: `${window.location.origin}/pay-via-social`,
        permission: "pay-via-social.view",
      },
      {
        title: "Payments Tools",
        type: "text",
      },
      {
        title: "My Payment Address",
        icon: <img loading="lazy" src={pa} />,
        activeIcon: <img loading="lazy" src={pa_a} />,
        type: "link",
        url: `${window.location.origin}/payment-address`,
        permission: "payment-address.view",
      },
      {
        title: "My QR Code Sticker",
        icon: <img loading="lazy" src={qr_s} />,
        activeIcon: <img loading="lazy" src={qr_s_a} />,
        type: "link",
        url: `${window.location.origin}/chips-in`,
        permission: "qr-sticker.view",
      },
      {
        title: "My Invoices",
        icon: <img loading="lazy" src={rec} />,
        activeIcon: <img loading="lazy" src={rec_a} />,
        type: "link",
        url: `${window.location.origin}/invoices`,
        permission: "invoices.view",
      },
      {
        title: "Quotations",
        icon: <img loading="lazy" src={quotations} />,
        activeIcon: <img loading="lazy" src={quotations_a} />,
        type: "link",
        url: `${window.location.origin}/quotations`,
        permission: "quotations.view",
      },
      {
        title: "Network",
        type: "text",
      },
      {
        title: "Referrals",
        icon: <img loading="lazy" src={ref} />,
        activeIcon: <img loading="lazy" src={ref_a} />,
        type: "link",
        url: `${window.location.origin}/referrals`,
        permission: "referrals.view",
      },
      {
        title: "My Account",
        type: "text",
      },
      {
        title: "Profile",
        icon: <img loading="lazy" src={acc} />,
        activeIcon: <img loading="lazy" src={acc_a} />,
        type: "link",
        url: `${window.location.origin}/my-profile`,
        permission: "user-profile.view",
      },
      {
        title: "Geo Fencing",
        icon: <img loading="lazy" src={location} />,
        activeIcon: <img loading="lazy" src={location_a} />,
        type: "link",
        url: `${window.location.origin}/geo-fencing`,
        permission: "geo-fencing.view",
      },
      {
        title: "Third-Party senders",
        icon: <img loading="lazy" src={paym} />,
        activeIcon: <img loading="lazy" src={paym_a} />,
        type: "link",
        url: `${window.location.origin}/third-party-senders`,
        permission: "payments.send-as-third-party.view",
      },
      // {
      //     title: "Mastercard",
      //     icon: <img loading="lazy" src={pen} />,
      //     activeIcon: <img loading="lazy" src={pen_a} />,
      //     type: "link",
      //     url: `${window.location.origin}/my-mastercard`,
      // },

      // {
      //     title: "Store",
      //     icon: <img loading="lazy" src={shopingcard} />,
      //     activeIcon: <img loading="lazy" src={shopingcard} />,
      //     type: "submenu",
      //     menu: [
      //         {
      //             title: "Store Dashboard",
      //             icon: <img loading="lazy" src={dashboardStore} />,
      //             activeIcon: <img loading="lazy" src={dashboardStore} />,
      //             type: "link",
      //             url: `${window.location.origin}/ecommerce-store`,
      //         },
      //         {
      //             title: "My Order",
      //             icon: <img loading="lazy" src={orderMy} />,
      //             activeIcon: <img loading="lazy" src={orderMy} />,
      //             type: "link",
      //             url: `${window.location.origin}/ecommerce-store/orders`,
      //         },
      //         {
      //             title: "Product",
      //             icon: <img loading="lazy" src={storeProduct} />,
      //             activeIcon: <img loading="lazy" src={storeProduct} />,
      //             type: "link",
      //             url: `${window.location.origin}/ecommerce-store`,
      //         },
      //         {
      //             title: "Store Settings",
      //             icon: <img loading="lazy" src={storeSetting} />,
      //             activeIcon: <img loading="lazy" src={storeSetting} />,
      //             type: "link",
      //             url: `/ecommerce-store/settings`,
      //         },
      //     ]
      // },
      {
        title: "OTHERS",
        type: "text",
      },
      {
        title: "Settings",
        icon: <img loading="lazy" src={settings} />,
        activeIcon: <img loading="lazy" src={settings_a} />,
        type: "link",
        url: `${window.location.origin}/settings`,
        permission: "settings.view",
      },
      {
        title: "Delegate Access",
        icon: <img loading="lazy" src={delegate} />,
        activeIcon: <img loading="lazy" src={delegate_a} />,
        type: "link",
        url: `${window.location.origin}/delegate-access`,
        showOnly: "business",
        permission: "delegate-access.view",
        showOnly: "business",
      },
      {
        title: "Activity Feed",
        icon: <img loading="lazy" src={Feed} />,
        activeIcon: <img loading="lazy" src={Feed_a} />,
        type: "link",
        url: `${window.location.origin}/activity`,
        showOnly: "business",
        permission: "activity-logs.view",
        showOnly: "business",
      },
      // {
      //     title: "Dark Mode",
      //     icon: <img loading="lazy" src={dark} />,
      //     activeIcon: <img loading="lazy" src={dark_a} />,
      //     type: "link",
      // },
      {
        title: "Support",
        icon: <img loading="lazy" src={support} />,
        activeIcon: <img loading="lazy" src={support_a} />,
        type: "link",
        url: `mailto:support@insta-pay.ch`,
      },
      {
        title: "Logout",
        icon: <img loading="lazy" src={logout} />,
        activeIcon: <img loading="lazy" src={logout_a} />,
        type: "link",
        url: `${window.location.origin}/login`,
      },
    ],
  },
];
export const SEARCHMENU = [
  {
    className: "menu-box",
    menu: [
      {
        title: "Dashboards",
        icon: <Home />,
        type: "link",
        url: `${window.location.origin}/dashboard/default`,
        permission: "dashboard.view",
      },
      {
        title: "Transactions",
        icon: <CreditCard />,
        type: "link",
        url: `${window.location.origin}/transactions`,
        permission: "transactions.main.view",
      },
      {
        title: "Payments",
        icon: <DollarSign />,
        type: "link",
        url: `${window.location.origin}/ecommerce/payment-details`,
        permission: "payments.view",
      },
      {
        title: "Referrals",
        icon: <User />,
        type: "link",
        url: `${window.location.origin}/users/userCards`,
        permission: "referrals.view",
      },
    ],
  },
];
