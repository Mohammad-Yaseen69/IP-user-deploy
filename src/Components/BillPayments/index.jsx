import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import useWindowWidth from "../../utils/useWindowWidth";
import TopRight from "../topRight";
import { isWalletBlocked } from "../VirtualIBAN/CryptoWallet/instapay/wallets";
import styles from "./billPayments.module.scss";
import PaySomethingNew from "./components/PaySomethingNew";
import { AutopayCard, RecentCard, UnpaidCard, YourBillsCard } from "./components/BillCards";
import WalletCard from "./components/WalletCard";
import { useBillCountryOptions } from "./hooks/useBillCountryOptions";
import { useSavedBills } from "./hooks/useBillPaymentQueries";
import PayBillDrawer from "./PayBillDrawer";

const WALLET_KEY = "bill-payments-wallet";

const readBillWallet = () => {
  try {
    return localStorage.getItem(WALLET_KEY);
  } catch {
    return null;
  }
};

const saveBillWallet = (id) => {
  try {
    localStorage.setItem(WALLET_KEY, id);
  } catch {
    // remembering the wallet is a convenience only
  }
};

const BillPayments = () => {
  const { t } = useTranslation();
  const width = useWindowWidth();
  const { userWallets } = useContext(UserContext);
  const { countries, homeCountry } = useBillCountryOptions();
  const { data: bills = [], isLoading: isLoadingBills } = useSavedBills();

  const wallets = useMemo(
    () =>
      (userWallets || []).filter((item) => item?.wallet_type === "insta" && !isWalletBlocked(item)),
    [userWallets],
  );
  const [walletId, setWalletId] = useState(readBillWallet);
  const selectWallet = (id) => {
    setWalletId(id);
    saveBillWallet(id);
  };
  const wallet =
    wallets.find((item) => item._id === walletId) ||
    wallets.find((item) => item.default) ||
    wallets[0];

  // null = closed; otherwise { biller } or { savedBill } to start on, or { mode: "add" } to save a bill
  const [drawer, setDrawer] = useState(null);
  const payBill = () => setDrawer({});
  const addBill = () => setDrawer({ mode: "add" });

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>{t("Pay Bills")}</h1>
          <p className={styles.sub}>
            {t("Electricity, water, internet and government bills, paid from your wallet.")}
          </p>
        </div>
        {width > 1000 && <TopRight position="relative" />}
      </div>

      <div className={styles.grid}>
        <div className={styles.column}>
          <UnpaidCard bills={bills} onPayBill={payBill} onAddBill={addBill} />
          <YourBillsCard
            bills={bills}
            isLoading={isLoadingBills}
            onPayBill={(savedBill) => setDrawer({ savedBill })}
            onAddBill={addBill}
          />
        </div>
        <div className={styles.column}>
          <WalletCard
            wallets={wallets}
            wallet={wallet}
            onSelectWallet={selectWallet}
            bills={bills}
          />
          <AutopayCard />
          <PaySomethingNew
            country={
              homeCountry ||
              countries.find((item) => item.alpha3 === bills[0]?.country?.iso_code) ||
              null
            }
            onPickBiller={(biller) => setDrawer({ biller })}
            onChooseCountry={payBill}
          />
          <RecentCard />
        </div>
      </div>

      {drawer && (
        <PayBillDrawer
          onClose={() => setDrawer(null)}
          countries={countries}
          wallets={wallets}
          mode={drawer.mode}
          savedBill={drawer.savedBill}
          initialCountry={
            countries.find((item) => item.alpha3 === drawer.savedBill?.country?.iso_code) ||
            homeCountry
          }
          initialBiller={drawer.biller}
          initialWallet={wallet}
        />
      )}
    </div>
  );
};

export default BillPayments;
