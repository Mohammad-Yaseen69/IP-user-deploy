import { useContext, useMemo, useState } from "react";
import styles from "./styles/index.module.scss";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "react-feather";
import ImagePreviewModal from "../ImagePreviewModal.jsx";
import { toast } from "react-toastify";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption.jsx";
import axios from "axios";
import { UserContext } from "../../Context/UserContext.jsx";
import SubscriptionDetails from "./SubscriptionDetails.jsx";
import { useTranslation } from "react-i18next";

export const cancelSubscriptionOrSchedulePayment = async (
  item,
  authHeader,
  refetchMethod,
  queryClient,
) => {
  // if (item?.recursive) {
  //     toast.info("Still in development.")
  // } else {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_IP_DEV_API}/api/user/cancel-schedule/${item?._id}`,
      {
        headers: authHeader,
      },
    );
    const dec = decryptData(res.data.data);
    // console.log(dec)
    toast.success(dec?.message);
    refetchMethod();
    queryClient.invalidateQueries(["sentSchduled"]);
    queryClient.invalidateQueries(["receivedSchduled"]);
  } catch (error) {
    const decrypted = decryptData(error?.response?.data?.data);
    // console.log(decrypted)
    toast.error(decrypted?.message);
  }
  // }
};

const ReceivedTransactionItem = ({
  color,
  item,
  activeItem,
  setActiveItem,
  index,
  currentUser,
}) => {
  const { t } = useTranslation();
  const [currentImage, setCurrentImage] = useState("");
  const { authHeader, verifyToken } = useContext(UserContext);
  const recipient = useMemo(() => {
    return item?.request_payment?.receiver?.account_type === "individual"
      ? `${item?.request_payment?.receiver?.first_name ?? item?.request_payment?.receiver?.company_name} ${item?.request_payment?.receiver?.last_name ?? ""}`
      : item?.request_payment?.receiver?.company_name;
  }, [item]);

  return (
    <div>
      <div
        className={styles.body_item}
        onClick={() => {
          if (!activeItem || activeItem !== index + 1) {
            setActiveItem(index + 1);
          } else {
            setActiveItem(0);
          }
        }}
      >
        <div>{item?.date}</div>
        <div>
          {"recursive" in item
            ? item?.recursive === true
              ? `${item?.cycles} Cycle`
              : item?.time
            : "N/A"}
        </div>
        <div>
          {"recursive" in item
            ? item?.recursive === true
              ? "Recursive"
              : "Schedule"
            : "N/A"}
        </div>
        <div>
          {item?.type?.[0]?.toUpperCase()}
          {item?.type?.slice(1)}
        </div>
        <div>{recipient}</div>
        <div>
          {item?.request_payment?.currency?.code}{" "}
          {item?.request_payment?.amount
            ? item?.request_payment?.amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : ""}
        </div>
        <div>
          <div
            style={{
              background: color,
              fontSize: "12px",
              color: "white",
              width: "100px",
              margin: "0 auto",
              padding: "5px",
              borderRadius: "30px",
            }}
          >
            {item?.status}
          </div>
        </div>
        <div>
          <div
            style={{
              borderRadius: "9.938px",
              flex: "none",
              background:
                "linear-gradient(to top left,#e1e1e1,#e2e2e2,#b5b5b5)",
              boxShadow: "0px 3.3125px 5.79688px 0px rgba(172, 53, 159, 0.31)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "34px",
              width: "34px",
              aspectRatio: 1,
              margin: "0 auto",
              opacity:
                item?.status === "processing" || item?.status === "pending"
                  ? 1
                  : 0,
              pointerEvents:
                item?.status === "processing" || item?.status === "pending"
                  ? "all"
                  : "none",
            }}
            onClick={() =>
              cancelSubscriptionOrSchedulePayment(item, authHeader, verifyToken)
            }
          >
            <X color="#fff" />
          </div>
        </div>
        <div style={{ maxWidth: "15px" }}>
          {activeItem === index + 1 ? <ChevronDown /> : <ChevronRight />}
        </div>
      </div>
      {activeItem === index + 1 && (
        <div className={styles.item_description}>
          {item?.recursive ? (
            <SubscriptionDetails
              item={item}
              currentImage={currentImage}
              setCurrentImage={setCurrentImage}
            />
          ) : (
            <div className={styles.schedule}>
              <div>
                <span>{t("Payment Scheduled At")}:</span>
                <h5>{`${item?.date} ${item?.time}`}</h5>
              </div>
              <div>
                <span>{t("Transaction Fees")}:</span>
                <h5>{t("None")}</h5>
              </div>
              {item?.description && (
                <div>
                  <span>{t("Note")}:</span>
                  <h5>{item?.description}</h5>
                </div>
              )}
              {item?.attachments?.length > 0 && (
                <div>
                  <span>{t("Attachments")}:</span>
                  <div
                    style={{
                      display: "flex",
                      gap: ".75rem",
                      maxWidth: "100%",
                      overflowX: "auto",
                    }}
                  >
                    {item?.attachments?.map((it) => (
                      <img
                        key={it?.key}
                        src={it?.url}
                        alt=""
                        style={{
                          height: "60px",
                          width: "60px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                        onClick={() =>
                          setCurrentImage({
                            src: it?.url,
                            index: it?.key,
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
              {currentImage && (
                <ImagePreviewModal
                  currentImage={currentImage}
                  isOpen={currentImage}
                  toggle={() => setCurrentImage("")}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceivedTransactionItem;
