import React, { useState } from "react";
import { Badge, Button } from "reactstrap";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

const SearchedUserCard = ({ user, userDetails, setPartners, setSearchInFocus, authHeader }) => {
  // add states
  const [adding, setAdding] = useState(false);

  const addPartnerHandler = async (payload) => {
    setAdding(true);
    try {
      const encrypted = encryptData(payload);
      const response = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/company/add-partner`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      );
      const data = await decryptData(response.data.data);
      setSearchInFocus(false);
      setAdding(false);
      setPartners((prev) => [data.partner, ...prev]);
      // console.log(data)
    } catch (error) {
      setAdding(false);
      // console.log(decryptData(error?.response?.data?.data))
    }
  };
  return (
    <div
      key={user?._id}
      style={{
        padding: ".5rem 1rem",
        fontSize: "15px",
        fontWeight: "600",
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: ".5rem",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
        <div
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "25px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background:
              "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
            color: "white",
            fontSize: "1rem",
            fontWeight: 800,
            textTransform: "uppercase",
            lineHeight: "0",
          }}
        >
          {user?.first_name?.[0] ?? user?.company_name?.[0]}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <span
            style={{
              color: "#111",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: 600,
            }}
          >
            {user?.account_type === "individual"
              ? `${user?.first_name} ${user?.last_name}`
              : user?.company_name}
          </span>
          <Badge
            color="success"
            style={{
              padding: "4px 10px",
              borderRadius: "3px",
              fontSize: ".45rem",
              width: "fit-content",
              textTransform: "uppercase",
            }}
          >
            {user?.account_type ?? "Individual"} Account
          </Badge>
        </div>
      </div>
      <Button
        style={{
          background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
          border: "none",
          outline: "none",
        }}
        disabled={adding}
        onClick={() => {
          const payload = {
            name:
              user?.account_type === "individual"
                ? `${user?.first_name} ${user?.last_name}`
                : user?.company_name,
            email: user?.email,
            account_id: userDetails?._id,
          };
          addPartnerHandler(payload);
        }}
      >
        {adding ? "Adding" : "Add Partner"}
      </Button>
    </div>
  );
};

export default SearchedUserCard;
