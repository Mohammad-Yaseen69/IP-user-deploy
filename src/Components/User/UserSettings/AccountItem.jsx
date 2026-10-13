import React, { useContext, useEffect, useState } from "react";
import { Badges, H4, P } from "../../../AbstractElements";
import styles from "./styles/Accounts.module.scss";
import { Trash } from "react-feather";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import axios from "axios";
import { UserContext } from "../../../Context/UserContext";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import OtpVerification from "../../../Common/Component/OtpVerification";
import { useTranslation } from "react-i18next";

const AccountItem = ({ data, ssa }) => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState(60);
  const [conLink, setConLink] = useState("");
  const { userDetails, authHeader } = useContext(UserContext);
  const [showOtp, setShowOtp] = useState(false);
  const [showDelOtp, setShowDelOtp] = useState(false);
  const [noUser, setNoUser] = useState(false);

  const onChange = () => {
    if (data.name.toLowerCase().includes("insta") && !checked) {
      if (userDetails?.username) {
        setShowModal(true);
      } else {
        setNoUser(true);
      }
      // setChecked(true)
    } else {
      setShowOtp(true);
    }
  };

  const otpCallback = (setter) => {
    axios
      .get(`${import.meta.env.VITE_IP_DEV_API}/api/instagram/insta-unlink/${userDetails?._id}`, {
        headers: authHeader,
      })
      .then((res) => {
        // console.log(res)
        if (res.data.status) {
          setShowOtp(!showOtp);
        }
        // const decrypted = decryptData(res.data.data)
        // // console.log(decrypted)
      })
      .catch((err) => {
        // console.log(err)
      });
  };

  const getInstaLink = () => {
    // console.log("got insta link!")
    if (userDetails) {
      axios
        .get(
          `${import.meta.env.VITE_IP_DEV_API}/api/account/get-insta-link-code/${userDetails?._id}`,
          {
            headers: authHeader,
          },
        )
        .then((res) => {
          const decrypted = decryptData(res.data.data);
          setConLink(decrypted.link_code);
          setTimer(60);
        })
        .catch((err) => {
          // console.log(err)
        });
    }
  };

  useEffect(() => {
    if (data.name.toLowerCase().includes("insta")) {
      setChecked(userDetails?.insta_username ? true : false);
    }
  }, [userDetails]);

  useEffect(() => {
    if (showModal) {
      if (userDetails && !userDetails?.insta_username && userDetails?.username) {
        getInstaLink();
      }
    }
  }, [showModal]);

  useEffect(() => {
    let interval;

    if (showModal) {
      interval = setInterval(() => {
        if (timer > 0) {
          setTimer(timer - 1);
        } else {
          clearInterval(interval);
          getInstaLink();
        }
      }, 1000);
    } else {
      setTimer(60);
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [showModal, timer]);

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.left}>
          <img src={data.img} alt={data.name} />
          <div>
            <H4>{data.name}</H4>
            <P>
              {userDetails?.insta_username && data.name.toLowerCase().includes("insta")
                ? userDetails?.insta_username
                : t("Social Account")}
            </P>
          </div>
        </div>
        <div className={styles.right}>
          {data.available ? (
            <>
              <label className="switch">
                <input type="checkbox" checked={checked} onChange={onChange} />
                <span className="slider round"></span>
              </label>
              <span
                style={{
                  fontSize: "1rem",
                  color: "red",
                  cursor: "pointer",
                  margin: 0,
                }}
              >
                <Badges
                  attrBadge={{
                    color: "light",
                    className: "badge-light-danger rounded-pill",
                    size: "lg",
                  }}
                >
                  <Trash onClick={() => setShowDelOtp(true)} />
                </Badges>
              </span>
            </>
          ) : (
            <span style={{ fontWeight: 600 }}>{t("Coming Soon")}</span>
          )}
          <Modal isOpen={showDelOtp} toggle={() => setShowDelOtp(!showDelOtp)}>
            <ModalHeader toggle={() => setShowDelOtp(!showDelOtp)}>{t("Confirm")}</ModalHeader>
            <ModalBody>
              <OtpVerification
                variant="card"
                hideTfaSwitch
                callback={(setter) => setter(true)}
                setter={() => {}}
                setterValue={false}
                hideOtp={() => setShowDelOtp(false)}
              />
            </ModalBody>
          </Modal>
        </div>
      </div>
      <Modal isOpen={showModal} toggle={() => setShowModal(!showModal)}>
        <ModalHeader toggle={() => setShowModal(!showModal)}>{t("Activate Account")}</ModalHeader>
        <ModalBody
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <h5 style={{ fontSize: "1.5rem" }}>{t("Enter the below code in Chatbot")} </h5>
          <h6 style={{ color: "green", fontSize: "1.1rem" }}>{conLink}</h6>
          <p style={{ marginBottom: "0" }}>
            {t("Code will expire in")}{" "}
            <span style={{ fontSize: "1.1rem", fontWeight: "700" }}>{timer}</span> {t("seconds")}
          </p>
        </ModalBody>
      </Modal>
      <Modal isOpen={showOtp} toggle={() => setShowOtp(!showOtp)}>
        <ModalHeader toggle={() => setShowOtp(!showOtp)}>{t("Confirm")}</ModalHeader>
        <ModalBody>
          <OtpVerification
            variant="card"
            hideTfaSwitch
            callback={(setter) => otpCallback(setter)}
            setter={setChecked}
            setterValue={false}
            hideOtp={() => setShowOtp(false)}
          />
        </ModalBody>
      </Modal>
      <Modal isOpen={noUser} toggle={() => setNoUser(!noUser)}>
        <ModalHeader toggle={() => setNoUser(!noUser)}>{t("No Username")}</ModalHeader>
        <ModalBody>
          <h5>
            {t("You haven't set the username yet.")}{" "}
            <span
              style={{ color: "#5926f0", fontWeight: 700, cursor: "pointer" }}
              onClick={() => {
                setNoUser(!noUser);
                ssa(true);
                const scrollOptions = {
                  block: "start",
                  inline: "nearest",
                  behavior: "smooth",
                  top: 400,
                };
                document.querySelector("#basic")?.scrollIntoView(scrollOptions);
              }}
            >
              {t("Set Now")}
            </span>
          </h5>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AccountItem;
