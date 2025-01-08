import { createSlice } from "@reduxjs/toolkit";

const referralsSlice = createSlice({
    name: "referrals",
    initialState: [
        {
            id: 1,
            card_bg: "https://i.pinimg.com/736x/36/cb/10/36cb10c38de9b0a295e1372d495b4508.jpg",
            avatar: "https://cdn.vox-cdn.com/thumbor/mfZr4TZ1MD-u_tsUZbiFQn9cjxo=/0x0:6000x3650/1400x1400/filters:focal(3000x1825:3001x1826)/cdn.vox-cdn.com/uploads/chorus_asset/file/24510842/john_wick_chapter_4_JW4_Unit_211027_00134_R2_rgb.jpeg",
            name: "John Wick",
            post: "Dunno"
        },
        {
            id: 2,
            card_bg: "https://i.pinimg.com/736x/36/cb/10/36cb10c38de9b0a295e1372d495b4508.jpg",
            avatar: "https://cdn.vox-cdn.com/thumbor/mfZr4TZ1MD-u_tsUZbiFQn9cjxo=/0x0:6000x3650/1400x1400/filters:focal(3000x1825:3001x1826)/cdn.vox-cdn.com/uploads/chorus_asset/file/24510842/john_wick_chapter_4_JW4_Unit_211027_00134_R2_rgb.jpeg",
            name: "Jonathan Jovanovich",
            post: "Artist"
        },
        {
            id: 3,
            card_bg: "https://i.pinimg.com/736x/36/cb/10/36cb10c38de9b0a295e1372d495b4508.jpg",
            avatar: "https://cdn.vox-cdn.com/thumbor/mfZr4TZ1MD-u_tsUZbiFQn9cjxo=/0x0:6000x3650/1400x1400/filters:focal(3000x1825:3001x1826)/cdn.vox-cdn.com/uploads/chorus_asset/file/24510842/john_wick_chapter_4_JW4_Unit_211027_00134_R2_rgb.jpeg",
            name: "John Wick",
            post: "Dunno"
        },
        {
            id: 4,
            card_bg: "https://i.pinimg.com/736x/36/cb/10/36cb10c38de9b0a295e1372d495b4508.jpg",
            avatar: "https://cdn.vox-cdn.com/thumbor/mfZr4TZ1MD-u_tsUZbiFQn9cjxo=/0x0:6000x3650/1400x1400/filters:focal(3000x1825:3001x1826)/cdn.vox-cdn.com/uploads/chorus_asset/file/24510842/john_wick_chapter_4_JW4_Unit_211027_00134_R2_rgb.jpeg",
            name: "Jonathan Jovanovich",
            post: "Designer"
        },
        {
            id: 5,
            card_bg: "https://i.pinimg.com/736x/36/cb/10/36cb10c38de9b0a295e1372d495b4508.jpg",
            avatar: "https://cdn.vox-cdn.com/thumbor/mfZr4TZ1MD-u_tsUZbiFQn9cjxo=/0x0:6000x3650/1400x1400/filters:focal(3000x1825:3001x1826)/cdn.vox-cdn.com/uploads/chorus_asset/file/24510842/john_wick_chapter_4_JW4_Unit_211027_00134_R2_rgb.jpeg",
            name: "John Wick",
            post: "Dunno"
        },
        {
            id: 6,
            card_bg: "https://i.pinimg.com/736x/36/cb/10/36cb10c38de9b0a295e1372d495b4508.jpg",
            avatar: "https://cdn.vox-cdn.com/thumbor/mfZr4TZ1MD-u_tsUZbiFQn9cjxo=/0x0:6000x3650/1400x1400/filters:focal(3000x1825:3001x1826)/cdn.vox-cdn.com/uploads/chorus_asset/file/24510842/john_wick_chapter_4_JW4_Unit_211027_00134_R2_rgb.jpeg",
            name: "Jonathan Jovanovich",
            post: "Designer"
        },
    ]
})

export default referralsSlice.reducer;