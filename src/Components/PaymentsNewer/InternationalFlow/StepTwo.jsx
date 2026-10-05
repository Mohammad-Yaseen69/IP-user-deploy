import { useLocation, useNavigate } from "react-router"
import styles from "./styles/steptwo.module.css"
import { useContext, useEffect, useMemo, useState } from 'react'
import search_icon from "./files/search.svg"
import { UserContext } from "../../../Context/UserContext"
import { service_name_formatter } from "../../TransactionsNewApi/TransactionItem"
import { useTranslation } from "react-i18next"
import i18next from "i18next"
import { Modal, ModalBody } from "reactstrap"
import AddBeneficiary from "../../AddBeneficiary"
import QuickAddBeneficiary from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/QuickAddBeneficiary"
import { USE_NEW_BENEFICIARY_FLOW } from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/constants"
import { buildTransactionBeneficiaryDetails } from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/buildPayloads"
import { getBeneficiaryDisplayName, getBeneficiaryInitial } from "./beneficiaryHelpers"

function levenshteinDistance(a, b) {
    const dp = Array(a.length + 1)
        .fill(null)
        .map(() => Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) {
        dp[i][0] = i;
    }
    for (let j = 0; j <= b.length; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }

    return dp[a.length][b.length];
}

function calculateSimilarity(a, b) {
    const distance = levenshteinDistance(a, b);
    const maxLen = Math.max(a.length, b.length);
    return ((maxLen - distance) / maxLen) * 100;
}

const StepTwo = ({ data, dataHandler }) => {
    const { t } = useTranslation()
    const { getUserBeneficiaries, beneficiaries } = useContext(UserContext)
    const [message, setMessage] = useState(t("No beneficiary found."))
    const navigate = useNavigate()
    const [search, setSearch] = useState("")
    const [showOthers, setShowOthers] = useState(false)
    const [showBeneficiaryAddModal, setShowBeneficiaryAddModal] = useState(false)

    useEffect(() => {
        getUserBeneficiaries()
    }, [])

    /* A new recipient is not saved yet: its details ride along with the transfer and are
       sent as `beneficiaryDetails` when the transaction is created. The draft replaces the
       whole beneficiary, and its display fields (first_name, company_name, bank_details...)
       come from the same mapped details, so the later steps read it like a saved one. */
    const handleBeneficiarySaved = (draft, saveForFuture) => {
        const draftDetails = buildTransactionBeneficiaryDetails({
            beneficiaryPayload: draft.beneficiaryPayload,
            channelPayload: draft.channelPayload,
            saveForFuture,
        })

        dataHandler("beneficiary", {
            ...draftDetails,
            isNew: true,
            draftDetails,
        })
        setShowBeneficiaryAddModal(false)
    }

    const draftBeneficiary = data.beneficiary?.isNew ? data.beneficiary : null

    const bens = useMemo(() => {
        let fil = beneficiaries.filter(item => item.account_type.some(item => item.toLowerCase().includes(data.payoutChannel?.value?.toLowerCase())))

        if (data.country?.alpha3) {
            fil = fil.filter(item => {
                const bankIsoCode = item?.bank_details?.[0]?.extras?.country_iso_code
                if (bankIsoCode && data.payoutChannel?.value === "bank") {
                    if (bankIsoCode === data.country?.alpha3) {
                        return true
                    }
                } else {
                    if (item?.country_iso_code === data.country?.alpha3) {
                        return true
                    }
                }
                return false
            })
            setMessage(t(`No beneficiary found from {{country}} having {{value}} details.`, { value: data.payoutChannel?.value, country: data.country?.name }))
        }

        if (data.payoutChannel?.value === "mobile") {
            fil = fil.filter(item => +item?.mobile_wallet?.[0]?.money_provider === +data.payer?.id)
            setMessage(t(`No beneficiary found from {{country}} having {{value}} details.`, { value: data.payer?.name, country: data.country?.name }))
        }

        if (data.payoutChannel?.value === "bank") {
            // fil = fil.filter(item => {
            //     const distance = levenshteinDistance(item?.bank_details?.[0]?.bank_name, data.payer?.name);
            //     const maxLength = Math.max(item?.bank_details?.[0]?.bank_name.length, data.payer?.name.length);
            //     return distance / maxLength < 0.3;
            // });

            // fil.filter(item => item?.bank_details?.[0]?.bank_name?.toLowerCase() === data.payer?.name?.toLowerCase() || item?.bank_details?.[0]?.bank_name?.toLowerCase()?.split(" ")?.some((it) => data.payer?.toLowerCase()?.name?.split(' ').some(i => i?.toLowerCase() === it?.toLowerCase())))

            function findSimilarItemsBySubstring(array, word, threshold = 60) {
                return array.filter(item => {
                    const similarity = calculateSimilarity(item?.bank_details?.[0]?.name?.toLowerCase(), word);
                    // console.log(`Similarity between "${item}" and "${word}": ${similarity}%`);
                    return similarity >= threshold;
                });
            }
            fil = findSimilarItemsBySubstring(
                fil?.map(i => i),
                data.payer?.name?.toLowerCase(),
                60
            );

            if (fil.length === 0) setShowOthers(true);
            setMessage(t(`No beneficiary found from {{country}} having {{value}} details.`, { value: data.payer?.name, country: data.country?.name }))
        }


        const type = data.transactionType === "C" ? "individual" : "business";
        fil = fil.filter(ben => ben.beneficiary_type === type);


        return fil
    }, [beneficiaries, i18next.language])

    const bankBens = useMemo(() => {
        let fil = beneficiaries.filter(item => item.account_type.some(item => item.toLowerCase().includes(data.payoutChannel?.value?.toLowerCase())))

        fil = fil.filter(item => {
            const bankIsoCode = item?.bank_details?.[0]?.extras?.country_iso_code
            if (bankIsoCode) {
                if (bankIsoCode === data.country?.alpha3) {
                    return true
                }
            } else {
                if (item?.country_iso_code === data.country?.alpha3) {
                    return true
                }
            }
            return false
        })

        const type = data.transactionType === "C" ? "individual" : "business";
        fil = fil.filter(ben => ben.beneficiary_type === type);

        return fil
    }, [beneficiaries])

    const filterd = useMemo(() => {
        if (search.length > 0) {
            if (data.beneficiary?._id) {
                dataHandler("beneficiary", {})
            }
            return bens?.filter(item => item?.first_name?.toLowerCase()?.includes(search?.toLowerCase()) || item?.last_name?.toLowerCase()?.includes(search?.toLowerCase()))
        } else {
            return bens
        }
    }, [search, bens])

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const recipient = queryParams.get("recipient")

    /* The recipient from the link only preselects: StepTwo remounts every time the user comes
       back to this step and the list refetches, so it must never replace a beneficiary the
       user already picked or added. */
    useEffect(() => {
        if (!recipient || data.beneficiary?._id || data.beneficiary?.isNew) return

        const ben = filterd?.find(item => item?._id === recipient)
        if (ben) dataHandler("beneficiary", ben)
    }, [recipient, filterd])

    /* Mid transfer we already know the country, the method and the payer, so adding a
       recipient only asks for what the provider still needs. */
    if (USE_NEW_BENEFICIARY_FLOW && showBeneficiaryAddModal) {
        return (
            <div className={styles.container}>
                <QuickAddBeneficiary
                    country={data.country}
                    recipientType={data.transactionType === "C" ? "individual" : "business"}
                    service={data.payoutChannel}
                    payer={data.payer}
                    payerRequiredFields={data.payerRequiredFields?.[0] || []}
                    onCancel={() => setShowBeneficiaryAddModal(false)}
                    onSaved={handleBeneficiarySaved}
                />
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {
                window.innerWidth > 1000
                &&
                <div className={styles.top}>
                    <span>{t("Beneficiaries")}</span>
                    <button onClick={() => {
                        setShowBeneficiaryAddModal(true)
                    }}>
                        <span>{t("Add Beneficiaries")}</span>
                    </button>
                </div>
            }
            <div className={styles.search}>
                <img
                    src={search_icon}
                    alt="asdadf"
                />
                <input
                    type="search"
                    placeholder={t("Search")}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            {
                window.innerWidth < 1000
                &&
                <div className={styles.top}>
                    <span style={{ opacity: 0, scale: 0, pointerEvents: "none" }}>{t("Beneficiaries")}</span>
                    <button onClick={() => navigate("/beneficiaries")}>
                        <span>{t("Manage Beneficiaries")}</span>
                    </button>
                </div>
            }
            <div className={styles.beneficiaries}>
                {
                    draftBeneficiary
                    &&
                    <div style={{ marginBottom: "8px" }} className={`${styles.ben_card} ${styles.active}`}>
                        <div style={{ flexShrink: 0 }} className={styles.dp}>
                            {getBeneficiaryInitial(draftBeneficiary)}
                        </div>
                        <div style={{ width: "100%" }} className={styles.ben_details}>
                            <div className={styles.bd_top}>
                                <h5>{getBeneficiaryDisplayName(draftBeneficiary)}</h5>
                                <div className={styles.badge}>
                                    <span>{t("New")}</span>
                                </div>
                            </div>
                            <span>
                                {data?.payoutChannel?.value === "mobile" ? t("Mobile Wallet") : data?.payoutChannel?.value === "cash" ? t("Cash Point") : t("Bank")}
                                :
                                {data?.payer?.name ?? ""}
                            </span>
                            {
                                data.payoutChannel?.value === "bank" && (draftBeneficiary.bank_details?.[0]?.iban || draftBeneficiary.bank_details?.[0]?.account_number)
                                &&
                                <span>
                                    {
                                        draftBeneficiary.bank_details[0].iban
                                            ?
                                            `${t("IBAN")}: ${draftBeneficiary.bank_details[0].iban}`
                                            :
                                            `${t("Account Number")}: ${draftBeneficiary.bank_details[0].account_number}`
                                    }
                                </span>
                            }
                            {
                                data.payoutChannel?.value === "mobile" && draftBeneficiary.mobile_wallet?.[0]?.wallet_account_number
                                &&
                                <span>{`${t("Number")}: ${draftBeneficiary.mobile_wallet[0].wallet_account_number}`}</span>
                            }
                        </div>
                    </div>
                }
                {
                    filterd?.length > 0
                        ?
                        filterd?.map(item => (
                            <div key={item?._id} className={`${styles.ben_card} ${data?.beneficiary?._id === item?._id ? styles.active : ""}`} onClick={() => dataHandler("beneficiary", item)}>
                                <div style={{ flexShrink: 0 }} className={styles.dp}>
                                    {item?.first_name?.[0] ?? item?.company_name?.[0]}
                                </div>
                                <div style={{ width: "100%" }} className={styles.ben_details}>
                                    <div className={styles.bd_top}>
                                        <h5>{(item?.first_name || item?.company_name || "") + (item?.last_name ? ` ${item.last_name}` : "")}</h5>
                                        {/* {
                                            window.innerWidth > 1000 &&
                                            <div className={styles.badge}>
                                                <img src={active} alt="" />
                                                <span style={{ maxWidth: "40ch", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                                    {service_name_formatter(data?.payer?.name)}
                                                </span>
                                            </div>
                                        } */}
                                    </div>
                                    <span>
                                        {data?.payoutChannel?.value === "mobile" ? t("Mobile Wallet") : data?.payoutChannel?.value === "cash" ? t("Cash Point") : t("Bank")}
                                        :
                                        {data?.payoutChannel?.value === "mobile" ? data?.payer?.name : data?.payoutChannel?.value === "cash" ? data?.payer?.name : service_name_formatter(item?.bank_details?.[0]?.bank_name ?? item?.bank_details?.[0]?.name ?? "N/A")}
                                    </span>
                                    <span>
                                        {
                                            data.payoutChannel?.value === "bank"
                                            &&
                                            (
                                                item?.bank_details?.[0]?.iban
                                                    ?
                                                    `${t("IBAN")}: ${item?.bank_details?.[0]?.iban}`
                                                    :
                                                    `${t("Account Number")}: ${item?.bank_details?.[0]?.account_number}`
                                            )
                                        }
                                        {
                                            data.payoutChannel?.value === "mobile"
                                            &&
                                            `${t("Number")}: ${item?.mobile_wallet?.[0]?.wallet_account_number}`
                                        }
                                    </span>
                                </div>
                            </div>
                        ))
                        :
                        <div style={{ margin: "1rem auto", textAlign: "center", fontSize: ".8rem" }}>{message?.replace("No", data.transactionType === "C" ? "No individual" : "No business")}
                            <span onClick={() => {
                                setShowBeneficiaryAddModal(true)
                            }} style={{ cursor: "pointer", color: "#3a04e2" }}>
                                {t("Add Now")}
                            </span>
                        </div>
                }
                {
                    filterd.length > 0 && data.payoutChannel?.value === "bank" && bankBens?.length > 0
                    &&
                    <div onClick={() => setShowOthers(!showOthers)} style={{ margin: "1rem 0", textAlign: "center", color: "#5926f0", textDecoration: "underline", fontSize: ".7rem", cursor: "pointer" }}>
                        {
                            showOthers
                                ?
                                t("Show Less")
                                :
                                t("Show More")
                        }
                    </div>
                }
                {
                    data.payoutChannel?.value === "bank" && bankBens?.length > 0 && showOthers
                        ?
                        <div style={{ marginTop: "1rem" }}>
                            <span style={{ marginTop: "1rem" }}>{t("Other Beneficiaries:")} </span>
                            {
                                bankBens.map(item => (
                                    <div key={item?._id} style={{ marginTop: "8px" }} className={`${styles.ben_card} ${data?.beneficiary?._id === item?._id ? styles.active : ""}`}
                                        onClick={() => {
                                            dataHandler("beneficiary", item)
                                            console.log(item)
                                        }}>
                                        <div className={styles.dp}>
                                            {item?.first_name?.[0] ?? item?.company_name?.[0]}
                                        </div>
                                        <div className={styles.ben_details}>
                                            <div className={styles.bd_top}>
                                                <h5>{(item?.first_name || item?.company_name || "") + (item?.last_name ? ` ${item.last_name}` : "")}</h5>
                                                {/* {
                                                    window.innerWidth > 1000 &&
                                                    <div className={styles.badge}>
                                                        <img src={active} alt="" />
                                                        <span style={{ maxWidth: "40ch", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                                            {service_name_formatter(data?.payer?.name)}
                                                        </span>
                                                    </div>
                                                } */}
                                            </div>
                                            {data?.payoutChannel?.value === "mobile"
                                                ? (
                                                    <span>
                                                        {t("Mobile Wallet")} : {data?.payer?.name ?? ""}
                                                    </span>
                                                )
                                                : data?.payoutChannel?.value === "cash"
                                                    ? (
                                                        <span>
                                                            {t("Cash Point")} : {data?.payer?.name ?? ""}
                                                        </span>
                                                    )
                                                    : (item?.bank_details?.[0]?.bank_name ||
                                                        item?.bank_details?.[0]?.name)
                                                        ? (
                                                            <span>
                                                                {t("Bank")} :{" "}
                                                                {service_name_formatter(
                                                                    item?.bank_details?.[0]?.bank_name ??
                                                                    item?.bank_details?.[0]?.name
                                                                )}
                                                            </span>
                                                        )
                                                        : null}
                                            <span>
                                                {
                                                    data.payoutChannel?.value === "bank"
                                                    &&
                                                    (
                                                        item?.bank_details?.[0]?.iban
                                                            ?
                                                            `${t("IBAN")}: ${item?.bank_details?.[0]?.iban}`
                                                            :
                                                            `${("Account Number")}: ${item?.bank_details?.[0]?.account_number}`
                                                    )
                                                }
                                                {
                                                    data.payoutChannel?.value === "mobile"
                                                    &&
                                                    `NUMBER: ${item?.mobile_wallet?.[0]?.wallet_account_number}`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        :
                        ""
                }
            </div>


            {!USE_NEW_BENEFICIARY_FLOW && (
                <Modal style={{ minWidth: window.innerWidth > 1000 && "900px" }} toggle={() => setShowBeneficiaryAddModal(false)} isOpen={showBeneficiaryAddModal}>
                    <ModalBody style={{ padding: "0px" }}>
                        <AddBeneficiary
                            inInternationalModal={true}
                            toggleHandler={async (addedBen) => {
                                await getUserBeneficiaries()
                                dataHandler("beneficiary", addedBen)
                                setShowBeneficiaryAddModal(false)
                            }}
                        />
                    </ModalBody>
                </Modal>
            )}
        </div>
    )
}

export default StepTwo