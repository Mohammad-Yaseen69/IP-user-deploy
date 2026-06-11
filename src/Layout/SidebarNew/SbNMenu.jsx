import {
    CreditCard,
    DollarSign,
    Home,
    User
} from "react-feather";
import acc from "./files/acc.svg";
import acc_a from "./files/acc_a.svg";
import analytics from "./files/analytics.svg";
import analytics_a from "./files/analytics_a.svg";
import ben from "./files/ben.svg";
import ben_a from "./files/ben_a.svg";
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


export const MENU = [
    {
        className: "menu-box",
        menu: [
            {
                title: "MAIN MENU",
                type: "text"
            },
            {
                title: "Dashboard",
                icon: <img loading="lazy" src={dash} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={dash_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/dashboard/default`,
                permission: "dashboard.view"
            },
            {
                title: "My Wallets",
                icon: <img loading="lazy" src={wallets} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={wallets_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/wallets`,
                permission: "wallet.view"
            },
            {
                title: "My Mastercard",
                icon: <img loading="lazy" src={mastercard} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={mastercard_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/my-mastercard`,
                permission: "mastercard.view"
            },
            {
                title: "My virtual IBAN",
                url: "/virtual-IBAN",

                icon: <img loading="lazy" src={v_bank} style={{
                    width: "17px",
                    height: "18px",
                    marginRight: "12px",
                }} />,
                activeIcon: <img loading="lazy" src={v_bank_a} style={{
                    width: "17px",
                    height: "18px",
                    marginRight: "12px",
                }} />,
                type: "link",
                url: `${window.location.origin}/virtual-IBAN`,
                permission: "virtual-iban.view"
            },
            {
                title: "Transactions",
                icon: <img loading="lazy" src={tran} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={tran_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/transactions`,
                permission: "transactions.main.view"
            },
            {
                title: "Schedules",
                icon: <img loading="lazy" src={schedules} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={schedules_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/other-transactions`,
                permission: "schedules.view",
            },
            {
                title: "My Invoices",
                icon: <img loading="lazy" src={rec} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={rec_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/invoices`,
                permission: "invoices.view"
            },
            {
                title: "My eShop",
                icon: <img loading="lazy" src={paym} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={paym_a} style={{ marginRight: "12px" }} />,
                type: "external_eshop",
                permission: "eshop.view"
            },
            {
                title: "Payments",
                icon: <img loading="lazy" src={paym} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={paym_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/payments`,
                permission: "payments.view"
            },
            {

                title: "Third-Party Senders",
                icon: <img loading="lazy" src={paym} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={paym_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/third-party-senders`,
                permission: "payments.send-as-third-party.view"
            },
            {
                title: "Beneficiaries",
                icon: <img loading="lazy" src={ben} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={ben_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/beneficiaries`,
                permission: "beneficiaries.view"
            },
            {
                title: "Referrals",
                icon: <img loading="lazy" src={ref} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={ref_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/referrals`,
                permission: "referrals.view"
            },
            {
                title: "Quotations",
                icon: <img loading="lazy" src={quotations} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={quotations_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/quotations`,
                permission: "quotations.view"
            },
            {
                title: "Payment Requests",
                icon: <img loading="lazy" src={pen} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={pen_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/payment-requests`,
                permission: "payment-request.view"
            },
            // {
            //     title: "Mastercard",
            //     icon: <img loading="lazy" src={pen} style={{ marginRight: "12px" }} />,
            //     activeIcon: <img loading="lazy" src={pen_a} style={{ marginRight: "12px" }} />,
            //     type: "link",
            //     url: `${window.location.origin}/my-mastercard`,
            // },
            {
                title: "My QR Code Sticker",
                icon: <img loading="lazy" src={qr_s} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={qr_s_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/chips-in`,
                permission: "qr-sticker.view"
            },
            {
                title: "My Portfolio",
                icon: <img loading="lazy" src={portfolio} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={portfolio_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/portfolio`,
                permission: "portfolio.view"
            },
            {
                title: "My Payment Address",
                icon: <img loading="lazy" src={pa} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={pa_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/payment-address`,
                permission: "payment-address.view"
            },
            {
                title: "Analytics",
                url: "/store",

                icon: <img loading="lazy" src={analytics} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={analytics_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/analytics`,
                permission: "analytics.view"
            },

            // {
            //     title: "Store",
            //     icon: <img loading="lazy" src={shopingcard} style={{ marginRight: "12px" }} />,
            //     activeIcon: <img loading="lazy" src={shopingcard} style={{ marginRight: "12px" }} />,
            //     type: "submenu",
            //     menu: [
            //         {
            //             title: "Store Dashboard",
            //             icon: <img loading="lazy" src={dashboardStore} style={{ marginRight: "12px" }} />,
            //             activeIcon: <img loading="lazy" src={dashboardStore} style={{ marginRight: "12px" }} />,
            //             type: "link",
            //             url: `${window.location.origin}/ecommerce-store`,
            //         },
            //         {
            //             title: "My Order",
            //             icon: <img loading="lazy" src={orderMy} style={{ marginRight: "12px" }} />,
            //             activeIcon: <img loading="lazy" src={orderMy} style={{ marginRight: "12px" }} />,
            //             type: "link",
            //             url: `${window.location.origin}/ecommerce-store/orders`,
            //         },
            //         {
            //             title: "Product",
            //             icon: <img loading="lazy" src={storeProduct} style={{ marginRight: "12px" }} />,
            //             activeIcon: <img loading="lazy" src={storeProduct} style={{ marginRight: "12px" }} />,
            //             type: "link",
            //             url: `${window.location.origin}/ecommerce-store`,
            //         },
            //         {
            //             title: "Store Settings",
            //             icon: <img loading="lazy" src={storeSetting} style={{ marginRight: "12px" }} />,
            //             activeIcon: <img loading="lazy" src={storeSetting} style={{ marginRight: "12px" }} />,
            //             type: "link",
            //             url: `/ecommerce-store/settings`,
            //         },
            //     ]
            // },
            {
                title: "OTHERS",
                type: "text"
            },
            {
                title: "Profile",
                icon: <img loading="lazy" src={acc} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={acc_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/my-profile`,
                permission: "user-profile.view"
            },
            {
                title: "Geo Fencing",
                icon: <img loading="lazy" src={location} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={location_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/geo-fencing`,
                permission: "geo-fencing.view"
            },
            {
                title: "Settings",
                icon: <img loading="lazy" src={settings} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={settings_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/settings`,
                permission: "settings.view"
            },
            {
                title: "Delegate Access",
                icon: <img loading="lazy" src={delegate} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={delegate_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/delegate-access`,
                showOnly: "business",
                permission: "delegate-access.view",
                showOnly: "business"
            },
            {
                title: "Activity Feed",
                icon: < img loading="lazy" src={Feed} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={Feed_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/activity`,
                showOnly: "business",
                permission: "activity-logs.view",
                showOnly: "business"
            },
            // {
            //     title: "Dark Mode",
            //     icon: <img loading="lazy" src={dark} style={{ marginRight: "12px" }} />,
            //     activeIcon: <img loading="lazy" src={dark_a} style={{ marginRight: "12px" }} />,
            //     type: "link",
            // },
            {
                title: "Support",
                icon: <img loading="lazy" src={support} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={support_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `mailto:support@insta-pay.ch`,
            },
            {
                title: "Logout",
                icon: <img loading="lazy" src={logout} style={{ marginRight: "12px" }} />,
                activeIcon: <img loading="lazy" src={logout_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${window.location.origin}/login`,
            }
        ]
    }
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
                permission: "dashboard.view"
            },
            {
                title: "Transactions",
                icon: <CreditCard />,
                type: "link",
                url: `${window.location.origin}/transactions`,
                permission: "transactions.main.view"
            },
            {
                title: "Payments",
                icon: <DollarSign />,
                type: "link",
                url: `${window.location.origin}/ecommerce/payment-details`,
                permission: "payments.view"
            },
            {
                title: "Referrals",
                icon: <User />,
                type: "link",
                url: `${window.location.origin}/users/userCards`,
                permission: "referrals.view"
            },
        ],
    },
];
