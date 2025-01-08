import { createSlice } from "@reduxjs/toolkit";

const chipsInRequests = createSlice({
    name: "chipsInRequests",
    initialState: [
        {
            id: "general",
            name: "General Item",
            date: "2023-03-03",
            type: "General",
            amount: 5000,
            status: "Active",
            description: "This is the description",
            qr_link: `https://tivo-new.vercel.app/requests/general`,
            wallet: "1111 2222 3333 4444",
            currency: "USD"
        },
        {
            id: 2,
            name: "Specific Item",
            wallet: "1234 2345 3456 4567",
            currency: "USD",
            date: "2023-04-04",
            type: "Specific",
            time: "12:30",
            transactions: [
                {
                    payer_name: "Jonathan Wick",
                    amount: 500
                }
            ],
            total_amount: 20000,
            amount: 6000,
            status: "Inactive",
            description: "",
            qr_link: `https://tivo-new.vercel.app/requests/2`
        },
        {
            id: 3,
            name: "Send Money",
            wallet: "0987 9876 8765 7654",
            currency: "EUR",
            date: "2023-02-03",
            type: "Specific",
            time: "12:30",
            transactions: [
                {
                    payer_name: "Dave Gray",
                    amount: 500
                }
            ],
            total_amount: 20000,
            amount: 2300,
            status: "Active",
            description: "",
            qr_link: `https://tivo-new.vercel.app/requests/3`
        },
        {
            id: 4,
            name: "PlaceHolder",
            wallet: "1122 3344 5566 7788",
            currency: "GBP",
            date: "2022-12-10",
            type: "Specific",
            time: "12:30",
            transactions: [
                {
                    payer_name: "Brad Pitt",
                    amount: 500
                }
            ],
            total_amount: 20000,
            amount: 5230,
            status: "Active",
            description: "",
            qr_link: `https://tivo-new.vercel.app/requests/4`
        },
    ],
    reducers: {
        changeRequestStatus: (state, action) => {
            state.map(item => {
                if (item.id === action.payload) {
                    return item.status = item.status === "Active" ? "Inactive" : "Active"
                }
            })
        },
        deleteRequest: (state, action) => {
            return state = state.filter(item => item.id !== action.payload)
        },
        addRequest: (state, action) => {
            state.push(action.payload)
        }
    }
})

export default chipsInRequests.reducer;
export const { changeRequestStatus, deleteRequest, addRequest } = chipsInRequests.actions;