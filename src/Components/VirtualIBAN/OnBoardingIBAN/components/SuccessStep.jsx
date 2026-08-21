import React from "react";
import { useTranslation } from "react-i18next";
import {
    CheckCircle,
    Download,
    ChevronRight
} from "react-feather";

const SuccessStep = ({ onDone }) => {
    const { t } = useTranslation();

    return (
        <div
            style={{
                width: "100%",
                minHeight: "100%",
                background: "#fafafa",
                display: "flex",
                justifyContent: "center",
                padding: "40px 20px"
            }}
        >
            <div style={{ width: "100%", maxWidth: 980 }}>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 20
                    }}
                >
                    <div
                        style={{
                            width: 70,
                            height: 70,
                            borderRadius: "50%",
                            border: "5px solid #dcfce7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#19c37d"
                        }}
                    >
                        <CheckCircle size={30} color="#fff" />
                    </div>
                </div>

                <h2
                    style={{
                        textAlign: "center",
                        margin: 0,
                        fontWeight: 700,
                        color: "#222"
                    }}
                >
                    {t("Your Business IBAN is live")} 🎉
                </h2>

                <p
                    style={{
                        textAlign: "center",
                        color: "#777",
                        marginTop: 10,
                        marginBottom: 35,
                        fontSize: 14
                    }}
                >
                    {t(
                        "Welcome to your European financial system. Receive SEPA and SWIFT, hold multi-currency balances, convert crypto to euros and issue cards."
                    )}
                </p>

                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #ececec",
                        borderRadius: 10,
                        padding: 20
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 20
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 600,
                                fontSize: 13
                            }}
                        >
                            🇲🇹 Malta IBAN - MT jurisdiction
                        </div>

                        <div
                            style={{
                                background: "#eef7ff",
                                color: "#4A32E3",
                                padding: "5px 14px",
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600
                            }}
                        >
                            Active
                        </div>
                    </div>

                    <div
                        style={{
                            background: "#f3efff",
                            padding: "16px",
                            borderRadius: 8,
                            color: "#4A32E3",
                            fontWeight: 700,
                            marginBottom: 24
                        }}
                    >
                        MTXX XXXX XXXX XXXX XXXX XX
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            rowGap: 18,
                            fontSize: 14
                        }}
                    >
                        <span style={{ color: "#777" }}>BIC / SWIFT</span>
                        <strong>SYPLMTM2</strong>

                        <span style={{ color: "#777" }}>Issuer</span>
                        <strong>System Pay Services (Malta) Limited - MFSA</strong>

                        <span style={{ color: "#777" }}>Pack applied</span>
                        <strong>Growth Pack</strong>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: 14,
                            marginTop: 30,
                            flexWrap: "wrap"
                        }}
                    >
                        <button
                            onClick={onDone}
                            style={{
                                flex: 1,
                                height: 44,
                                border: "none",
                                borderRadius: 6,
                                color: "#fff",
                                background:
                                    "linear-gradient(90deg,#5c36ff,#4A32E3)",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 8
                            }}
                        >
                            {t("Go to my virtual bank")}
                            <ChevronRight size={16} />
                        </button>

                        <button
                            style={{
                                height: 44,
                                padding: "0 22px",
                                borderRadius: 6,
                                border: "1px solid #ddd",
                                background: "#fff",
                                cursor: "pointer"
                            }}
                        >
                            {t("Explore features")}
                        </button>

                        <button
                            style={{
                                height: 44,
                                padding: "0 22px",
                                borderRadius: 6,
                                border: "1px solid #ddd",
                                background: "#fff",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer"
                            }}
                        >
                            <Download size={15} />
                            {t("Download IBAN letter")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessStep;