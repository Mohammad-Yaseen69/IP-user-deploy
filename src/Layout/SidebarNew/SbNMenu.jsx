import {
    Home,
    User,
    DollarSign,
    CreditCard,
} from "react-feather";
import dash from "./files/dash.svg"
import tran from "./files/tran.svg"
import paym from "./files/paym.svg"
import ben from "./files/ben.svg"
import ref from "./files/ref.svg"
import pen from "./files/pen.svg"
import chips from "./files/chips.svg"
import acc from "./files/acc.svg"
import settings from "./files/settings.svg"
import dark from "./files/dark.svg"
import support from "./files/support.svg"
import logout from "./files/logout.svg"
import dash_a from "./files/dash_a.svg"
import tran_a from "./files/tran_a.svg"
import paym_a from "./files/paym_a.svg"
import ben_a from "./files/ben_a.svg"
import ref_a from "./files/ref_a.svg"
import pen_a from "./files/pen_a.svg"
import chips_a from "./files/chips_a.svg"
import acc_a from "./files/acc_a.svg"
import settings_a from "./files/settings_a.svg"
import dark_a from "./files/dark_a.svg"
import support_a from "./files/support_a.svg"
import logout_a from "./files/logout_a.svg"
import wallets from "./files/wallets.svg"
import wallets_a from "./files/wallets_a.svg"
import schedules from "./files/schedules.svg"
import schedules_a from "./files/schedules_a.svg"
import quotations from "./files/quotations.svg"
import quotations_a from "./files/quotations_a.svg"
import qr_s from "./files/qr_s.svg"
import qr_s_a from "./files/qr_s_a.svg"
import portfolio from "./files/portfolio.svg"
import portfolio_a from "./files/portfolio_a.svg"
import pa from "./files/pa.svg"
import pa_a from "./files/pa_a.svg"
import analytics from "./files/analytics.svg"
import analytics_a from "./files/analytics_a.svg"
import location from "./files/location.svg"
import location_a from "./files/location_a.svg"

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
                icon: <img src={dash} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={dash_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/dashboard/default`,
            },
            {
                title: "My Wallets",
                icon: <img src={wallets} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={wallets_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/wallets`,
            },
            {
                title: "Transactions",
                icon: <img src={tran} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={tran_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/transactions`,
            },
            {
                title: "Schedules",
                icon: <img src={schedules} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={schedules_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/other-transactions`,
            },
            {
                title: "Payments",
                icon: <img src={paym} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={paym_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/payments`,
            },
            {
                title: "Beneficiaries",
                icon: <img src={ben} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={ben_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/beneficiaries`,
            },
            {
                title: "Referrals",
                icon: <img src={ref} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={ref_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/referrals`,
            },
            {
                title: "Quotations",
                icon: <img src={quotations} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={quotations_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/quotations`,
            },
            {
                title: "Payment Requests",
                icon: <img src={pen} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={pen_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/payment-requests`,
            },
            {
                title: "My QR Code Sticker",
                icon: <img src={qr_s} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={qr_s_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/chips-in`,
            },
            {
                title: "My Portfolio",
                icon: <img src={portfolio} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={portfolio_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/portfolio`,
            },
            {
                title: "My Payment Address",
                icon: <img src={pa} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={pa_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/payment-address`,
            },
            {
                title: "Analytics",
                icon: <img src={analytics} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={analytics_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/analytics`,
            },
            {
                title: "OTHERS",
                type: "text"
            },
            {
                title: "Profile",
                icon: <img src={acc} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={acc_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/my-profile`,
            },
            {
                title: "Geo Fencing",
                icon: <img src={location} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={location_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/geo-fencing`,
            },
            {
                title: "Settings",
                icon: <img src={settings} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={settings_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/settings`,
            },
            // {
            //     title: "Dark Mode",
            //     icon: <img src={dark} style={{ marginRight: "12px" }} />,
            //     activeIcon: <img src={dark_a} style={{ marginRight: "12px" }} />,
            //     type: "link",
            // },
            {
                title: "Support",
                icon: <img src={support} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={support_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `mailto:support@insta-pay.ch`,
            },
            {
                title: "Logout",
                icon: <img src={logout} style={{ marginRight: "12px" }} />,
                activeIcon: <img src={logout_a} style={{ marginRight: "12px" }} />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/auth/login`,
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
                url: `${process.env.PUBLIC_URL}/dashboard/default`,
            },
            {
                title: "Transactions",
                icon: <CreditCard />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/transactions`,
            },
            {
                title: "Payments",
                icon: <DollarSign />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/ecommerce/payment-details`,
            },
            {
                title: "Referrals",
                icon: <User />,
                type: "link",
                url: `${process.env.PUBLIC_URL}/users/userCards`,
            },
        ],
    },
];
