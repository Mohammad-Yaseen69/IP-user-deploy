export const bearerToken = (req) => {
    const header = req.headers?.authorization || "";
    return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
};

export const verifyInstapayToken = async (token) => {
    const base = process.env.INSTAPAY_API || process.env.VITE_IP_DEV_API;
    if (!base) throw new Error("Neither INSTAPAY_API nor VITE_IP_DEV_API is configured");

    const response = await fetch(`${base}/api/account/auth/${encodeURIComponent(token)}`, {
        headers: { Accept: "application/json" },
    });

    return response.ok;
};
