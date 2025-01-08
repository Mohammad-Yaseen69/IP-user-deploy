import { createSlice } from "@reduxjs/toolkit";

const pendingsSlice = createSlice({
    name: "pendings",
    initialState: [
        {
            id: 1,
            name: "John Doe",
            date: "23-03-2022",
            time: "10:30 PM",
            amount: 50,
            status: "",
            type: "Quotation",
            transaction_id: "QUO123"
        },
        {
            id: 2,
            name: "Jane Smith",
            date: "25-03-2022",
            time: "12:00 PM",
            amount: 75,
            status: "",
            type: "Quotation",
            transaction_id: "QUO456"
        },
        {
            id: 3,
            name: "John Doe",
            date: "23-03-2022",
            time: "10:30 PM",
            amount: 40,
            status: "",
            type: "Request",
            transaction_id: "REQ123"
        },
        {
            id: 4,
            name: "Jane Smith",
            date: "25-03-2022",
            time: "12:00 PM",
            amount: 120,
            status: "",
            type: "Request",
            transaction_id: "REQ456"
        },
    ],
    reducers: {
        editPending: (state, action) => {
            return state.map(item => {
                if (item.id === action.payload.id) {
                    return { ...item, amount: action.payload.amount };
                }
                return item;
            })
        },
        deletePending: (state, action) => {
            return state = state.filter(item => item.id !== action.payload)
        }
    }
})

export default pendingsSlice.reducer
export const { editPending, deletePending } = pendingsSlice.actions;