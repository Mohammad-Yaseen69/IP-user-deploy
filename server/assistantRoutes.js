import express from "express";
import sessionHandler from "../api/chatkit/session.js";
import transcribeHandler from "../api/transcribe.js";

const MAX_BODY = "6mb";

export const assistantRoutes = () => {
    const router = express.Router();
    const json = express.json({ limit: MAX_BODY });

    router.post("/chatkit/session", json, sessionHandler);
    router.post("/transcribe", json, transcribeHandler);

    return router;
};

export default assistantRoutes;
