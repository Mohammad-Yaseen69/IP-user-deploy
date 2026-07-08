import React from "react";
import { PlusCircle, ArrowRight, Send } from "react-feather";


export const actions = [
    { id: 1, icon: <PlusCircle size={20} />, label: "Deposit", sub: "Deposit to your account", color: "#6366f1" },
    {
        id: 2, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M12.375 10.125L14.625 12.375L12.375 14.625" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M3.375 12.375H14.625" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M5.625 7.875L3.375 5.625L5.625 3.375" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M14.625 5.625H3.375" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>, label: "Move funds", sub: "Move funds to Wallet", color: "#10b981"
    },
    { id: 3, icon: <ArrowRight size={20} />, label: "Withdraw balance", sub: "To the verified account", color: "#5926F0" },
    {
        id: 4, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M14.0625 12.375V4.5C14.0625 4.05245 13.8847 3.62322 13.5682 3.30676C13.2518 2.99029 12.8226 2.8125 12.375 2.8125H2.8125" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M7.3125 7.3125H11.8125" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M7.3125 9.5625H11.8125" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M1.6875 5.625C1.6875 5.625 1.125 5.20312 1.125 4.5C1.125 4.05245 1.30279 3.62322 1.61926 3.30676C1.93572 2.99029 2.36495 2.8125 2.8125 2.8125C3.26005 2.8125 3.68928 2.99029 4.00574 3.30676C4.32221 3.62322 4.5 4.05245 4.5 4.5V13.5C4.5 13.9476 4.67779 14.3768 4.99426 14.6932C5.31072 15.0097 5.73995 15.1875 6.1875 15.1875M6.1875 15.1875C6.63505 15.1875 7.06428 15.0097 7.38074 14.6932C7.69721 14.3768 7.875 13.9476 7.875 13.5C7.875 12.7969 7.3125 12.375 7.3125 12.375H15.1875C15.1875 12.375 15.75 12.7969 15.75 13.5C15.75 13.9476 15.5722 14.3768 15.2557 14.6932C14.9393 15.0097 14.5101 15.1875 14.0625 15.1875H6.1875Z" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>, label: "Download statement", sub: "PDF or CSV", color: "#10b981"
    },
    // {
    //     id: 5, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    //         <path d="M14.625 2.8125H3.375C3.06434 2.8125 2.8125 3.06434 2.8125 3.375V14.625C2.8125 14.9357 3.06434 15.1875 3.375 15.1875H14.625C14.9357 15.1875 15.1875 14.9357 15.1875 14.625V3.375C15.1875 3.06434 14.9357 2.8125 14.625 2.8125Z" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    //         <path d="M6.75 9.5625L9 11.8125L11.25 9.5625" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    //         <path d="M9 6.1875V11.8125" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    //     </svg>,
    //     label: "Request money from vIBAN", sub: "Send a payment request link", color: "#8b5cf6"
    // },
    {
        id: 9, icon: <Send size={20} />,
        label: "SEPA Transfer", sub: "European bank transfer", color: "#6366f1"
    },

    {
        id: 6, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2.25 15.75C2.64296 15.226 3.15252 14.8008 3.73832 14.5079C4.32411 14.215 4.97006 14.0625 5.625 14.0625C6.27994 14.0625 6.92589 14.215 7.51168 14.5079C8.09748 14.8008 8.60704 15.226 9 15.75C9.39296 15.226 9.90252 14.8008 10.4883 14.5079C11.0741 14.215 11.7201 14.0625 12.375 14.0625C13.0299 14.0625 13.6759 14.215 14.2617 14.5079C14.8475 14.8008 15.357 15.226 15.75 15.75" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M2.25 8.4375C2.64296 7.91355 3.15252 7.48828 3.73832 7.19539C4.32411 6.90249 4.97006 6.75 5.625 6.75C6.27994 6.75 6.92589 6.90249 7.51168 7.19539C8.09748 7.48828 8.60704 7.91355 9 8.4375C9.39296 7.91355 9.90252 7.48828 10.4883 7.19539C11.0741 6.90249 11.7201 6.75 12.375 6.75C13.0299 6.75 13.6759 6.90249 14.2617 7.19539C14.8475 7.48828 15.357 7.91355 15.75 8.4375" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M5.625 14.0625C6.86764 14.0625 7.875 13.0551 7.875 11.8125C7.875 10.5699 6.86764 9.5625 5.625 9.5625C4.38236 9.5625 3.375 10.5699 3.375 11.8125C3.375 13.0551 4.38236 14.0625 5.625 14.0625Z" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M5.625 6.75C6.86764 6.75 7.875 5.74264 7.875 4.5C7.875 3.25736 6.86764 2.25 5.625 2.25C4.38236 2.25 3.375 3.25736 3.375 4.5C3.375 5.74264 4.38236 6.75 5.625 6.75Z" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12.375 14.0625C13.6176 14.0625 14.625 13.0551 14.625 11.8125C14.625 10.5699 13.6176 9.5625 12.375 9.5625C11.1324 9.5625 10.125 10.5699 10.125 11.8125C10.125 13.0551 11.1324 14.0625 12.375 14.0625Z" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12.375 6.75C13.6176 6.75 14.625 5.74264 14.625 4.5C14.625 3.25736 13.6176 2.25 12.375 2.25C11.1324 2.25 10.125 3.25736 10.125 4.5C10.125 5.74264 11.1324 6.75 12.375 6.75Z" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>, label: "Beneficiaries", sub: "Quick access to saved recipients", color: "#5926F0"
    },
    {
        id: 7, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1.125V16.875" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M15.1875 9L9 11.8125L2.8125 9" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9 1.125L15.1875 9L9 16.875L2.8125 9L9 1.125Z" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>, label: "Crypto", sub: "Crypto receiving address", color: "#64748b"
    },
    {
        id: 8, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 4.5V13.5" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M7.3125 2.8125L9 4.5L10.6875 2.8125" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M7.3125 15.1875L9 13.5L10.6875 15.1875" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M5.10254 6.75L12.8974 11.25" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M2.8125 7.3125L5.10258 6.75L4.5 4.5" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M13.5 13.5L12.8975 11.25L15.1875 10.6875" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M5.10254 11.25L12.8974 6.75" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M4.5 13.5L5.10258 11.25L2.8125 10.6875" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M15.1875 7.3125L12.8975 6.75L13.5 4.5" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>, label: "Unsubscribe", sub: "Cancel virtual account", color: "#EF4444"
    },
];

export const transactions = [
    {
        id: "TXN307645",
        date: "05 Dec 2024, 11:32",
        type: "Send",
        recipient: "Guys R",
        amount: "€255.06",
        status: "active",
    },
    {
        id: "TXN301838",
        date: "18 Nov 2024, 19:57",
        type: "Requested",
        recipient: "Aria J",
        amount: "€33.00",
        status: "pending",
    },
    {
        id: "TXN306047",
        date: "02 Nov 2024, 03:02",
        type: "Received",
        recipient: "Aria S",
        amount: "€1762.50",
        status: "active",
    },
];
