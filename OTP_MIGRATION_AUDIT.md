# OTP Component Migration Audit

This report audits every call site of the 3 legacy OTP components that are being replaced by the unified `src\Common\Component\OtpVerification\index.jsx` component (selected via its `variant` prop, default `"card"`). For each call site, the props passed in JSX were compared against the prop list the target variant actually destructures.

**Summary of usage counts:**

| Old component | Target variant | Usage sites audited |
|---|---|---|
| `src\Components\UserSettingsNew\OTPConfirmation.jsx` | `variant="card"` | **17** |
| `src\Components\PaymentsNewer\InternationalFlow\OtpConfirmation.jsx` | `variant="modal"` | **10** |
| `src\Components\VirtualIBAN\WithdrawBalanceModal\OTPConfirmation.jsx` | `variant="buttons"` | **1** |
| **Total** | | **28 renders across 26 files** |

**Headline finding:** across all 28 renders in the 26 files, **no file passes a prop name that the target variant doesn't understand** (no true "extra prop" mismatches). The issues found are all of the softer kind — commonly-important props (`setter`, `setterValue`, `resendHandler`, `resetIdempotency`, `error`) that are omitted at some call sites, which is worth a manual functional check during migration even though it isn't a hard blocker.

---

## Group 1 — `UserSettingsNew/OTPConfirmation.jsx` → `variant="card"`

Expected props for `CardOtp`: `setter, callback, setterValue, hideOtp, type, processing, resendHandler, authType, setAuthType, hideTfaSwitch, showAuthToggle, inBasic, fullHeight, showBackButton, onBack, numberOfFields`

| # | File | Import line | Render line(s) | Props passed | Flow | Mismatch |
|---|---|---|---|---|---|---|
| 1 | `src\Components\VirtualIBAN\VirtualIbanModal\index.jsx` | 60 | 927–936 | `setter`, `setterValue`, `hideOtp`, `callback`, `processing`, `resendHandler`, `authType`, `setAuthType` | Virtual IBAN activation/creation OTP step | ✅ No mismatch |
| 2 | `src\Components\VirtualIBAN\SendMoney\SwiftTransfer\index.jsx` | 57 | 1143–1153 | `fullHeight`, `setter`, `setterValue`, `hideOtp`, `callback`, `processing`, `resendHandler`, `authType`, `setAuthType` | SWIFT international transfer OTP step | ✅ No mismatch |
| 3 | `src\Components\VirtualIBAN\SendMoney\SepaTransfer\index.jsx` | 40 | 883–886 | `fullHeight`, `setter`, `setterValue`, `hideOtp`, `callback`, `processing`, `resendHandler`, `authType`, `setAuthType`, `showBackButton`, `onBack` | SEPA European transfer OTP step | ✅ No mismatch |
| 4 | `src\Components\VirtualIBAN\OnBoardingIBAN\index.jsx` | 26 | 488–495 | `authType`, `setAuthType`, `callback`, `hideOtp`, `setter`, `resendHandler` | Business IBAN onboarding activation payment OTP | ⚠️ MISSING: `setterValue` is not passed — since `CardOtp` calls `setter(setterValue)` on success, `setterValue` will be `undefined`; verify this is intentional before migrating. |
| 5 | `src\Components\UpdatePin\index.jsx` | 11 | 271–280 and 443–452 (two identical renders, desktop/success layout duplicates) | `callback`, `setter`, `setterValue`, `hideOtp`, `processing`, `resendHandler`, `authType`, `showAuthToggle` | Update account PIN OTP confirmation | ⚠️ MISSING: `setAuthType` not passed in either render — `authType` is passed read-only with no setter, so the auth-method toggle inside the component (`setAuthType(...)`) will no-op/crash if triggered. |
| 6 | `src\Components\Settings\VerificationPayment.jsx` | 12 | 584–593 | `callback`, `setter`, `setterValue`, `hideOtp`, `processing`, `resendHandler`, `authType`, `setAuthType` | KYC/KYB verification fee payment OTP | ✅ No mismatch |
| 7 | `src\Components\Settings\TwoFactorAuth.jsx` | 16 | 620–630 | `callback`, `setter`, `setterValue`, `hideOtp`, `processing`, `resendHandler`, `authType`, `setAuthType` | Biometric/passkey registration OTP (2FA settings) | ✅ No mismatch (a `showAuthToggle` line exists but is commented out) |
| 8 | `src\Components\Settings\SecurityQuestion.jsx` | 9 | 322–331 | `callback`, `setter`, `setterValue`, `hideOtp`, `processing`, `resendHandler`, `authType`, `setAuthType` | Update security questions OTP confirmation | ✅ No mismatch |
| 9 | `src\Components\Settings\Password.jsx` | 11 | 244–253 | `callback`, `setter`, `setterValue`, `hideOtp`, `processing`, `resendHandler`, `authType`, `setAuthType` | Change account password OTP confirmation | ✅ No mismatch |
| 10 | `src\Components\Settings\AccountItem.jsx` | 11 | 369–377 (inside a `display:none` wrapper — appears dead/legacy) and 461–473 (active) | 369–377: `callback`, `setter`, `setterValue`, `hideOtp`, `authType`, `setAuthType`; 461–473: `callback`, `setter`, `setterValue`, `hideOtp`, `processing`, `resendHandler`, `authType`, `setAuthType` | Link/unlink social accounts (Instagram/Telegram/WhatsApp) OTP | ⚠️ First render (369–377, unreachable/hidden) is missing `resendHandler` and `processing` — likely harmless since dead, but flag for cleanup during migration. |
| 11 | `src\Components\ReferralsNew\CommissionWithdraw.jsx` | 11 | 159–168 | `callback`, `setter`, `setterValue`, `hideOtp`, `processing`, `resendHandler`, `authType`, `setAuthType` | Withdraw referral commission externally OTP | ✅ No mismatch |
| 12 | `src\Components\ReferralsNew\CommissionConversion.jsx` | 13 | 335–344 | `callback`, `setter`, `setterValue`, `hideOtp`, `processing`, `resendHandler`, `authType`, `setAuthType` | Convert referral commission to wallet balance OTP | ✅ No mismatch |
| 13 | `src\Components\PendingNew\PaymentFlow.jsx` | 16 | 198–207 | `callback`, `setter`, `setterValue`, `hideOtp`, `processing`, `authType`, `setAuthType`, `resendHandler` | Accept pending payment request (in-flow wizard) OTP | ✅ No mismatch |
| 14 | `src\Components\PendingNew\AcceptModal.jsx` | 16 | 186–194 | `callback`, `setter`, `setterValue`, `hideOtp`, `processing`, `authType`, `setAuthType` | Accept pending payment request (standalone modal) OTP | ⚠️ MISSING CRITICAL PROP: `resendHandler` is not passed — resend OTP is likely broken/no-op in this modal (falls back to the component's default no-op). |
| 15 | `src\Components\MyMasterCard\PaymentModal\PaymentModal.jsx` | 14 | 638–647 | `callback`, `setterValue`, `hideOtp`, `processing`, `resendHandler`, `authType`, `setAuthType`, `showAuthToggle` | MasterCard virtual card purchase payment OTP | ⚠️ MISSING CRITICAL PROP: `setter` is not passed — the success effect (`setter(setterValue)`) will throw since `setter` is `undefined` and gets called as a function. |
| 16 | `src\Components\MyMasterCard\MissingInfoModal.jsx` | 5 | 177–190 | `type`, `callback`, `setter`, `setterValue`, `hideOtp`, `processing`, `resendHandler`, `authType`, `setAuthType`, `showAuthToggle`, `hideTfaSwitch`, `inBasic` | Collect missing email/phone before MasterCard purchase, OTP verify | ✅ No mismatch (all 12 props recognized) |
| 17 | `src\Components\MyMasterCard\AddFundsModal\index.jsx` | 20 | 654–663 | `callback`, `setterValue`, `hideOtp`, `processing`, `resendHandler`, `authType`, `setAuthType`, `showAuthToggle` | Top up MasterCard virtual card balance OTP | ⚠️ MISSING CRITICAL PROP: `setter` is not passed — same risk as #15 (call to `setter(setterValue)` on success will throw if `verified` is ever set). |

**Group 1 takeaway:** No unsupported props anywhere. Three files (#15, #17, and effectively #14) omit props (`setter`, `resendHandler`) that the `card` variant treats as load-bearing — these are worth a manual runtime check before/after swapping in the new component, since the old `UserSettingsNew/OTPConfirmation.jsx` had the exact same required-prop shape, so these gaps are pre-existing, not introduced by the migration — but they should still be fixed while touching these files.

---

## Group 2 — `PaymentsNewer\InternationalFlow\OtpConfirmation.jsx` → `variant="modal"`

Expected props for `ModalOtp`: `isOpen, toggle, callback, data, dataHandler, resendHandler, isLoading, error, resetIdempotency, numberOfFields`

| # | File | Import line | Render line(s) | Props passed | Flow | Mismatch |
|---|---|---|---|---|---|---|
| 1 | `src\Components\PendingNew\PaymentsFlow\Modal.jsx` | 10 | 611, 789 | `callback`, `data`, `dataHandler`, `isLoading`, `isOpen`, `toggle`, `resendHandler`, `error`, `resetIdempotency` (both renders identical) | Accept/pay a payment request modal | ✅ No mismatch |
| 2 | `src\Components\QuotationsNew\AcceptQuotation.jsx` | 15 | 854, 1060 | `callback`, `data`, `dataHandler`, `isLoading`, `isOpen`, `toggle`, `resendHandler`, `error`, `resetIdempotency` (both identical) | Accept a payment quotation modal | ✅ No mismatch |
| 3 | `src\Components\PaymentsNewer\WalletToWalletFlow\index.jsx` | 28 | 1453, 1713 | `callback`, `data`, `dataHandler`, `isLoading`, `isOpen`, `toggle`, `resendHandler`, `error`, `resetIdempotency` (both identical) | Wallet-to-wallet send money flow | ✅ No mismatch |
| 4 | `src\Components\PaymentsNewer\QRFlow\index.jsx` | 27 | 1068 (desktop), 1330 (mobile) | Desktop: `callback`, `data`, `dataHandler`, `isLoading`, `isOpen`, `toggle`, `resendHandler`, `resetIdempotency` (no `error`); Mobile: same + `error` | QR code payment send money flow | ✅ No unsupported prop, ⚠️ inconsistency: desktop render omits `error` while the mobile render includes it. |
| 5 | `src\Components\PaymentsNewer\NonInstapay\index.jsx` | 18 | 746 | `callback`, `data`, `dataHandler`, `resetIdempotency`, `isLoading`, `isOpen`, `toggle`, `resendHandler`, `error` | Send money to a non-InstaPay user flow | ✅ No mismatch |
| 6 | `src\Components\PaymentsNewer\AirtimeFlow\index.jsx` | 17 | 525 (single render, invoked from two call sites at lines 785 and 805 via a shared `otpConfirmJSX()` helper) | `callback`, `data`, `dataHandler`, `isLoading`, `isOpen`, `toggle`, `resendHandler`, `error`, `resetIdempotency` | Airtime top-up / eSIM purchase flow | ✅ No mismatch |
| 7 | `src\Components\OtherTransactions\PaymentFlow\index.jsx` | 15 | 774 (desktop), 958 (mobile) | Both: `callback`, `data`, `dataHandler`, `isLoading`, `isOpen`, `toggle`, `resendHandler`, `error` (no `resetIdempotency`) | Subscription payment confirmation modal (note: despite the folder name `OtherTransactions/PaymentFlow`, this is actually the subscription-payment component) | ✅ No unsupported prop, ⚠️ `resetIdempotency` is never passed in this file (no idempotency hook used here), unlike sibling flows. |
| 8 | `src\Components\MyMasterCard\CardtoWallet\index.jsx` | 18 | 425 | `data`, `isLoading`, `toggle`, `isOpen`, `dataHandler`, `resendHandler`, `callback` | Card-to-wallet fund transfer modal | ✅ No unsupported prop, ⚠️ missing both `resetIdempotency` and `error` (relies on `data.otpError` inside the `data` object instead of a top-level `error` prop). |
| 9 | `src\Components\MyMasterCard\CardtoCardModal\index.jsx` | 17 | 750 | `data`, `dataHandler`, `isLoading`, `isOpen`, `toggle`, `callback`, `resendHandler`, `error` | Card-to-card transfer confirmation modal | ✅ No unsupported prop, ⚠️ missing `resetIdempotency`. |
| 10 | `src\Components\PaymentsNewer\InternationalFlow\index.jsx` | 32 (`import OtpConfirmation from "./OtpConfirmation"` — its own sibling file) | 1643, 1902 | `callback`, `data`, `dataHandler`, `isLoading`, `isOpen`, `toggle`, `resendHandler`, `error`, `resetIdempotency` (both identical) | International money transfer (cross-border payout) flow | ✅ No mismatch |

**Group 2 takeaway:** No file passes an unsupported prop, and none of the 10 files omit any of the specifically-critical props (`isOpen`, `toggle`, `callback`, `data`, `resendHandler`). The only gaps are around `error` and `resetIdempotency`, which several files never pass because they either don't use the shared idempotency hook or surface errors through the `data` object instead — worth a quick behavioral check but not blocking.

---

## Group 3 — `VirtualIBAN\WithdrawBalanceModal\OTPConfirmation.jsx` → `variant="buttons"`

Expected props for `ButtonsOtp`: `setter, callback, setterValue, hideOtp, type, processing, resendHandler, authType, setAuthType, hideTfaSwitch, showAuthToggle, inBasic, onCancel, numberOfFields`

| # | File | Import line | Render line(s) | Props passed | Flow | Mismatch |
|---|---|---|---|---|---|---|
| 1 | `src\Components\VirtualIBAN\WithdrawBalanceModal\index.jsx` | 20 | 222–232 | `setter`, `setterValue`, `hideOtp`, `callback`, `resendHandler`, `authType`, `setAuthType`, `onCancel` | Withdraw balance modal — OTP step of a multi-step withdrawal wizard (`STEPS.OTP`) | ✅ No mismatch — all 8 passed props are recognized by `variant="buttons"`, and all commonly-critical props (`callback`, `resendHandler`, `setter`, `setterValue`) are present. Optional props (`type`, `processing`, `hideTfaSwitch`, `showAuthToggle`, `inBasic`, `numberOfFields`) are simply left at their defaults, which is fine. |

**Group 3 takeaway:** This is the only Group 3 usage site (the old component itself is imported only here). It is a clean 1:1 match with the new `buttons` variant's supported prop list.

---

## Footnote — Already-migrated reference examples

Two files already import the **new** unified component directly (`src\Common\Component\OtpVerification`), with their old imports left in place but commented out. Neither passes a `variant` prop, so both implicitly use the default variant, which is `"card"` (see `index.jsx` line 577: `const { variant = 'card' } = props`).

### `src\Components\AddFunds\WalletFundsFlow\PlaidBankTransfer.jsx`
- Line 21 (commented out): `// import OTPConfirmation from "../../UserSettingsNew/OTPConfirmation";`
- Line 22 (active): `import OTPConfirmation from "../../../Common/Component/OtpVerification";`
- Render (lines 501–510):
  ```
  <OTPConfirmation
    callback={initiateCallback}
    setter={setShowOtp}
    setterValue={false}
    hideOtp={() => setShowOtp(false)}
    processing={isSendingOtp || isInitiatingPlaid}
    resendHandler={sendOtpHandler}
    authType={codeType}
    setAuthType={setCodeType}
  />
  ```
- Flow: Plaid bank transfer OTP confirmation (add funds / wallet-to-wallet / verification payment)
- All 8 props passed are within the `card`-variant expected list; `type` is omitted but is optional (defaults to `''`) in the new component. This is a clean, minimal migration example.

### `src\Components\MyMasterCard\CardPurchased.jsx`
- Line 20 (commented out): `// import OTPConfirmation from "../../UserSettingsNew/OTPConfirmation"`
- Line 21 (active): `import OTPConfirmation from "../../Common/Component/OtpVerification"`
- Render (line 1095):
  ```
  <OTPConfirmation
    type={userDetails?.account_type === "individual" ? "email" : "phone"}
    callback={verifyOTP}
    setterValue={true}
    hideOtp={() => setShowOtp(false)}
    processing={isSaving}
    resendHandler={sendOtp}
    authType={codeType}
    setAuthType={setCodeType}
    showAuthToggle={false}
    hideTfaSwitch={true}
    otpTypeOnProfile={otpType}
  />
  ```
- Flow: MasterCard card-details "add missing email" OTP verification (inline in `CardPurchased`)
- ⚠️ `otpTypeOnProfile` is passed but is **not** in the `card` variant's prop list (`setter, callback, setterValue, hideOtp, type, processing, resendHandler, authType, setAuthType, hideTfaSwitch, showAuthToggle, inBasic, fullHeight, showBackButton, onBack, numberOfFields`) — it is silently ignored by the component (dead prop, safe to drop).
- ⚠️ `setter` is also **not** passed here. In `CardOtp`, the verified-state effect calls `setter(setterValue)` — but that only fires if `callback` (here `verifyOTP`) invokes the `setVerified` function it receives as its first argument. `verifyOTP` (defined at lines 347–374) names that first parameter `setter` locally but never calls it — it performs its side effects (`setUserDetails`, `setShowEmailModal(false)`, `updateCardEmail()`) directly instead. So the missing `setter` prop causes no crash (the effect simply never triggers), but this bypasses the "verified" success UI/state entirely. This exact behavior already existed in the pre-migration `UserSettingsNew/OTPConfirmation.jsx` usage, so it is not a regression introduced by the migration — but it is a good example of a call site to clean up (either drop `otpTypeOnProfile` or have `verifyOTP` call the `setVerified` argument and pass a real `setter`).

**Migration precedent:** `PlaidBankTransfer.jsx` is the cleaner example to model new migrations on — it passes only recognized props and doesn't rely on the default variant implicitly in a confusing way. `CardPurchased.jsx` illustrates two small but real cleanup opportunities (drop the dead `otpTypeOnProfile` prop, and either pass `setter` or leave the "verified" success state genuinely unused on purpose).
