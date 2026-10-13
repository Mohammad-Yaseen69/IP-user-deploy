import { useContext, useMemo } from "react";
import { Field, TextArea, TextInput, Select, Toggle } from "../UI/FormElements";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../../Helper/AmountFormat";
import { UserContext } from "../../../Context/UserContext";
import CountryDropDown from "../../AddBeneficiary/CountryDropDown";
import { preventEdgeSpaces } from "../../../hooks/useTrimInput";

const Form = ({ data, inputFieldChange, dataHandler, directCard = false }) => {
  const { t } = useTranslation();
  const { userWallets } = useContext(UserContext);

  const walletOptions = useMemo(() => {
    return (userWallets || [])
      .filter((w2) => w2?.wallet_type === "insta")
      .map((w) => ({
        value: w?._id,
        label: `${w?.currency?.code ?? ""} Wallet`,
      }));
  }, [userWallets]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label={t("Title")} required={!data.title}>
        <div style={{ width: "100%" }}>
          <TextInput
            value={data.title}
            onChange={inputFieldChange("title")}
            onKeyDown={preventEdgeSpaces}
            placeholder={t("Enter title")}
            maxLength={100}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {data?.title?.length ?? 0}/100
            </span>
          </div>
        </div>
      </Field>
      <Field label={t("Description")} required={!data.description}>
        <div style={{ width: "100%" }}>
          <TextArea
            onKeyDown={preventEdgeSpaces}
            value={data.description}
            onChange={inputFieldChange("description")}
            placeholder={t("Enter description")}
            rows={5}
            maxLength={500}
          />

          {/* Character Info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {t("You can type up to 500 characters")}
            </span>

            <span
              style={{
                fontSize: 12,
                color: data?.description?.length === 500 ? "red" : "#6b7280",
              }}
            >
              {data?.description?.length ?? 0} / 500
            </span>
          </div>
        </div>
      </Field>
      <Field
        label={t("Amount")}
        required={!data.amount || Number(data.amount.replaceAll(",", "")) === 0}
      >
        <TextInput
          value={data.amount}

          onChange={(e) => {
            const format = formatCurrency(e.target.value, false);
            dataHandler("amount", format);
          }}
          onBlur={(e) => {
            const format = formatCurrency(e.target.value, true);
            dataHandler("amount", format);
          }}
          placeholder={t("0.00")}
        />
      </Field>
      <Field label={t("Receiving Wallet")} required={!data.wallet}>
        <Select
          value={data.wallet}
          onChange={inputFieldChange("wallet")}
          options={walletOptions}
          placeholder={t("Select wallet")}
        />
      </Field>

      <Field
        toggle={true}
        label={t("Allow multiple payments for this invoice")}
      >
        <Toggle
          checked={data.allowMultiple}
          onChange={() => dataHandler("allowMultiple", !data.allowMultiple)}
        />
      </Field>

      <Field toggle={true} label={t("Allow shipping address")}>
        <Toggle
          checked={data.allowShipping}
          onChange={() => dataHandler("allowShipping", !data.allowShipping)}
        />
      </Field>

      {!directCard && (
        <Field toggle={true} label={t("Specify country")}>
          <Toggle
            checked={data.specifyCountry}
            onChange={() => {
              const nextVal = !data.specifyCountry;
              dataHandler("specifyCountry", nextVal);
              if (!nextVal) {
                dataHandler("countryIsoCode", null);
              }
            }}
          />
        </Field>
      )}

      {(data.specifyCountry || directCard) && (
        <Field label={t("Country")} required={!data.countryIsoCode}>
          <CountryDropDown
            country={data.countryIsoCode}
            onSelect={(country) =>
              dataHandler("countryIsoCode", country.alpha3)
            }
          />
        </Field>
      )}
    </div>
  );
};

export default Form;
