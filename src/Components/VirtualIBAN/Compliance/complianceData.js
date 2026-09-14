
export const complianceMockData = {
  viewState: "action_needed", 
  bannerMessage: "We keep compliance clear and reassuring. Responding promptly keeps payments flowing - failure to respond may restrict account activity.",
  lastReviewed: "5 Jul 2026",

  restrictedData: {
    title: "Your account is temporarily restricted",
    subtitle: "The deadline passed on 2 requests without a response. Resolve the items below to restore full account access - this usually takes under 24 hours once submitted.",
    items: [
      { id: 1, title: "Source of funds - USDC settlement", status: "Overdue" },
      { id: 2, title: "Counterparty verification", status: "Overdue" }
    ]
  },
  requests: [
    {
      id: 1,
      title: "Source of funds - USDC settlement",
      category: "Action needed",
      status: "action_needed",
      description: "Why we ask: A large stablecoin inflow (USDC) settled to your USD vIBAN. We confirm the commercial origin before releasing the hold.",
      deadline: "18 Jul 2026",
      buttons: [
        { label: "Upload documents", variant: "primary" },
        { label: "Message compliance", variant: "secondary" }
      ]
    },
    {
      id: 2,
      title: "Counterparty verification",
      category: "Action needed",
      status: "action_needed",
      description: "Why we ask: New beneficiary \"Kernel Trading\" was added. We verify the counterparty relationship before approving future transfers.",
      deadline: "21 Jul 2026",
      buttons: [
        { label: "Upload documents", variant: "primary" },
        { label: "Message compliance", variant: "secondary" }
      ]
    },
    {
      id: 3,
      title: "Refreshed UBO declaration",
      category: "In progress",
      status: "in_progress",
      description: "Annual review of ultimate beneficial owners for your account.",
      deadline: "Due 29 Jul 2026",
      buttons: []
    }
  ]
};

// Restrict State
// export const complianceMockData = {
//   viewState: "restricted",
//   bannerMessage: "Your account access has been limited due to overdue compliance requests. Please resolve them immediately.",
//   lastReviewed: "1 Jul 2026",

//   restrictedData: {
//     title: "Your account is temporarily restricted",
//     subtitle: "The deadline passed on 2 requests without a response. Resolve the items below to restore full account access - this usually takes under 24 hours once submitted.",
//     items: [
//       { id: 1, title: "Source of funds - USDC settlement", status: "Overdue" },
//       { id: 2, title: "Counterparty verification", status: "Overdue" }
//     ]
//   },

//   requests: []
// };

//  AllCaughtUpView
// export const complianceMockData = {
//   viewState: "all_clear",
//   bannerMessage: "Everything looks great! All compliance requirements have been successfully verified.",
//   lastReviewed: "10 Sep 2026",

//   restrictedData: {
//     title: "",
//     subtitle: "",
//     items: []
//   },

//   requests: []
// };