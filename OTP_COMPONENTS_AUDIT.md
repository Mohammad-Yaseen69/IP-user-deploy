# OTP Confirmation Components — Dead Code Audit

Static analysis only (no app run). Branch: `feat/OtpConfirmation`.
All paths are repo-relative. "Real importer" = an uncommented `import` line in a source file.

> **Note on the starting list:** three of the files in the original list **no longer exist** (already removed, most likely by commit `09d25a92 "remove unused OTP confirmation components"`):
>
> - `src/Components/PaymentsNewer/InternationalFlow/OtpConfirmation.jsx` — gone (only its orphan stylesheet `src/Components/PaymentsNewer/InternationalFlow/styles/otpconfirmation.module.css` remains, and it is still imported by the shared component)
> - `src/Components/VirtualIBAN/WithdrawBalanceModal/OTPConfirmation.jsx` — gone
> - `src/Components/VirtualIBAN/VirtualIbanModal/OtpPlaceholderStep.jsx` — gone
>
> A case-insensitive sweep of `src/` found **no other** OTP confirmation component files. The only "OTP component defined in a differently-named file" found is the inline OTP input inside `src/Components/CreateAgentPassword/index.jsx` (self-contained, uses `styles/otp.module.css`) — it is not a shared OTP confirmation component and is out of scope.

---

## 1. Summary table

| # | File | Real importers | Default-used | Named-only | Commented imports | Verdict |
|---|------|---------------|--------------|-----------|-------------------|---------|
| 1 | `src/Common/Component/OtpVerification/index.jsx` | **31** | 31 | 0 | 0 | **KEEP** |
| 2 | `src/Components/PaymentsNewer/OTPConfirmation.jsx` | **39** | 11 | 28 | 0 | **REVIEW** |
| 3 | `src/Components/User/UserSettings/OTPConfirmation.jsx` | **6** | 6 | 0 | 0 | **REVIEW** |
| 4 | `src/Components/UserSettingsNew/OTPConfirmation.jsx` | **2** | 2 | 0 | 2 | **REVIEW** |
| 5 | `src/Components/HomeNewUpdated/Payments/OTPConfirmation.jsx` | **1** | 1 | 0 | 0 | **KEEP** |
| 6 | `src/Components/Auth/Signup/OtpConfirmation.jsx` | **1** | 1 | 0 | 0 | **KEEP** |
| 7 | `src/Components/AuthNew/OtpConfimation.jsx` *(typo filename, real file)* | **1** | 1 | 0 | 0 | **KEEP** |

**Nothing in the list is a zero-importer file.** There is no "delete without thinking" candidate; see Category C and the cleanup order for what is actually safe.

### Exports per file

| File | Default export | Named exports |
|------|----------------|---------------|
| `src/Common/Component/OtpVerification/index.jsx` | `OtpVerification` (dispatcher over internal `SignupOtp` / `CardOtp` / `ModalOtp` / `ButtonsOtp`, none of which are exported) | *(none)* |
| `src/Components/PaymentsNewer/OTPConfirmation.jsx` | `OTPConfirmation` | `possibleErrors` (L20), `LimitsErrorMessage` (L36) |
| `src/Components/User/UserSettings/OTPConfirmation.jsx` | `OTPConfirmation` | *(none)* |
| `src/Components/UserSettingsNew/OTPConfirmation.jsx` | `OTPConfirmation` | *(none)* |
| `src/Components/HomeNewUpdated/Payments/OTPConfirmation.jsx` | `OTPConfirmation` | *(none)* |
| `src/Components/Auth/Signup/OtpConfirmation.jsx` | `OtpConfirmation` | *(none)* |
| `src/Components/AuthNew/OtpConfimation.jsx` | `OtpConfimation` | *(none)* |

---

## 2. Ranking — most used to least used

By number of real (uncommented) importers:

1. **`src/Components/PaymentsNewer/OTPConfirmation.jsx` — 39 importers — MOST USED**
   *But misleading:* 28 of those 39 import **only** `LimitsErrorMessage` / `possibleErrors`. Only 11 use the OTP component itself.
2. `src/Common/Component/OtpVerification/index.jsx` — **31** importers — the most-used *OTP component* (31/31 actually render it). This is the real shared component.
3. `src/Components/User/UserSettings/OTPConfirmation.jsx` — **6**
4. `src/Components/UserSettingsNew/OTPConfirmation.jsx` — **2** (+2 commented-out)
5. `src/Components/HomeNewUpdated/Payments/OTPConfirmation.jsx` — **1**
5. `src/Components/Auth/Signup/OtpConfirmation.jsx` — **1**
5. `src/Components/AuthNew/OtpConfimation.jsx` — **1** — **LEAST USED (3-way tie at 1)**

If ranked by *OTP component actually rendered*: `OtpVerification` (31) > `PaymentsNewer/OTPConfirmation` (11) > `User/UserSettings` (6) > `UserSettingsNew` (2) > the three 1-importer files.

---

## 3. Category A — completely unused (zero importers)

**None among the surviving files.**

The only genuinely-zero-reference OTP artifacts are the three files already deleted from disk (listed in the note at the top). Nothing further to delete here.

Closest thing to dead weight, worth noting: `src/Components/PaymentsNewer/InternationalFlow/styles/otpconfirmation.module.css` is a leftover from the deleted `InternationalFlow/OtpConfirmation.jsx`, but it is **still imported** by `src/Common/Component/OtpVerification/index.jsx:14` — do **not** delete it.

---

## 4. Category B — file kept alive ONLY by its named exports

### `src/Components/PaymentsNewer/OTPConfirmation.jsx` — partially in this category

This file **must stay**: 28 files depend on its named exports. But the default `OTPConfirmation` component inside it is on life support — of its 11 default-importers, **3 are unreachable** (their render sites are commented out upstream) and the remaining 8 are all legacy desktop/mobile payment screens.

**Named exports actually in use:**

| Named export | Used by |
|---|---|
| `LimitsErrorMessage` | 26 files (see list below) |
| `possibleErrors` | 5 files: `src/Components/PaymentsNewer/AmountAndCurrency.jsx`, `src/Components/PaymentsNewer/Mobile/AmountAndCurrency.jsx`, `src/Components/PaymentsNewer/InternationalFlow/StepOne.jsx`, `src/Components/PaymentsNewer/WalletToWalletFlow/StepTwo.jsx`, `src/Components/WalletsNew/withdrawal/Amount.jsx` |

**All 28 NAMED-ONLY importers** (these do *not* use the OTP component):

| File | Line | Imports |
|---|---|---|
| `src/Components/AddFunds/ConfirmWalletFund.jsx` | 19 | `LimitsErrorMessage` |
| `src/Components/AddFunds/CryptoFund.jsx` | 24 | `LimitsErrorMessage` |
| `src/Components/HomeNewUpdated/ConversionModal.jsx` | 14 | `LimitsErrorMessage` |
| `src/Components/HomeNewUpdated/CurConversion.jsx` | 11 | `LimitsErrorMessage` |
| `src/Components/MyMasterCard/AddFundsModal/index.jsx` | 19 | `LimitsErrorMessage` |
| `src/Components/OtherTransactions/PaymentFlow/index.jsx` | 6 | `LimitsErrorMessage` |
| `src/Components/PaymentAddressPublic/PayAsGuest/index.jsx` | 21 | `LimitsErrorMessage` |
| `src/Components/PaymentsNewer/AirtimeFlow/index.jsx` | 19 | `LimitsErrorMessage` |
| `src/Components/PaymentsNewer/AmountAndCurrency.jsx` | 15 | `LimitsErrorMessage`, `possibleErrors` |
| `src/Components/PaymentsNewer/InternationalFlow/index.jsx` | 26 | `LimitsErrorMessage` |
| `src/Components/PaymentsNewer/InternationalFlow/StepOne.jsx` | 21 | `possibleErrors` |
| `src/Components/PaymentsNewer/Mobile/AmountAndCurrency.jsx` | 15 | `LimitsErrorMessage`, `possibleErrors` |
| `src/Components/PaymentsNewer/NonInstapay/index.jsx` | 29 | `LimitsErrorMessage` |
| `src/Components/PaymentsNewer/QRFlow/index.jsx` | 19 | `LimitsErrorMessage` |
| `src/Components/PaymentsNewer/WalletToWalletFlow/index.jsx` | 35 | `LimitsErrorMessage` |
| `src/Components/PaymentsNewer/WalletToWalletFlow/StepTwo.jsx` | 10 | `possibleErrors` |
| `src/Components/PendingNew/AcceptModal.jsx` | 15 | `LimitsErrorMessage` |
| `src/Components/PendingNew/PaymentFlow.jsx` | 14 | `LimitsErrorMessage` |
| `src/Components/PendingNew/PaymentsFlow/index.jsx` | 15 | `LimitsErrorMessage` |
| `src/Components/PendingNew/PaymentsFlow/Modal.jsx` | 20 | `LimitsErrorMessage` |
| `src/Components/QrQuickerPay/index.jsx` | 10 | `LimitsErrorMessage` |
| `src/Components/QuotationsNew/AcceptQuotation.jsx` | 6 | `LimitsErrorMessage` |
| `src/Components/ReceiptInvoices/InvoicePayment/DirectCardInvoicePayment.jsx` | 19 | `LimitsErrorMessage` |
| `src/Components/ReceiptInvoices/InvoicePaymentQr/index.jsx` | 10 | `LimitsErrorMessage` |
| `src/Components/ReferralsNew/CommissionConversion.jsx` | 16 | `LimitsErrorMessage` |
| `src/Components/WalletsNew/withdrawal/Amount.jsx` | 10 | `LimitsErrorMessage`, `possibleErrors` |
| `src/hooks/Payments/useFXNew.jsx` | 4 | `LimitsErrorMessage` |
| `src/utils/Functions/handlePaymentApiError.js` | 2 | `LimitsErrorMessage` |

> **Recommendation:** move `possibleErrors` + `LimitsErrorMessage` into a small shared module (e.g. `src/utils/Functions/paymentLimits.js`). Once the 8 remaining live default-consumers are migrated to `Common/Component/OtpVerification`, the 859-line `OTPConfirmation.jsx` can be deleted entirely.

---

## 5. Category C — imported but not used (dead imports)

### C.1 Commented-out import lines (COMMENTED)

| File | Line | Line content |
|---|---|---|
| `src/Components/AddFunds/WalletFundsFlow/PlaidBankTransfer.jsx` | 21 | `// import OTPConfirmation from "../../UserSettingsNew/OTPConfirmation";` |
| `src/Components/MyMasterCard/CardPurchased.jsx` | 20 | `// import OTPConfirmation from "../UserSettingsNew/OTPConfirmation"` |

Both files import the **live** shared component on the very next line (`:22` and `:21` respectively, from `Common/Component/OtpVerification`). The commented lines are migration leftovers — delete them, zero risk.

### C.2 Dead *component* imports (import present, render site commented out upstream)

`src/Components/PaymentsNewer/SendPaymentType.jsx` imports three legacy screens whose JSX is commented out:

| File | Line | Dead import | Commented render site |
|---|---|---|---|
| `src/Components/PaymentsNewer/SendPaymentType.jsx` | 2 | `InternationalTransfer` | L49 `// <InternationalTransfer ... />` |
| `src/Components/PaymentsNewer/SendPaymentType.jsx` | 3 | `WalletTransfer` | L61 `// <WalletTransfer ... />` |
| `src/Components/PaymentsNewer/SendPaymentType.jsx` | 7 | `QrPayment` | L72 `// <QrPayment ... />` |

Consequence: `src/Components/PaymentsNewer/InternationalTransfer.jsx`, `src/Components/PaymentsNewer/WalletTransfer.jsx` and `src/Components/PaymentsNewer/QrPayment.jsx` are **unreachable**, so their `import OTPConfirmation from "./OTPConfirmation"` (lines 30, 22, 13 respectively) are effectively dead too. They have been replaced by `InternationFlow` / `WalletToWalletFlow` / `QRFlow`, which all use the new shared component.

### C.3 Commented-out usage with no import

| File | Line | Note |
|---|---|---|
| `src/Components/guestDashboard/auth/AuthStepTwo.jsx` | 71–80 | `{/* <OtpConfirmation ... /> */}` — **confirmed**. There is **no** `OtpConfirmation` import in the file at all (imports are only `react-feather`, a stylesheet, `react-hook-form`, an image). The file hand-rolls a 6-box OTP input instead. The commented block is pure dead text; removing it changes nothing. |

**No importer of any surviving OTP file falls into strict "DEFAULT-DEAD"** — every uncommented default import is paired with at least one uncommented render site in the same file. The deadness lives one level up (C.2).

---

## 6. Category D — genuinely in use (with route chains)

### D.1 `src/Common/Component/OtpVerification/index.jsx` — 31 importers, all DEFAULT-USED

Verified: every one of the 31 files has at least one uncommented `<OTPConfirmation…>` / `<OtpConfirmation…>` render site (0 commented render sites found).

| Importer | Line | Renders | Route chain |
|---|---|---|---|
| `src/Components/Settings/AccountItem.jsx` | 11 | 2 | `/settings` → `Components/Settings` → `Settings/Accounts.jsx:3` → `AccountItem.jsx` |
| `src/Components/Settings/Basic.jsx` | 19 | 1 | `/settings` → `Components/Settings` |
| `src/Components/Settings/Password.jsx` | 11 | 1 | `/settings` |
| `src/Components/Settings/SecurityQuestion.jsx` | 9 | 1 | `/settings` |
| `src/Components/Settings/TwoFactorAuth.jsx` | 16 | 1 | `/settings` |
| `src/Components/Settings/VerificationPayment.jsx` | 12 | 1 | `/settings` |
| `src/Components/PaymentsNewer/InternationalFlow/index.jsx` | 32 | 2 | `/payments` → `PaymentsNewer/index.jsx` → `SendPaymentType.jsx:8` → `InternationFlow` |
| `src/Components/PaymentsNewer/WalletToWalletFlow/index.jsx` | 28 | 2 | `/payments` → `SendPaymentType.jsx:9` → `WalletToWalletFlow` |
| `src/Components/PaymentsNewer/QRFlow/index.jsx` | 27 | 2 | `/payments` → `SendPaymentType.jsx:10` → `QRFlow` |
| `src/Components/PaymentsNewer/NonInstapay/index.jsx` | 18 | 1 | `/payments` → `SendPaymentType.jsx:11` / `PaymentsNewer/index.jsx` (`NonInstapayPayment`) |
| `src/Components/PaymentsNewer/AirtimeFlow/index.jsx` | 17 | 1 | `/payments` → `PaymentsNewer/index.jsx:21` (`Airtime`) |
| `src/Components/OtherTransactions/PaymentFlow/index.jsx` | 15 | 2 | `OtherTransactions` route |
| `src/Components/PendingNew/AcceptModal.jsx` | 16 | 1 | `PendingNew` route |
| `src/Components/PendingNew/PaymentFlow.jsx` | 12 | 1 | `PendingNew` route |
| `src/Components/PendingNew/PaymentsFlow/Modal.jsx` | 10 | 2 | `PendingNew` route |
| `src/Components/QuotationsNew/AcceptQuotation.jsx` | 15 | 2 | `QuotationsNew` route |
| `src/Components/ReferralsNew/CommissionConversion.jsx` | 13 | 1 | `ReferralsNew` route |
| `src/Components/ReferralsNew/CommissionWithdraw.jsx` | 11 | 1 | `ReferralsNew/index.jsx:19` |
| `src/Components/AddFunds/WalletFundsFlow/PlaidBankTransfer.jsx` | 22 | 1 | AddFunds flow |
| `src/Components/MyMasterCard/AddFundsModal/index.jsx` | 20 | 1 | MyMasterCard route |
| `src/Components/MyMasterCard/CardPurchased.jsx` | 21 | 1 | MyMasterCard route |
| `src/Components/MyMasterCard/CardtoCardModal/index.jsx` | 17 | 1 | MyMasterCard route |
| `src/Components/MyMasterCard/CardtoWallet/index.jsx` | 18 | 1 | MyMasterCard route |
| `src/Components/MyMasterCard/MissingInfoModal.jsx` | 5 | 1 | MyMasterCard route |
| `src/Components/MyMasterCard/PaymentModal/PaymentModal.jsx` | 14 | 1 | MyMasterCard route |
| `src/Components/UpdatePin/index.jsx` | 11 | 2 | UpdatePin route |
| `src/Components/VirtualIBAN/OnBoardingIBAN/index.jsx` | 26 | 1 | VirtualIBAN route |
| `src/Components/VirtualIBAN/SendMoney/SepaTransfer/index.jsx` | 40 | 1 | VirtualIBAN route |
| `src/Components/VirtualIBAN/SendMoney/SwiftTransfer/index.jsx` | 57 | 1 | VirtualIBAN route |
| `src/Components/VirtualIBAN/VirtualIbanModal/index.jsx` | 60 | 1 | VirtualIBAN route |
| `src/Components/VirtualIBAN/WithdrawBalanceModal/index.jsx` | 20 | 1 | VirtualIBAN route |

**Reachable: YES**, through many chains. This is the canonical component.

### D.2 `src/Components/PaymentsNewer/OTPConfirmation.jsx` (default export) — 11 default importers, 8 reachable

| Importer | Line | Reachable? | Route chain |
|---|---|---|---|
| `src/Components/PaymentsNewer/RequestMoney.jsx` | 25 | YES | `/payments` → `PaymentsNewer/index.jsx:250` `<RequestMoney/>` |
| `src/Components/PaymentsNewer/SendQuotation.jsx` | 16 | YES | `/payments` → `PaymentsNewer/index.jsx:255` `<SendQuotation/>` |
| `src/Components/PaymentsNewer/CryptoFiat.jsx` | 27 | YES | `/payments` → `PaymentsNewer/index.jsx:265` `<CryptoFiat/>` |
| `src/Components/PaymentsNewer/Mobile/RequestMoney.jsx` | 15 | YES | `/payments` (mobile) → `PaymentsNewer/index.jsx:512` `<RequestMoneyMobile/>` |
| `src/Components/PaymentsNewer/Mobile/SendQuote.jsx` | 11 | YES | `/payments` (mobile) → `PaymentsNewer/index.jsx:518` `<SendQuote/>` |
| `src/Components/PaymentsNewer/Mobile/CryptoFiatMobile.jsx` | 11 | YES | `/payments` (mobile) → `PaymentsNewer/index.jsx:524` `<CryptoFiatMobile/>` |
| `src/Components/PaymentsNewer/Mobile/Airtime.jsx` | 11 | YES | `/payments` (mobile) → `PaymentsNewer/index.jsx:530` `<AirtimeMobile/>` |
| `src/Components/WalletsNew/Withdraw.jsx` | 12 | YES | Wallets route → `WalletsNew/Top.jsx:18` import, `:537` `<Withdraw/>` |
| `src/Components/PaymentsNewer/InternationalTransfer.jsx` | 30 | **NO** | only `SendPaymentType.jsx:2`; render commented at L49 |
| `src/Components/PaymentsNewer/WalletTransfer.jsx` | 22 | **NO** | only `SendPaymentType.jsx:3`; render commented at L61 |
| `src/Components/PaymentsNewer/QrPayment.jsx` | 13 | **NO** | only `SendPaymentType.jsx:7`; render commented at L72 |

Plus the 28 named-only importers from Category B — all reachable.

### D.3 `src/Components/User/UserSettings/OTPConfirmation.jsx` — 6 importers, all DEFAULT-USED

| Importer | Line | Renders at | Route chain |
|---|---|---|---|
| `src/Components/User/UserSettings/AccountItem.jsx` | 9 | 143, 159 | `/users/settings` → `Components/UserSettings/index.jsx:4` → `UserSettings/Settings.jsx:11` → `User/UserSettings/Accounts.jsx:5` → `AccountItem.jsx` |
| `src/Components/User/UserSettings/SecurityQuestions.jsx` | 10 | 165 | `/users/settings` → `UserSettings/Settings.jsx:9` |
| `src/Components/UserSettings/AddNominee.jsx` | 6 | 158 | `/users/settings` → `UserSettings/Settings.jsx:25` → `UserSettings/Nominee.jsx:6` |
| `src/Components/UserSettings/NomineeDetails.jsx` | 6 | 235, 241 | `/users/settings` → `UserSettings/Nominee.jsx:7` |
| `src/Components/UserSettingsNew/AddNominee.jsx` | 6 | 158 | `/users/settings-new` → `UserSettingsNew/index.jsx:10` → `UserSettingsNew/Nominee.jsx:5` |
| `src/Components/UserSettingsNew/NomineeDetails.jsx` | 6 | 234, 240 | `/users/settings-new` → `UserSettingsNew/Nominee.jsx:6` |

**Reachable: YES** — but only via the two legacy routes (`src/RouteNew/Routes.jsx:159` and `:160`). Note the cross-folder dependency: `UserSettingsNew/*` reaches back into `User/UserSettings/OTPConfirmation.jsx`.

### D.4 `src/Components/UserSettingsNew/OTPConfirmation.jsx` — 2 importers, both DEFAULT-USED

| Importer | Line | Renders at | Route chain |
|---|---|---|---|
| `src/Components/UserSettingsNew/AccountItem.jsx` | 9 | 140, 156 | `/users/settings-new` → `UserSettingsNew/index.jsx:12` → `UserSettingsNew/Accounts.jsx:4` → `AccountItem.jsx` |
| `src/Components/UserSettingsNew/SecurityQuestions.jsx` | 10 | 156 | `/users/settings-new` → `UserSettingsNew/index.jsx:9` |

**Reachable: YES**, only via `/users/settings-new`.

### D.5 `src/Components/HomeNewUpdated/Payments/OTPConfirmation.jsx` — 1 importer

| Importer | Line | Renders at | Route chain |
|---|---|---|---|
| `src/Components/HomeNewUpdated/BenefCard.jsx` | 5 | 207 | `/`, `/dashboard`, `/dashboard/default` → `HomeNewUpdated/index.jsx:21` → `RecentBeneficiaries.jsx:4` → `BenefCard.jsx` |

**Reachable: YES** — on the main dashboard. Do not delete.

### D.6 `src/Components/Auth/Signup/OtpConfirmation.jsx` — 1 importer

| Importer | Line | Renders at | Route chain |
|---|---|---|---|
| `src/Components/Auth/Signup.jsx` | 17 | 487, 498 | `/login`, `/signup`, `/signup/:code` → `Components/Auth/index.jsx:12` → `:115` `<Signup/>` → `Signup.jsx` |

**Reachable: YES** — live signup email/phone OTP steps.

### D.7 `src/Components/AuthNew/OtpConfimation.jsx` — 1 importer

| Importer | Line | Renders at | Route chain |
|---|---|---|---|
| `src/Components/AuthNew/LoginForm.jsx` | 11 | 300 | `/forgot-password`, `/forgot-password/agent` → `Components/AuthNew/index.jsx:5` → `:129` `<LoginForm/>` |

**Reachable: YES.** Keep despite the `OtpConfimation` typo (renaming would touch `LoginForm.jsx:11` only).

---

## 7. Anomalies / broken files

### 7.1 Renders `<OTPConfirmation>` but never imports it — runtime crash

Both suspicions **confirmed**. These are live, reachable mobile payment screens; hitting the OTP step throws `ReferenceError: OTPConfirmation is not defined`.

| File | Render line | Import present? | Reachable? |
|---|---|---|---|
| `src/Components/PaymentsNewer/Mobile/International.jsx` | **142** (branch `step === 8 && confirmed`) | **NO** — the full import list is `react-i18next`, `./styles/International.module.css`, `react`, `react-feather`, `react-router`, `../InternationalFlow`, `./files/recent.svg` | YES — `/payments` mobile → `PaymentsNewer/index.jsx:491` `<International/>` |
| `src/Components/PaymentsNewer/Mobile/QRPayment.jsx` | **154** (branch `step === 6 && confirmed`) | **NO** — imports are `react-router`, `./styles/International.module.css`, `react-i18next`, `react`, `react-feather`, `./files/Top`, `UserContext`, `../QRFlow` | YES — `/payments` mobile → `PaymentsNewer/index.jsx:501` `<QRPayment/>` |

Both files also reference further undeclared identifiers in the same JSX (`beneficiary`, `createdTransaction`, `setTransactionDetails`, `quotationDetails`, `payoutChannel`, `sendType`, `token`, …). In practice both files now delegate to `InternationFlow` / `QRFlow`, and this trailing block is un-removed legacy JSX. **It should be deleted, not "fixed" by adding an import.**

### 7.2 Commented-out OTP imports

- `src/Components/AddFunds/WalletFundsFlow/PlaidBankTransfer.jsx:21` — confirmed.
- `src/Components/MyMasterCard/CardPurchased.jsx:20` — confirmed.

Both superseded by the shared component imported on the following line.

### 7.3 `src/Components/guestDashboard/auth/AuthStepTwo.jsx`

Confirmed: commented-out `<OtpConfirmation .../>` at lines 71–80, **no import at all**, and all props are string literals (`data={"internationalData"}`, `isLoading={"loading"}`) — it was never wired up. Pure dead text.

### 7.4 Orphan-looking stylesheet that is NOT an orphan

`src/Components/PaymentsNewer/InternationalFlow/styles/otpconfirmation.module.css` outlived its deleted component but is imported by `src/Common/Component/OtpVerification/index.jsx:14`. **Keep.**

---

## 8. Recommended cleanup order

### Tier 1 — zero risk, delete now (no behavioural change)

1. `src/Components/AddFunds/WalletFundsFlow/PlaidBankTransfer.jsx:21` — remove commented import.
2. `src/Components/MyMasterCard/CardPurchased.jsx:20` — remove commented import.
3. `src/Components/guestDashboard/auth/AuthStepTwo.jsx:71–80` — remove commented `<OtpConfirmation>` block.
4. `src/Components/PaymentsNewer/Mobile/International.jsx` — remove the broken `step === 8 && confirmed` block starting at L142 (it can only crash).
5. `src/Components/PaymentsNewer/Mobile/QRPayment.jsx` — remove the broken `step === 6 && confirmed` block starting at L154.

> Items 4–5 are bug fixes as much as cleanup. Confirm with the product owner that the mobile International/QR OTP step is genuinely handled inside `InternationFlow` / `QRFlow` before removing.

### Tier 2 — low risk, small decision (retire the commented-out legacy Send flows)

6. Delete `src/Components/PaymentsNewer/InternationalTransfer.jsx`, `src/Components/PaymentsNewer/WalletTransfer.jsx`, `src/Components/PaymentsNewer/QrPayment.jsx`, plus their dead imports in `src/Components/PaymentsNewer/SendPaymentType.jsx` (L2, L3, L7) and the commented JSX at L49 / L61 / L72.
   - *Decision needed:* confirm nobody plans to re-enable those commented render sites.
   - *Payoff:* removes 3 of the 11 default-consumers of `src/Components/PaymentsNewer/OTPConfirmation.jsx`.

### Tier 3 — needs a product decision, biggest payoff

7. **Retire the legacy settings routes** `/users/settings` (`src/RouteNew/Routes.jsx:159`) and `/users/settings-new` (`:160`), now that `/settings` → `src/Components/Settings` is the live page and already uses the shared `OtpVerification`.
   Freed for deletion:
   - `src/Components/UserSettingsNew/OTPConfirmation.jsx` (drops to **0** importers)
   - `src/Components/User/UserSettings/OTPConfirmation.jsx` (drops to **0** importers)
   - plus the whole `src/Components/UserSettings/`, `src/Components/UserSettingsNew/` and `src/Components/User/UserSettings/` trees — **except** `SuccessModal` and `GradientButton`, which `src/Components/Settings/AddNominee.jsx:17` and `src/Components/Settings/NomineeDetails.jsx:11` still import from `../User/UserSettings/`. **Move those two helpers into `src/Components/Settings/` first.**

8. **Migrate the 8 live consumers** of `src/Components/PaymentsNewer/OTPConfirmation.jsx` (the YES rows in D.2) to `src/Common/Component/OtpVerification`, and extract `possibleErrors` + `LimitsErrorMessage` into a standalone module. Only then can the 859-line `OTPConfirmation.jsx` be deleted — it is currently the largest remaining duplicate.

9. **Optional, last:** migrate `src/Components/HomeNewUpdated/Payments/OTPConfirmation.jsx` (1 consumer, `BenefCard.jsx`), `src/Components/Auth/Signup/OtpConfirmation.jsx` (1 consumer — note `OtpVerification` already ships an equivalent `SignupOtp` variant at `index.jsx:51`, dispatched at `:652`), and `src/Components/AuthNew/OtpConfimation.jsx` (1 consumer). Each is a one-file swap, but each sits on a live, high-traffic path (dashboard, signup, forgot-password) and needs manual QA. **Do not delete any of these three today.**

### Do NOT touch

- `src/Common/Component/OtpVerification/index.jsx` — the canonical component (31 live consumers).
- `src/Components/PaymentsNewer/InternationalFlow/styles/otpconfirmation.module.css` — still imported by the canonical component.
