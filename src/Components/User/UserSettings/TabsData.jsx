import { Activity, Lock, Bell, Shield, Trash, User, Users, UserCheck, HelpCircle, Download, Edit, } from "react-feather"

export const TabsData = [
    {
        id: 0,
        name: "Basic Info",
        icon: <User />
    },
    {
        id: 1,
        name: "Change Password",
        icon: <Lock />
    },
    {
        id: 2,
        name: "Security Questions",
        icon: <HelpCircle />
    },
    {
        id: 3,
        name: "Two Factor Authentication",
        icon: <Shield />
    },
    {
        id: 4,
        name: "Social Accounts",
        icon: <Users />
    },
    {
        id: 5,
        name: "Notifications",
        icon: <Bell />
    },
    {
        id: 6,
        name: "Sessions",
        icon: <Activity />
    },
    {
        id: 7,
        name: "Verify Your Identity",
        icon: <UserCheck />
    }
]
export const SecondaryTabsData = [
    {
        id: 0,
        name: "My Withdrawal Channels",
        icon: <Download />
    },
    {
        id: 0,
        name: "Download Your Data",
        icon: <Download />
    },
    {
        id: 1,
        name: "Correct Your Data",
        icon: <Edit />
    },
    {
        id: 8,
        name: "Delete Your Account",
        icon: <Trash />
    }
]