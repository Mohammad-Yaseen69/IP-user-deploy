export const service_name_formatter = (itemName) => {
  if (itemName) {
    const nameArr = itemName.split("_");
    const newName = nameArr
      .map((item) =>
        item?.toLowerCase() === "aba" ? "ABA" : `${item[0].toUpperCase()}${item?.slice(1)}`,
      )
      .join(" ");
    return newName;
  }
};
