const isProduction = process.env.NODE_ENV === "production";

module.exports = {
    root: true,
    plugins: ["i18next"],
    extends: [
        "react-app",
        "react-app/jest",
        "plugin:i18next/recommended"
    ],
    rules: {
        "i18next/no-literal-string": isProduction
            ? "off"
            : ["warn", {
                markupOnly: true,
                ignoreAttribute: [
                    "data-testid",
                    "to",
                    "src",
                    "alt",
                    "href",
                    "className",
                    "id",
                    "key"
                ]
            }],
        "react-hooks/exhaustive-deps": "off",
        "no-dupe-keys": "off"
    }
};
