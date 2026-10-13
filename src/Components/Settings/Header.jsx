import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./styles/Header.module.scss";
import countries from "../PaymentsNewer/CountriesData.json";
import { UserContext } from "../../Context/UserContext";
import { Button, Card, CardBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import { Camera, Trash2 } from "react-feather";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import DeleteImageModal from "./DeleteImageModal";
import { toast } from "react-toastify";
import ReactApexChart from "react-apexcharts";
import change_dp from "./change_img.svg";
import AdjustModal from "./AdjustModal";
import { usePermission } from "../../hooks/GeneralUse/usePermission";

const Header = () => {
  const {
    userDetails,
    authHeader,
    verifyToken,
    profileCompletedPercentage,
    croppedImages,
    setCroppedImages,
  } = useContext(UserContext);
  const country = countries.find((item) => item.alpha3 === userDetails?.country_iso_code);
  const [dp, setDp] = useState();
  const { t } = useTranslation();
  const [showDelModal, setShowDelModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const can = usePermission();
  useEffect(() => {
    if (userDetails) {
      setDp(userDetails?.profileImage?.url ?? "");
    }
  }, [userDetails]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const mainContainerRef = useRef(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (userDetails) {
      setDp(userDetails?.profileImage?.url);
      console.log(userDetails.profileImage);
    }
  }, [userDetails]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file?.type?.toLowerCase()?.includes("image")) {
      toast.error("Only images are allowed!");
      return;
    }
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("File too big! Must be less than 5MB.");
      e.target.value = "";
      return;
    }
    setFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCroppedImages((prev) => ({ ...prev, profileDP: reader.result }));
      setDp(reader.result);
    };
    reader.readAsDataURL(file);
    if (file) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("file", file);
    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/account/upload-profile-image/${userDetails._id}`,
        formData,
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const dec = decryptData(res.data.data);
        console.log(dec);

        verifyToken(true);
      })
      .catch((err) => {})
      .finally(() => {
        setIsSaving(false);
        setIsEditing(false);
      });
    // }, "image/png");
  };

  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);

  const menuRef = useRef(null);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const [series, setSeries] = useState([0]);

  useEffect(() => {
    setSeries([profileCompletedPercentage]);
  }, [profileCompletedPercentage]);

  const [options] = useState({
    chart: {
      height: 100,
      type: "radialBar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,
        hollow: {
          margin: 0,
          size: "70%",
          background: "#fff",
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0,
          position: "front",
          dropShadow: {
            enabled: true,
            top: 3,
            left: 0,
            blur: 4,
            opacity: 0.24,
          },
        },
        track: {
          background: "#fff",
          strokeWidth: "67%",
          margin: 0,
          dropShadow: {
            enabled: true,
            top: -3,
            left: 0,
            blur: 4,
            opacity: 0.35,
          },
        },
        dataLabels: {
          show: true,
          name: {
            offsetY: -13,
            show: false,
            color: "#888",
            fontSize: "11px",
          },
          value: {
            formatter: function (val) {
              return `${parseInt(val)}%`;
            },
            offsetY: 9,
            color: "#111",
            fontSize: "23px",
            show: true,
            fontWeight: 700,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 1,
        gradientToColors: ["red", "yellow"],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Percent"],
  });
  return (
    <div className={styles.top}>
      <div className={styles.left}>
        <div className={styles.dp_container} ref={mainContainerRef}>
          {/* {
                        isEditing
                            ?
                            <div className={styles.editor_container}>
                                <AvatarEditor
                                    ref={(editor) => setEditor(editor)}
                                    image={dp || ''}
                                    width={mainContainerRef?.current?.offsetWidth}
                                    height={mainContainerRef?.current?.offsetHeight}
                                    border={0}
                                    color={[255, 255, 255, 0.6]}
                                    scale={scale}
                                />
                            </div>
                            : */}
          {/* <> */}
          {userDetails?.profileImage?.url || isEditing ? (
            <img
              src={croppedImages.profileDP || dp}
              alt={
                userDetails?.account_type === "individual"
                  ? userDetails?.user?.first_name
                  : userDetails?.company?.company_name
              }
              style={{
                background: "white",
                boxShadow: "0px 0px 3px #1111113e",
              }}
              className={styles.img}
            />
          ) : (
            <div className={styles.dp} style={{ overflow: "hidden" }}>
              {userDetails?.account_type?.toLowerCase() === "individual"
                ? userDetails?.user?.first_name?.[0]?.toUpperCase()
                : userDetails?.company?.company_name?.[0]?.toUpperCase()}
            </div>
          )}
          {/* </> */}
          {/* } */}

          {isEditing ? (
            <div
              style={{
                position: "absolute",
                bottom: window?.innerWidth > 1000 ? "20px" : "-30px",
                left: window?.innerWidth > 1000 ? "50%" : "0px",
                transform: window?.innerWidth > 1000 ? "translateX(-50%)" : "translateX(0)",
                display: "flex",
                gap: ".4rem",
              }}
            >
              {/* // <div style={{
                                //     background: "white",
                                //     borderRadius: "5px",
                                //     overflow: "hidden",
                                //     display: "flex",
                                //     width: "110px"
                                // }}>
                                //     <button onClick={() => setScale(prev => prev > 1 ? prev - .25 : prev)} style={{
                                //         border: "none",
                                //         outline: "none",
                                //         width: "30px",
                                //         height: "30x",
                                //         display: "flex",
                                //         justifyContent: "center",
                                //         alignItems: "center",
                                //         fontSize: ".75rem",
                                //         fontWeight: "700"
                                //     }}>-</button>
                                //     <span style={{ flex: 1, textAlign: "center", fontSize: ".8rem", fontWeight: 600, alignSelf: "center" }}>{scale}x</span>
                                //     <button onClick={() => setScale(prev => prev < 4 ? prev + .25 : prev)} style={{
                                //         border: "none",
                                //         outline: "none",
                                //         width: "30px",
                                //         height: "30x",
                                //         display: "flex",
                                //         justifyContent: "center",
                                //         alignItems: "center",
                                //         fontSize: ".75rem",
                                //         fontWeight: "700"
                                //     }}>+</button>
                                // </div> */}
              <Button
                color="primary"
                style={{
                  background: "white",
                  border: "none",
                  outline: "none",
                  borderRadius: "5px",
                  padding: "5px 10px",
                  fontSize: ".65rem",
                }}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving" : "Save"}
              </Button>
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                bottom: window.innerWidth > 1000 ? "0px" : "5px",
                left: window.innerWidth > 1000 ? "15px" : "8px",
                filter: "drop-shadow(0 0 2px black)",
              }}
              ref={menuRef}
            >
              {/* <MoreHorizontal onClick={toggleMenu} color='white' size={30} style={{ cursor: "pointer" }} /> */}
              {can("user-profile.update") && (
                <img
                  alt="niglet"
                  src={change_dp}
                  onClick={toggleMenu}
                  style={{
                    height: window.innerWidth > 1000 ? "60px" : "40px",
                    width: window.innerWidth > 1000 ? "60px" : "40px",
                    objectFit: "contain",
                    cursor: "pointer",
                  }}
                />
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "10px",
                  overflow: "hidden",
                  position: "absolute",
                  bottom: showMenu ? "20px" : "-100px",
                  opacity: showMenu ? "1" : "-0",
                  pointerEvents: showMenu ? "all" : "none",
                  left: 0,
                  background: "white",
                }}
              >
                <label
                  htmlFor="dp"
                  onClick={toggleMenu}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 16px",
                    marginBottom: "0",
                    cursor: "pointer",
                  }}
                >
                  <Camera size={18} />
                  <span style={{ whiteSpace: "nowrap" }}>{t("Upload")}</span>
                </label>
                {userDetails?.profileImage?.url && (
                  <>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 16px",
                        marginBottom: "0",
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        toggleMenu();
                        setShowModal(true);
                      }}
                    >
                      <Camera size={18} />
                      <span style={{ whiteSpace: "nowrap" }}>{t("Adjust")}</span>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 16px",
                        marginBottom: "0",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setShowDelModal(true);
                        toggleMenu();
                      }}
                    >
                      <Trash2 size={18} />
                      <span style={{ whiteSpace: "nowrap" }}>{t("Remove")}</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          )}
          <input
            type="file"
            name="dp"
            id="dp"
            hidden
            onChange={handleFileSelect}
            accept="image/*"
          />
          <DeleteImageModal
            imageType={"Profile"}
            isOpen={showDelModal}
            toggle={() => setShowDelModal(!showDelModal)}
          />
        </div>
        <div className={styles.basic_dets}>
          <div className={styles.badge}>
            {userDetails?.account_type === "individual"
              ? t("Personal Account")
              : t("Business Account")}
          </div>
          <h4 style={{ maxWidth: "25ch", whiteSpace: "normal" }}>
            {userDetails?.account_type?.toLowerCase() === "individual"
              ? `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`
              : userDetails?.company?.company_name}
          </h4>
          <div className={styles.country}>
            <img
              src={country?.file_url}
              alt={country?.alpha3}
              style={{ boxShadow: "0 0 5px #afafaf" }}
            />
            <span>{country?.name}</span>
          </div>
        </div>
      </div>
      <div className={styles.top_right}>
        <Card
          style={{ marginBottom: 0, boxShadow: "none" }}
          className={styles.completion_status_con}
        >
          <CardBody className={styles.completion_status_body}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <span>{t("Profile Completion")}</span>
              <button>
                {profileCompletedPercentage === 100 ? (
                  <span>{t("Profile Completed")}</span>
                ) : (
                  <>
                    <span>{t("Complete Now")}</span>
                    <span>&rarr;</span>
                  </>
                )}
              </button>
            </div>
            <div id="chart" style={{ flexShrink: 0 }} className={styles.com_chart}>
              <ReactApexChart options={options} series={series} type="radialBar" height={150} />
            </div>
          </CardBody>
        </Card>
        {/* <div className={styles.completion_con}>
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: `${profileCompletedPercentage}%`,
                        height: "100%",
                        background: "linear-gradient(270deg, #5926F0 -8.7%, #4828A0 100%), #FFF",
                        boxShadow: "0px 4px 30px 0px rgba(0, 0, 0, 0.09)",
                        zIndex: 1
                    }}></div>
                    <div className={styles.completion_det}>
                        <h4 style={{ marginBottom: 0 }}>
                            {profileCompletedPercentage.toFixed(0)}
                        </h4>
                        <span>%</span>
                    </div>
                </div> */}
      </div>

      <AdjustModal
        isOpen={showModal}
        toggle={() => setShowModal(!showModal)}
        imageUrl={dp}
        accountId={userDetails?._id}
        authHeader={authHeader}
        type={"profile"}
        name={"dp"}
      />
    </div>
  );
};

export default Header;
