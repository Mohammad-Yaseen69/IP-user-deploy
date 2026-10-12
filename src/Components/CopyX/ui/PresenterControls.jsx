import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { SlidersHorizontal, X } from "lucide-react"
import { pathFor } from "../../../stateMachines/copyTrading"
import { ensureRate } from "../api"
import { DEMO_PRESETS, applyDemoPreset, setDemoSpeed } from "../api/demo"
import useInstaPayAccounts from "../hooks/useInstaPayAccounts"
import { useCopyTradingState } from "../state/store"
import styles from "./PresenterControls.module.css"
import { Segmented } from "./primitives"

/* Walkthrough helper, rendered only while the mock API is on. */
const PresenterControls = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const state = useCopyTradingState()
    const { wallets } = useInstaPayAccounts()
    const [open, setOpen] = useState(false)

    /* Presets fund from the wallet already chosen (or the default one), at its live rate. */
    const start = async (id) => {
        const wallet = wallets.find(item => item.id === state.draft.walletId) || wallets.find(item => item.isDefault) || wallets[0]
        if (wallet) await ensureRate(wallet.currency).catch(() => null)
        navigate(pathFor(applyDemoPreset(id, wallet)))
        setOpen(false)
    }

    return (
        <div className={styles.root}>
            {open && (
                <section className={styles.panel} aria-label={t("Presenter controls")}>
                    <div className={styles.head}>
                        <div>
                            <p className={styles.title}>{t("Presenter controls")}</p>
                            <p className={styles.sub}>{t("Mock data only. Pick where the walkthrough starts.")}</p>
                        </div>
                        <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label={t("Close")}><X size={16} /></button>
                    </div>

                    <p className={styles.label}>{t("Start from")}</p>
                    <div className={styles.presets}>
                        {DEMO_PRESETS.map((preset, index) => (
                            <button key={preset.id} type="button" className={styles.preset} onClick={() => start(preset.id)}>
                                <span className={styles.index}>{index + 1}</span>
                                {t(preset.label)}
                            </button>
                        ))}
                    </div>

                    <p className={styles.label}>{t("Status updates")}</p>
                    <Segmented
                        label={t("Status updates")}
                        value={state.demoSpeed || "normal"}
                        onChange={setDemoSpeed}
                        options={[{ value: "normal", label: t("Realistic") }, { value: "fast", label: t("Fast") }]}
                    />
                </section>
            )}
            <button type="button" className={styles.fab} onClick={() => setOpen(value => !value)} aria-expanded={open}>
                <SlidersHorizontal size={16} aria-hidden="true" />
                {t("Presenter")}
            </button>
        </div>
    )
}

export default PresenterControls
