import { loadEnv } from "vite";

const readJsonBody = (req) =>
    new Promise((resolve) => {
        let raw = "";
        req.on("data", (chunk) => {
            raw += chunk;
        });
        req.on("end", () => {
            if (!raw) return resolve(undefined);
            try {
                resolve(JSON.parse(raw));
            } catch {
                resolve(undefined);
            }
        });
    });

const decorateResponse = (res) => {
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (payload) => {
        if (!res.getHeader("Content-Type")) {
            res.setHeader("Content-Type", "application/json");
        }
        res.end(JSON.stringify(payload));
        return res;
    };
    return res;
};

export const vercelApiDevPlugin = () => ({
    name: "vercel-api-dev",
    apply: "serve",

    configureServer(server) {
        const env = loadEnv(server.config.mode, process.cwd(), "");
        for (const [key, value] of Object.entries(env)) {
            if (process.env[key] === undefined) process.env[key] = value;
        }

        server.middlewares.use(async (req, res, next) => {
            const path = (req.url || "").split("?")[0];
            if (!path.startsWith("/api/")) return next();

            const route = path.replace(/^\/api\//, "").replace(/\/+$/, "");
            if (!/^[a-zA-Z0-9/_-]+$/.test(route) || route.includes("..")) {
                return decorateResponse(res).status(404).json({ error: "not_found" });
            }

            let handler;
            try {
                const module = await server.ssrLoadModule(`/api/${route}.js`);
                handler = module.default;
            } catch {
                return decorateResponse(res).status(404).json({ error: "not_found" });
            }

            if (typeof handler !== "function") {
                return decorateResponse(res).status(404).json({ error: "not_found" });
            }

            try {
                req.body = await readJsonBody(req);
                await handler(req, decorateResponse(res));
            } catch (error) {
                server.config.logger.error(`[api] ${route} failed: ${error?.stack || error}`);
                if (!res.writableEnded) {
                    decorateResponse(res).status(500).json({ error: "handler_failed" });
                }
            }
        });
    },
});
