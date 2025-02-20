import ins from "./a_items/instagram.svg"
import fb from "./a_items/facebook.svg"
import tk from "./a_items/tk.png"
import tl from "./a_items/telegram.svg"
import x from "./a_items/x.svg"
import wa from "./a_items/whatsapp.svg"

export const AccountsData = [
    {
        img: ins,
        name: "Instagram",
        enabled: false,
        available: true
    },
    {
        img: tl,
        name: "Telegram",
        enabled: false,
        available: true
    },
    {
        img: wa,
        name: "Whatsapp",
        enabled: false,
        available: false
    },
    {
        img: fb,
        name: "Facebook",
        enabled: false,
        available: false
    },
    // {
    //     img: tk,
    //     name: "Tiktok",
    //     enabled: false,
    //     available: false
    // },
    {
        img: x,
        name: "X",
        enabled: false,
        available: false
    },
]