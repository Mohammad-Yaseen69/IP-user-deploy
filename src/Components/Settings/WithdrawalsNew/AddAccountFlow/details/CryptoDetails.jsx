import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FieldRow,
  Fields,
  SelectField,
  TextField,
} from "../../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components";
import { CRYPTO_NETWORKS } from "../../withdrawalPayload";

const CryptoDetails = ({ channel, setChannel, takenAddresses, onValidChange }) => {
  const { t } = useTranslation();
  const network =
    CRYPTO_NETWORKS.find((item) => item.value === channel.network) ?? CRYPTO_NETWORKS[0];
  const address = String(channel.wallet_address ?? "").trim();

  const error = useMemo(() => {
    if (!address) return "";
    if (!network.validate(address)) return t(network.hint);
    if (takenAddresses.includes(address.toLowerCase()))
      return t("This crypto receiving account already exists.");
    return "";
  }, [address, network, takenAddresses, t]);

  const valid = !!address && !error;
  useEffect(() => {
    onValidChange(valid);
  }, [valid, onValidChange]);

  return (
    <Fields>
      <FieldRow>
        <SelectField
          id="wd-crypto-asset"
          label={t("Asset")}
          value="USDT"
          options={[{ value: "USDT", label: "USDT" }]}
          disabled
          flex
        />
        <SelectField
          id="wd-crypto-network"
          label={t("Network")}
          value={channel.network}
          options={CRYPTO_NETWORKS.map((item) => ({
            value: item.value,
            label: item.value,
          }))}
          onChange={(value) =>
            setChannel((prev) => ({
              ...prev,
              network: value || CRYPTO_NETWORKS[0].value,
            }))
          }
          flex
        />
      </FieldRow>

      <TextField
        id="wd-crypto-address"
        label={t("Wallet address")}
        value={channel.wallet_address ?? ""}
        placeholder={network.value.startsWith("TRC") ? "T..." : "0x..."}
        onChange={(value) => setChannel((prev) => ({ ...prev, wallet_address: value.trim() }))}
        error={error}
        hint={t("Only USDT on {{network}}. Sending on another network loses the funds.", {
          network: network.value,
        })}
      />
    </Fields>
  );
};

export default CryptoDetails;
