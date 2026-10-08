import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Modal, ModalBody } from "reactstrap"
import useWindowWidth from "../../../utils/useWindowWidth"
import ModalShell from "./components/ModalShell"
import { ASSETS } from "./data/cryptoWalletOptions"
import { STEPS, STEP_META, TOTAL_STEPS } from "./data/steps"
import useCryptoWallets from "./hooks/useCryptoWallets"
import ActivationStep from "./steps/ActivationStep"
import AddAccountStep from "./steps/AddAccountStep"
import AssetStep from "./steps/AssetStep"
import InitiatedStep from "./steps/InitiatedStep"
import styles from "./cryptoWallet.module.scss"

const INITIAL_STATE = {
    accountType: "crypto",
}


const AddCryptoWalletFlow = ({ isOpen, toggle, onFiatSelected, onCreated, startAtAsset = false }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const { isEuropean, ownedCodes, creating, createWallet } = useCryptoWallets()

    const firstStep = startAtAsset ? STEPS.ASSET : STEPS.ACCOUNT_TYPE

    const [step, setStep] = useState(firstStep)
    const [accountType, setAccountType] = useState(INITIAL_STATE.accountType)
    const [assetId, setAssetId] = useState(null)
    const [createdAsset, setCreatedAsset] = useState(null)
    const assets = useMemo(
        () => ASSETS
            .filter((asset) => !(asset.restrictedInEurope && isEuropean))
            .map((asset) => ({ ...asset, owned: ownedCodes.has(asset.code) })),
        [isEuropean, ownedCodes]
    )

    const asset = useMemo(() => assets.find((a) => a.id === assetId), [assets, assetId])

    const wasOpen = useRef(false)
    useEffect(() => {
        if (isOpen && !wasOpen.current) {
            setStep(firstStep)
            setAccountType(INITIAL_STATE.accountType)
            setCreatedAsset(null)
            setAssetId(assets.find((a) => !a.owned && !a.comingSoon)?.id || null)
        }
        wasOpen.current = isOpen
    }, [isOpen, firstStep, assets])

    useEffect(() => {
        if (!creating) return undefined
        const warn = (e) => {
            e.preventDefault()
            e.returnValue = ""
        }
        window.addEventListener("beforeunload", warn)
        return () => window.removeEventListener("beforeunload", warn)
    }, [creating])

   const close = () => {
        if (creating) return
        toggle?.()
    }

    const handleBack = () => {
        if (step === STEPS.ASSET) setStep(STEPS.ACCOUNT_TYPE)
        else if (step === STEPS.ACTIVATION) setStep(STEPS.ASSET)
        else close()
    }

    const handleNext = async () => {
        if (step === STEPS.ACCOUNT_TYPE) {
            if (accountType === "fiat") {
                close()
                onFiatSelected?.()
                return
            }
            setStep(STEPS.ASSET)
            return
        }
        if (step === STEPS.ASSET) {
            setStep(STEPS.ACTIVATION)
            return
        }
        if (step === STEPS.INITIATED) {
            close()
            return
        }

        const created = await createWallet(asset?.code)
        if (created) {
            setCreatedAsset(asset)
            setStep(STEPS.INITIATED)
            onCreated?.({ asset })
        }
    }

    const activationContent = creating ? (
        <div className={styles.pendingBlock}>
            <span className={styles.spinner} />
            <h3 className={styles.pendingTitle}>{t("Creating your wallet")}</h3>
            <p className={styles.pendingText}>
                {t("We are sending your request to the provider. Please keep this window open — it only takes a moment.")}
            </p>
        </div>
    ) : (
        <ActivationStep asset={asset} onChangeSelection={() => setStep(STEPS.ASSET)} />
    )

    const config = {
        [STEPS.ACCOUNT_TYPE]: {
            title: t("Add account"),
            subtitle: t("Choose what you want to add to your portfolio."),
            secondaryLabel: t("Cancel"),
            primaryLabel: t("Continue"),
            primaryDisabled: !accountType,
            content: <AddAccountStep accountType={accountType} onSelect={setAccountType} />,
        },
        [STEPS.ASSET]: {
            title: t("Add crypto wallet"),
            subtitle: t("Select the asset you want to hold and receive."),
            secondaryLabel: startAtAsset ? t("Cancel") : t("Back"),
            primaryLabel: t("Continue"),
            primaryDisabled: !assetId,
            content: (
                <AssetStep
                    assets={assets}
                    assetId={assetId}
                    onSelect={setAssetId}
                    isEuropean={isEuropean}
                />
            ),
        },
        [STEPS.ACTIVATION]: {
            title: creating ? t("Activating wallet") : t("Activation"),
            subtitle: creating
                ? t("Do not close this window.")
                : t("Review what this wallet includes before activating."),
            secondaryLabel: t("Back"),
            primaryLabel: creating ? t("Creating...") : t("Activate wallet"),
            primaryDisabled: creating || !asset?.code,
            locked: creating,
            content: activationContent,
        },
        [STEPS.INITIATED]: {
            title: t("Activation initiated"),
            subtitle: t("Your wallet is on its way."),
            primaryLabel: t("Done"),
            primaryDisabled: false,
            hideSecondary: true,
            content: <InitiatedStep asset={createdAsset || asset} />,
        },
    }[step]

    const meta = STEP_META[step]
    const stepProgress = meta
        ? {
            label: t("Step {{current}} of {{total}}", { current: meta.index, total: TOTAL_STEPS }),
            name: t(meta.name),
            percent: (meta.index / TOTAL_STEPS) * 100,
        }
        : null

    return (
        <Modal
            isOpen={isOpen}
            toggle={close}
            centered
            backdrop={creating ? "static" : true}
            keyboard={!creating}
            style={{ maxWidth: width > 640 ? "560px" : "100%" }}
        >
            <ModalBody style={{ padding: 0 }}>
                <ModalShell
                    title={config.title}
                    subtitle={config.subtitle}
                    onClose={close}
                    step={stepProgress}
                    secondaryLabel={config.secondaryLabel}
                    onSecondary={step === firstStep ? close : handleBack}
                    primaryLabel={config.primaryLabel}
                    onPrimary={handleNext}
                    primaryDisabled={config.primaryDisabled}
                    hideSecondary={config.hideSecondary}
                    locked={config.locked}
                >
                    {config.content}
                </ModalShell>
            </ModalBody>
        </Modal>
    )
}

export default AddCryptoWalletFlow
