import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Modal, ModalBody } from "reactstrap"
import useWindowWidth from "../../../utils/useWindowWidth"
import ModalShell from "./components/ModalShell"
import { ASSETS, FIRST_WALLET_FREE } from "./data/cryptoWalletOptions"
import { STEPS, STEP_META, TOTAL_STEPS } from "./data/steps"
import useCryptoWallets from "./hooks/useCryptoWallets"
import ActivationStep from "./steps/ActivationStep"
import AddAccountStep from "./steps/AddAccountStep"
import AssetStep from "./steps/AssetStep"

const INITIAL_STATE = {
    accountType: "crypto",
    promo: null,
}

/**
 * "Add crypto wallet" flow: account type -> asset -> activation.
 * Every supported network for the asset is provisioned automatically,
 * so there is no network choice to make.
 *
 * `startAtAsset` skips the fiat/crypto choice, which is how the
 * Crypto & Stablecoins page opens it.
 */
const AddCryptoWalletFlow = ({ isOpen, toggle, onFiatSelected, onCreated, startAtAsset = false }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const { cryptoWallets, isEuropean, ownedCodes, creating, createWallet } = useCryptoWallets()

    const firstStep = startAtAsset ? STEPS.ASSET : STEPS.ACCOUNT_TYPE

    const [step, setStep] = useState(firstStep)
    const [accountType, setAccountType] = useState(INITIAL_STATE.accountType)
    const [assetId, setAssetId] = useState(null)
    const [promo, setPromo] = useState(INITIAL_STATE.promo)

    // Real availability: hide region-restricted assets, mark owned ones read-only.
    const assets = useMemo(
        () => ASSETS
            .filter((asset) => !(asset.restrictedInEurope && isEuropean))
            .map((asset) => ({ ...asset, owned: ownedCodes.has(asset.code) })),
        [isEuropean, ownedCodes]
    )

    const asset = useMemo(() => assets.find((a) => a.id === assetId), [assets, assetId])

    // First wallet is free; a valid promo code also waives the fee.
    const isFree = (FIRST_WALLET_FREE && cryptoWallets.length === 0) || !!promo

    useEffect(() => {
        if (!isOpen) return
        setStep(firstStep)
        setAccountType(INITIAL_STATE.accountType)
        setPromo(INITIAL_STATE.promo)
        setAssetId(assets.find((a) => !a.owned)?.id || null)
    }, [isOpen, firstStep, assets])

    const close = () => toggle?.()

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

        const created = await createWallet(asset?.code)
        if (created) {
            close()
            onCreated?.({ asset })
        }
    }

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
            title: t("Activation"),
            subtitle: t("Review what activating this wallet costs and includes."),
            secondaryLabel: t("Back"),
            primaryLabel: creating
                ? t("Creating...")
                : isFree
                    ? t("Activate wallet")
                    : t("Continue to payment"),
            primaryDisabled: creating || !asset?.code,
            content: (
                <ActivationStep
                    asset={asset}
                    isFree={isFree}
                    promo={promo}
                    onApplyPromo={setPromo}
                    onChangeSelection={() => setStep(STEPS.ASSET)}
                />
            ),
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
                >
                    {config.content}
                </ModalShell>
            </ModalBody>
        </Modal>
    )
}

export default AddCryptoWalletFlow
