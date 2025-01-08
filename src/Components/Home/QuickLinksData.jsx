// import { EarningCardSvg } from "../SvgIcons";
import { RiLuggageDepositLine } from "react-icons/ri"
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi"
import { MdOutlineRequestPage } from "react-icons/md"
import { BsChatLeftQuote } from "react-icons/bs"
import Deposit from "./quicklinks_svg/wallet.svg"
import Send from "./quicklinks_svg/card-send.svg"
import Receive from "./quicklinks_svg/card-receive.svg"
import Request from "./quicklinks_svg/shop-add.svg"
import Quote from "./quicklinks_svg/receipt.svg"

export const QuickLinksData = [
    {
        headingClassName: "header-text-primary",
        Heading: "Add Funds",
        link: "/load-balance",
        // svgIcon: "./quicklinks_svg/wallet.svg",
        svgIcon: Deposit,
        icon: <RiLuggageDepositLine size={25} color="white" />
    },
    {
        headingClassName: "header-text-primary",
        Heading: "Send Money",
        link: "/payments",
        // svgIcon: "./quicklinks_svg/card-send.svg",
        svgIcon: Send,
        icon: <GiPayMoney size={25} color="white" />
    },
    {
        headingClassName: "header-text-primary",
        Heading: "Request Money",
        link: "/payments",
        // svgIcon: "./quicklinks_svg/card-receive.svg",
        svgIcon: Receive,
        icon: <GiReceiveMoney size={25} color="white" />
    },
    {
        headingClassName: "header-text-primary",
        Heading: "Send A Quote",
        link: "/payments",
        // svgIcon: "./quicklinks_svg/shop-add.svg",
        svgIcon: Request,
        icon: <MdOutlineRequestPage size={25} color="white" />
    },
    {
        headingClassName: "header-text-primary",
        Heading: "Request A Quote",
        link: "/payments",
        // svgIcon: "./quicklinks_svg/receipt.svg",
        svgIcon: Quote,
        icon: <BsChatLeftQuote size={25} color="white" />
    },
];