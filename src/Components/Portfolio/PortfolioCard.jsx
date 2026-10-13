import styles from "./styles/index.module.css";
import six_dots from "./files/six_dots.svg";
import heart from "./files/heart.svg";
import comment from "./files/comment.svg";
import share from "./files/share.svg";
import { Eye, MoreHorizontal, Play, Trash } from "react-feather";
import { useContext, useEffect, useRef, useState } from "react";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import edit from "./files/edit.svg";
import delete_icon from "./files/delete.svg";
import file_img from "./files/file.png";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import SocialModal from "../ShareBtn/SocialModal";
import PortfolioItemModal from "../Profile/PortfolioItemModal";
import { Badge } from "reactstrap";
import audioPl from "./files/audio.jpeg";
import pdfPl from "./files/pdf.jpeg";
import ReactJWPlayer from "react-jw-player";
import docPl from "./files/doc.jpeg";
import styles2 from "../Profile/styles/PortfolioItem.module.css";
import "./styles/player.reset.css";
import useWindowWidth from "../../utils/useWindowWidth";
import { usePermission } from "../../hooks/GeneralUse/usePermission";

const PortfolioCard = ({
  item,
  dragRef,
  dragOverRef,
  index,
  handleSort,
  pAddress,
  publicP,
  setPlayingMediaId,
  playingMediaId,
  playerRefs,
}) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const toggleShowMenu = () => setShowMenu(!showMenu);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const width = useWindowWidth();
  const can = usePermission();

  const canEditPortfolio = can("portfolio.edit");

  const canDeletePortfolio = can("portfolio.delete");

  const canSharePortfolio = can("portfolio.share");
  const base_url = window.location.origin || "https://my.insta-pay.ch";
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

  console.log(playingMediaId);

  const handleContextMenu = (e) => {
    e.preventDefault();
    toggleShowMenu();
  };

  // share
  const { userDetails } = useContext(UserContext);
  const [showShareModal, setShowShareModal] = useState();

  const [showModal, setShowModal] = useState(false);

  return (
    <div
      className={styles.item_card}
      draggable={isDraggable}
      onContextMenu={handleContextMenu}
      onDragStart={() => (dragRef.current = index)}
      onDragEnter={() => (dragOverRef.current = index)}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => {
        if (item?.jw_media?.status && item?.jw_media?.status !== "ready") return;
        if (!publicP) {
          setShowModal(true);
        }
      }}
      onDragEnd={handleSort}
      style={{
        height:
          publicP && width > 1000 && width < 1450
            ? "170px"
            : publicP
              ? "220px"
              : pAddress && !publicP
                ? "150px"
                : "",

        minWidth: publicP ? "100%" : pAddress && !publicP ? "242px" : "",

        borderRadius: publicP || (pAddress && !publicP) ? "12px" : "",
      }}
    >
      <PortfolioItemModal item={item} setShowModal={setShowModal} showModal={showModal} />

      {publicP && (
        <div className="p-address-123456">
          <div className={styles2.modal_content}>
            {item?.file_type?.includes("image") ? (
              <img src={item?.document_details?.url} />
            ) : item?.file_type?.includes("video") ? (
              <div
                className={`jw-video-container`}
                data-mediaid={item?.jw_media?.mediaId}
                style={{ aspectRatio: "16/9" }}
              >
                <ReactJWPlayer
                  key={item?.jw_media?.mediaId}
                  playerId={`${import.meta.env.VITE_JW_PLAYER_ID}_${item?.jw_media?.mediaId}`}
                  playerScript={import.meta.env.VITE_JW_PLAYER_URL}
                  controls={true}
                  autoStart={playingMediaId === item?.jw_media?.mediaId}
                  onReady={() => {
                    playerRefs.current[item?.jw_media?.mediaId] = window.jwplayer(
                      `${import.meta.env.VITE_JW_PLAYER_ID}_${item?.jw_media?.mediaId}`,
                    );
                  }}
                  onPlay={() => {
                    Object.entries(playerRefs.current).forEach(([id, player]) => {
                      if (
                        id !== item?.jw_media?.mediaId &&
                        player &&
                        player.getState() === "playing"
                      ) {
                        player.pause();
                      }
                    });

                    setPlayingMediaId(item?.jw_media?.mediaId);
                  }}
                  onResume={() => {
                    Object.entries(playerRefs.current).forEach(([id, player]) => {
                      if (
                        id !== item?.jw_media?.mediaId &&
                        player &&
                        player.getState() === "playing"
                      ) {
                        player.pause();
                      }
                    });

                    setPlayingMediaId(item?.jw_media?.mediaId);
                  }}
                  height={publicP && "263px"}
                  playlist={`https://cdn.jwplayer.com/v2/media/${item?.jw_media?.mediaId}`}
                />
              </div>
            ) : item?.file_type?.includes("audio") ? (
              <div
                className={`jw-video-container`}
                data-mediaid={item?.jw_media?.mediaId}
                style={{ aspectRatio: "16/9" }}
              >
                <ReactJWPlayer
                  playerId={`${import.meta.env.VITE_JW_PLAYER_ID}_${item?.jw_media?.mediaId}`}
                  playerScript={import.meta.env.VITE_JW_PLAYER_URL}
                  controls={true}
                  autoStart={true}
                  playlist={`https://cdn.jwplayer.com/v2/media/${item?.jw_media?.mediaId}`}
                />
              </div>
            ) : item?.file_type?.includes("pdf") ? (
              <img
                src={pdfPl}
                alt="img"
                style={{ background: "black", objectFit: "contain" }}
                onClick={() => window.open(item?.document_details?.url, "_blank")}
              />
            ) : item?.file_type?.includes("doc") ? (
              <img
                src={docPl}
                alt="img"
                style={{ background: "black", objectFit: "contain" }}
                onClick={() => window.open(item?.document_details?.url, "_blank")}
              />
            ) : (
              <img
                src={file_img}
                alt="img"
                style={{ background: "black", objectFit: "contain" }}
                onClick={() => window.open(item?.document_details?.url, "_blank")}
              />
            )}
            <div>
              <p>{item?.description}</p>
            </div>
          </div>
        </div>
      )}
      {!publicP && (
        <>
          <div
            style={{
              borderRadius: (pAddress && !publicP) || publicP ? "12px" : "",
            }}
            className={`${styles.item_card_header} ${publicP && styles.publicH} `}
          >
            {item?.jw_media?.status && item?.jw_media?.status !== "ready" ? (
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "20px",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  gap: ".5rem",
                }}
              >
                <Badge
                  color="primary"
                  style={{
                    fontSize: ".8rem",
                    width: "fit-content",
                  }}
                >
                  {t("Processing")}
                </Badge>
                <span style={{ fontSize: ".8rem", fontWeight: "700" }}>
                  {t("Please refresh the page to get the latest status of the uploaded file.")}
                </span>
              </div>
            ) : (
              ""
            )}
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                filter: "drop-shadow(0px 0px 1px #0000005e)",
                zIndex: 101,
                display: publicP && "none",
              }}
              ref={menuRef}
            >
              {!pAddress && (
                <>
                  <MoreHorizontal
                    style={{
                      cursor: "pointer",
                    }}
                    color="white"
                    size={34}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleShowMenu();
                    }}
                  />
                  <div className={`${styles.card_menu} ${showMenu ? styles.card_menu_active : ""}`}>
                    {canEditPortfolio && (
                      <div
                        className={styles.card_menu_item}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEdit(true);
                          toggleShowMenu();
                        }}
                      >
                        {/* <Edit /> */}
                        <img
                          src={edit}
                          alt="edit"
                          style={{
                            width: "20px",
                            height: "20px",
                            objectFit: "contain",
                          }}
                        />
                        <span>{t("Edit")}</span>
                      </div>
                    )}
                    {canDeletePortfolio && (
                      <div
                        className={styles.card_menu_item}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDelete(true);
                          toggleShowMenu();
                        }}
                      >
                        {/* <Trash2 /> */}
                        <img
                          src={delete_icon}
                          alt="delete"
                          style={{
                            width: "20px",
                            height: "20px",
                            objectFit: "contain",
                          }}
                        />
                        <span>{t("Delete")}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {pAddress && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDelete(true);
                  }}
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(5px)",
                    padding: "4px",
                    borderRadius: "7px",
                    cursor: "pointer",
                    paddingBottom: "0",
                  }}
                >
                  <Trash color="white" />
                </div>
              )}
            </div>
            {item?.file_type?.includes("image") ? (
              <img src={item?.document_details?.url} className={styles.item_img} />
            ) : item?.file_type?.includes("video") ? (
              <div style={{ position: "relative" }}>
                {item?.jw_media?.status && item?.jw_media?.status === "ready" && (
                  <div
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      left: 0,
                      top: pAddress && !publicP ? -32 : 0,
                      backgroundColor: "rgba(0,0,0,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 99,
                    }}
                  >
                    <Play color="white" size={40} style={{ cursor: "pointer" }} />
                  </div>
                )}
                {item?.jw_media?.thumbnail_url?.endsWith("mp4") ? (
                  <video src={item?.jw_media?.thumbnail_url} className={styles.item_img}></video>
                ) : (
                  <img src={item?.jw_media?.thumbnail_url} alt="" className={styles.item_img} />
                )}
              </div>
            ) : item?.file_type?.includes("audio") ? (
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    left: 0,
                    top: pAddress && !publicP ? -32 : 0,
                    backgroundColor: "rgba(0,0,0,0.2)",
                    zIndex: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Play color="white" size={40} />
                </div>
                <img src={audioPl} alt="img" style={{ background: "black" }} />
              </div>
            ) : item?.file_type?.includes("pdf") ? (
              <img src={pdfPl} alt="img" style={{ background: "black" }} />
            ) : item?.file_type?.includes("doc") ? (
              <img src={docPl} alt="img" style={{ background: "black" }} />
            ) : (
              <img src={file_img} alt="img" style={{ background: "black" }} />
            )}
          </div>
          <div style={{ display: pAddress && "none" }} className={styles.item_card_body}>
            <h5>{item?.title}</h5>
            <div style={{ position: "relative" }}>
              <p onMouseMove={() => setTooltip(true)} onMouseLeave={() => setTooltip(false)}>
                {item?.description}
              </p>
              {tooltip && (
                <div
                  style={{
                    fontSize: ".7rem",
                    fontWeight: 500,
                    borderRadius: "10px",
                    position: "absolute",
                    bottom: tooltip ? "110%" : "200%",
                    opacity: tooltip ? 1 : 0,
                    pointerEvents: "none",
                    left: 0,
                    right: 0,
                    background: "white",
                    padding: "15px",
                    background: "#fff",
                    boxShadow: "0 0 10px #dddddd",
                    transition: "200ms",
                  }}
                >
                  {item?.description}
                </div>
              )}
            </div>
            <div className={styles.icb_more}>
              <div className={styles.icbm_left}>
                <img
                  src={six_dots}
                  alt="s"
                  style={{ cursor: "grab" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDraggable(true);
                  }}
                  onMouseUp={() => setIsDraggable(false)}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    setIsDraggable(true);
                  }}
                  onTouchEnd={() => setIsDraggable(false)}
                />
                {/* <div>
                            <Eye size={17} />
                            <span>190</span>
                        </div> */}
              </div>
              <div className={styles.icbm_right}>
                {/* <img src={heart} alt="heart" />
                        <img src={comment} alt="comment" /> */}
                {canSharePortfolio && (
                  <img
                    src={share}
                    alt="share"
                    onClick={() => setShowShareModal(true)}
                    style={{ cursor: "pointer" }}
                  />
                )}{" "}
              </div>
            </div>
          </div>
        </>
      )}

      <SocialModal
        isOpen={showShareModal}
        toggle={() => setShowShareModal(!showShareModal)}
        link={`${base_url}/profile/` + userDetails?.username}
      />
      {showEdit && (
        <EditModal
          isOpen={showEdit}
          toggle={() => setShowEdit(!showEdit)}
          item={item}
          pAddress={pAddress}
        />
      )}
      {showDelete && (
        <DeleteModal
          isOpen={showDelete}
          toggle={() => setShowDelete(!showDelete)}
          pAddress={pAddress}
          item={item}
        />
      )}
    </div>
  );
};

export default PortfolioCard;
