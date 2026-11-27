const PayerTransactionTypePills = ({ item }) => {
  const colors = {
    C2C: "#c603fc",
    C2B: "#ac2257",
    B2B: "#fc7f03",
    B2C: "#5b26ed",
  };

  return (
    item?.payerTransactionTypes &&
    item?.payerTransactionTypes?.length > 0 && (
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        {item?.payerTransactionTypes?.map((type, idx) => (
          <span
            key={idx}
            style={{
              fontSize: "14px",
              fontWeight: 600,
              padding: "3px 12px",
              borderRadius: "9999px",
              backgroundColor: colors[type?.toUpperCase()],
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              // lineHeight: ""
            }}
          >
            {" "}
            {type?.toUpperCase()}
          </span>
        ))}
      </div>
    )
  );
};

export default PayerTransactionTypePills;
