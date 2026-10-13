import axios from "axios";
import { useContext, useState } from "react";
import { Check } from "react-feather";
import { useTranslation } from "react-i18next";
import { BsThreeDots } from "react-icons/bs";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";

const BeneficiaryCard = ({
  user,
  isBulk,
  setBeneficiary,
  selectedUser,
  payoutChannel,
  type,
  subService,
}) => {
  const { t } = useTranslation();
  const { authHeader } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const addBenHandler = (data) => {
    if (isBulk) {
      const isAlreadyIn = selectedUser.filter((u) => u._id === data._id);

      if (isAlreadyIn.length > 0) {
        const updated = selectedUser.filter((u) => u._id !== data._id);
        setBeneficiary(updated);
      } else {
        setBeneficiary((prev) => [...prev, data]);
      }
    } else {
      setBeneficiary((_) => [data]);
    }

    window.scrollTo({ top: window.innerHeight * 2 });
  };

  return (
    <div
      key={user?.id}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
        borderRadius: "12px",
        padding: ".5rem",
        cursor: "pointer",
        flex: 1,
        maxHeight: "72px",
        opacity: loading ? ".7" : 1,
      }}
      onClick={() => {
        if (loading) return;
        setBeneficiary([]);
        if (type === "Requesting" || type === "Quoting") {
          setLoading(true);
          axios
            .get(
              `${import.meta.env.VITE_IP_DEV_API}/api/instagram/search-account/${user?.phone}`,
              {
                headers: authHeader,
              },
            )
            .then((res) => {
              addBenHandler(res.data.accountDetails);
            })
            .catch((err) => {
              // console.log(err)
              axios
                .get(
                  `${import.meta.env.VITE_IP_DEV_API}/api/instagram/search-account/${user.email}`,
                  {
                    headers: authHeader,
                  },
                )
                .then((res) => {
                  addBenHandler(res.data.accountDetails);
                })
                .catch((err) => {
                  // console.log(err)
                  toast.error(
                    "Something went wrong while getting user details!",
                  );
                });
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          addBenHandler(user);
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
        <div
          style={{
            width: "35px",
            height: "35px",
            borderRadius: "12px",
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
            color: "white",
            fontSize: "1rem",
            fontWeight: 800,
          }}
        >
          {user?.beneficiary_type === "individual"
            ? user?.first_name[0]?.toUpperCase()
            : user?.company_name
              ? user?.company_name[0]?.toUpperCase()
              : ""}
        </div>
        <div>
          <div style={{ display: "flex", gap: ".3rem", alignItems: "center" }}>
            <h5 className="mb-0" style={{ fontSize: ".9rem" }}>
              {user?.first_name} {user?.last_name}
            </h5>
          </div>
          <span
            style={{
              fontSize: ".7rem",
              display: "block",
              maxWidth: "40ch",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginBottom: "-5px",
            }}
          >
            {payoutChannel === "bank" &&
              `Bank: ${user?.bank_details?.[0]?.name}`}
            {payoutChannel === "mobile" &&
              `Provider: ${subService?.find((item) => item?.id == user?.mobile_wallet?.[0]?.money_provider)?.name ?? "N/A"}`}
          </span>
          <span style={{ fontSize: ".7rem" }}>
            {payoutChannel === "bank" &&
              `IBAN: ${user?.bank_details?.[0]?.iban}`}
            {payoutChannel === "mobile" &&
              `NUMBER: ${user?.mobile_wallet?.[0]?.wallet_account_number}`}
          </span>
        </div>
      </div>
      {(
        type === "Requesting" || type === "Quoting"
          ? selectedUser?.some(
              (it) => it?.email === user?.email || it?.phone === user?.phone,
            )
          : selectedUser.some((it) => it?._id === user?._id)
      ) ? (
        <Check style={{ fontWeight: "900" }} color="green" />
      ) : (
        <BsThreeDots />
      )}
    </div>
  );
};

export default BeneficiaryCard;
