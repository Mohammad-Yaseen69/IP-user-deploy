import { createSlice } from "@reduxjs/toolkit";

const transactionsSlice = createSlice({
    name: "transactions",
    initialState: [
        {
            id: 1,
            beneficiary: 1,
            date: '2022-03-15',
            type: 'Received',
            transactionTime: "12:23 PM",
            paymentType: "Instant",
            transactionId: '12345',
            amount: '$50.00',
            status: 'Completed',
            payoutChannel: "Bank Transfer",
            country: {
                code: "PK",
                name: "Pakistan"
            }
        },
        {
            id: 2,
            beneficiary: 4,
            date: '2022-03-16',
            type: 'Requested',
            transactionTime: "12:23 PM",
            paymentType: "Scheduled",
            transactionId: '67890',
            amount: '$75.00',
            status: 'Pending',
            payoutChannel: "Bank Transfer",
            country: {
                code: "PK",
                name: "Pakistan"
            }
        },
        {
            id: 3,
            beneficiary: 3,
            date: '2022-03-17',
            type: 'Sent',
            transactionTime: "12:23 PM",
            paymentType: "Recursive",
            transactionId: '24680',
            amount: '$100.00',
            status: 'Cancelled',
            payoutChannel: "Bank Transfer",
            country: {
                code: "PK",
                name: "Pakistan"
            }
        },
        {
            id: 4,
            beneficiary: 6,
            date: '2022-03-15',
            type: 'Quoted',
            transactionTime: "12:23 PM",
            paymentType: "Instant",
            transactionId: '12345',
            amount: '$50.00',
            status: 'Completed',
            payoutChannel: "Bank Transfer",
            country: {
                code: "PK",
                name: "Pakistan"
            }
        },
        {
            id: 5,
            beneficiary: 6,
            date: '2022-03-16',
            type: 'Received',
            transactionTime: "12:23 PM",
            paymentType: "Instant",
            transactionId: '67890',
            amount: '$75.00',
            status: 'Pending',
            payoutChannel: "Bank Transfer",
            country: {
                code: "PK",
                name: "Pakistan"
            }
        },
        {
            id: 6,
            beneficiary: 2,
            date: '2022-03-17',
            type: 'Requested',
            transactionTime: "12:23 PM",
            paymentType: "Instant",
            transactionId: '24680',
            amount: '$100.00',
            status: 'Cancelled',
            payoutChannel: "Bank Transfer",
            country: {
                code: "PK",
                name: "Pakistan"
            }
        },
        {
            id: 7,
            beneficiary: 4,
            date: '2022-03-15',
            type: 'Sent',
            transactionTime: "12:23 PM",
            paymentType: "Instant",
            transactionId: '12345',
            amount: '$50.00',
            status: 'Completed',
            payoutChannel: "Bank Transfer",
            country: {
                code: "PK",
                name: "Pakistan"
            }
        },
        {
            id: 8,
            beneficiary: 1,
            date: '2022-03-16',
            type: 'Requested',
            transactionTime: "12:23 PM",
            paymentType: "Instant",
            transactionId: '67890',
            amount: '$75.00',
            status: 'Pending',
            payoutChannel: "Bank Transfer",
            country: {
                code: "PK",
                name: "Pakistan"
            }
        },
        {
            id: 9,
            beneficiary: 3,
            date: '2022-03-17',
            type: 'Received',
            transactionTime: "12:23 PM",
            paymentType: "Instant",
            transactionId: '24680',
            amount: '$100.00',
            status: 'Cancelled',
            payoutChannel: "Bank Transfer",
            country: {
                code: "PK",
                name: "Pakistan"
            }
        },
    ],
    reducers: {
        newTransaction: (state, action) => {
            state.push(action.payload)
        }
    }
})

export default transactionsSlice.reducer;
export const { newTransaction } = transactionsSlice.actions;