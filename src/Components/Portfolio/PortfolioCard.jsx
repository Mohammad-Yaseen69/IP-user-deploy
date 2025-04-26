import styles from "./styles/index.module.css"
import six_dots from "./files/six_dots.svg"
import heart from "./files/heart.svg"
import comment from "./files/comment.svg"
import share from "./files/share.svg"
import { Eye, MoreHorizontal, Play } from "react-feather"
import { useContext, useEffect, useRef, useState } from "react"
import EditModal from "./EditModal"
import DeleteModal from "./DeleteModal"
import edit from "./files/edit.svg"
import delete_icon from "./files/delete.svg"
import file_img from "./files/file.png"
import { useTranslation } from "react-i18next"
import { UserContext } from "../../Context/UserContext"
import SocialModal from "../ShareBtn/SocialModal"
import PortfolioItemModal from "../Profile/PortfolioItemModal"
import { Badge } from "reactstrap"
import audioPl from "./files/audio.jpeg"
import pdfPl from "./files/pdf.jpeg"
import ReactJWPlayer from "react-jw-player"
import docPl from "./files/doc.jpeg"
import styles2 from "../Profile/styles/PortfolioItem.module.css"
import "./styles/player.reset.css"

const PortfolioCard = ({ item, dragRef, dragOverRef, index, handleSort, pAddress, publicP }) => {
    const { t } = useTranslation()
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef(null)
    const toggleShowMenu = () => setShowMenu(!showMenu)
    const [showEdit, setShowEdit] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const [tooltip, setTooltip] = useState(false);
    const [isDraggable, setIsDraggable] = useState(false)
    const [showVideo, setShowVideo] = useState(false)
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setShowMenu(false);
        }
    }

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);


    const handleContextMenu = (e) => {
        e.preventDefault();
        toggleShowMenu();
    };

    // share
    const { userDetails } = useContext(UserContext)
    const [showShareModal, setShowShareModal] = useState()

    const [showModal, setShowModal] = useState(false)

    return (
        <div
            className={styles.item_card}
            draggable={isDraggable}
            onContextMenu={handleContextMenu}
            onDragStart={() => dragRef.current = index}
            onDragEnter={() => dragOverRef.current = index}
            onDragOver={e => e.preventDefault()}
            onClick={() => {
                if (item?.jw_media?.status && item?.jw_media?.status !== "ready") return;
                if(publicP){
                    setShowVideo(true)
                }else{
                    setShowModal(true)
                }
            }}
            onDragEnd={handleSort}
            style={{
                height: (pAddress && !publicP) ? '150px' : publicP ? "220px" : '',
                minWidth: publicP && "100%"
            }}
        >
            <PortfolioItemModal
                item={item}
                setShowModal={setShowModal}
                showModal={showModal}
            />


            {showVideo &&
            <div className="p-address-123456">
                <div className={styles2.modal_content}>
                    {
                        item?.file_type?.includes("image")
                            ?
                            <img src={item?.document_details?.url} />
                            :
                            item?.file_type?.includes("video")
                                ?
                                <div
                                    className={`jw-video-container`}
                                    data-mediaid={item?.jw_media?.mediaId}
                                    style={{ aspectRatio: "16/9" }}
                                >
                                    <ReactJWPlayer
                                       playerId={`${process.env.REACT_APP_JW_PLAYER_ID}_${item?.jw_media?.mediaId}`} 
                                        playerScript={process.env.REACT_APP_JW_PLAYER_URL}
                                        controls={true}
                                        autoStart={true}
                                        playlist={`https://cdn.jwplayer.com/v2/media/${item?.jw_media?.mediaId}`}
                                    />
                                </div>
                                :
                                item?.file_type?.includes("audio")
                                    ?
                                    <div
                                        className={`jw-video-container`}
                                        data-mediaid={item?.jw_media?.mediaId}
                                        style={{ aspectRatio: "16/9" }}
                                    >
                                        <ReactJWPlayer
                                            playerId={`${process.env.REACT_APP_JW_PLAYER_ID}_${item?.jw_media?.mediaId}`} 
                                            playerScript={process.env.REACT_APP_JW_PLAYER_URL}
                                            controls={true}
                                            autoStart={true}
                                            playlist={`https://cdn.jwplayer.com/v2/media/${item?.jw_media?.mediaId}`}
                                        />
                                    </div>
                                    :
                                    item?.file_type?.includes("pdf")
                                        ?
                                        <img src={pdfPl} alt="img" style={{ background: "black", objectFit: "contain" }} onClick={() => window.open(item?.document_details?.url, "_blank")} />
                                        :
                                        item?.file_type?.includes("doc")
                                            ?
                                            <img src={docPl} alt="img" style={{ background: "black", objectFit: "contain" }} onClick={() => window.open(item?.document_details?.url, "_blank")} />
                                            :
                                            <img src={file_img} alt="img" style={{ background: "black", objectFit: "contain" }} onClick={() => window.open(item?.document_details?.url, "_blank")} />
                    }
                    <div>
                        <p>{item?.description}</p>
                    </div>
                </div>
            </div>
            }
            {!showVideo &&
                <>
                    <div className={styles.item_card_header}>
                        {
                            item?.jw_media?.status && item?.jw_media?.status !== "ready"
                                ?
                                <div style={{
                                    position: "absolute",
                                    top: "20px",
                                    left: "20px",
                                    zIndex: 100,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: ".5rem"
                                }}>
                                    <Badge color="primary" style={{
                                        fontSize: ".8rem",
                                        width: "fit-content"
                                    }}>{t("Processing")}</Badge>
                                    <span style={{ fontSize: ".8rem", fontWeight: "700" }}>{t("Please refresh the page to get the latest status of the uploaded file.")}</span>
                                </div>
                                :
                                ""
                        }
                        <div style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            filter: "drop-shadow(0px 0px 1px #0000005e)",
                            zIndex: 101,
                            display: publicP && "none"
                        }}
                            ref={menuRef}
                        >
                            <MoreHorizontal style={{
                                cursor: "pointer",
                            }} color="white" size={34} onClick={(e) => {
                                e.stopPropagation()
                                toggleShowMenu()
                            }} />
                            <div
                                className={`${styles.card_menu} ${showMenu ? styles.card_menu_active : ""}`}
                            >
                                <div className={styles.card_menu_item} onClick={(e) => {
                                    e.stopPropagation()
                                    setShowEdit(true)
                                    toggleShowMenu()
                                }}>
                                    {/* <Edit /> */}
                                    <img src={edit} alt="edit" style={{
                                        width: "20px",
                                        height: "20px",
                                        objectFit: "contain"
                                    }} />
                                    <span>{t("Edit")}</span>
                                </div>
                                <div className={styles.card_menu_item} onClick={(e) => {
                                    e.stopPropagation()
                                    setShowDelete(true)
                                    toggleShowMenu()
                                }}>
                                    {/* <Trash2 /> */}
                                    <img src={delete_icon} alt="delete" style={{
                                        width: "20px",
                                        height: "20px",
                                        objectFit: "contain"
                                    }} />
                                    <span>{t("Delete")}</span>
                                </div>
                            </div>
                        </div>
                        {
                            item?.file_type?.includes("image")
                                ?
                                <img src={item?.document_details?.url} className={styles.item_img} />
                                :
                                item?.file_type?.includes("video")
                                    ?
                                    <div style={{ position: "relative" }}>
                                        {
                                            item?.jw_media?.status && item?.jw_media?.status === "ready"
                                            &&
                                            <div style={{
                                                position: "absolute",
                                                width: "100%",
                                                height: "100%",
                                                left: 0,
                                                top: (pAddress && !publicP) ? -32 : 0,
                                                backgroundColor: "rgba(0,0,0,0.2)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                zIndex: 99
                                            }}>
                                                <Play color='white' size={40} style={{ cursor: "pointer" }} />
                                            </div>
                                        }
                                        {
                                            item?.jw_media?.thumbnail_url?.endsWith("mp4")
                                                ?
                                                <video src={item?.jw_media?.thumbnail_url} className={styles.item_img}></video>
                                                :
                                                <img src={item?.jw_media?.thumbnail_url} alt="" className={styles.item_img} />
                                        }
                                    </div>
                                    :
                                    item?.file_type?.includes("audio")
                                        ?
                                        <div style={{ position: "relative" }}>
                                            <div style={{
                                                position: "absolute",
                                                width: "100%",
                                                height: "100%",
                                                left: 0,
                                                top: (pAddress && !publicP) ? -32 : 0,
                                                backgroundColor: "rgba(0,0,0,0.2)",
                                                zIndex: 100,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}>
                                                <Play color='white' size={40} />
                                            </div>
                                            <img src={audioPl} alt="img" style={{ background: "black" }} />
                                        </div>
                                        :
                                        item?.file_type?.includes("pdf")
                                            ?
                                            <img src={pdfPl} alt="img" style={{ background: "black" }} />
                                            :
                                            item?.file_type?.includes("doc")
                                                ?
                                                <img src={docPl} alt="img" style={{ background: "black" }} />
                                                :
                                                <img src={file_img} alt="img" style={{ background: "black" }} />

                        }
                    </div>
                    <div style={{ display: pAddress && "none" }} className={styles.item_card_body}>
                        <h5>{item?.title}</h5>
                        <div style={{ position: "relative" }}>
                            <p
                                onMouseMove={() => setTooltip(true)}
                                onMouseLeave={() => setTooltip(false)}
                            >
                                {item?.description}
                            </p>
                            {
                                tooltip
                                &&
                                <div style={{
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
                                    transition: "200ms"
                                }}>
                                    {item?.description}
                                </div>
                            }
                        </div>
                        <div className={styles.icb_more}>
                            <div className={styles.icbm_left}>
                                <img
                                    src={six_dots}
                                    alt="s"
                                    style={{ cursor: "grab" }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation()
                                        setIsDraggable(true)
                                    }}
                                    onMouseUp={() => setIsDraggable(false)}
                                    onTouchStart={e => {
                                        e.stopPropagation()
                                        setIsDraggable(true)
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
                                <img src={share} alt="share" onClick={() => setShowShareModal(true)} style={{ cursor: "pointer" }} />
                            </div>
                        </div>
                    </div>
                </>
            }


            <SocialModal
                isOpen={showShareModal}
                toggle={() => setShowShareModal(!showShareModal)}
                link={"https://my.insta-pay.ch/profile/" + userDetails?.username}
            />
            {
                showEdit
                &&
                <EditModal isOpen={showEdit} toggle={() => setShowEdit(!showEdit)} item={item} pAddress={pAddress} />
            }
            {
                showDelete
                &&
                <DeleteModal isOpen={showDelete} toggle={() => setShowDelete(!showDelete)} pAddress={pAddress} item={item} />
            }
        </div>
    )
}

export default PortfolioCard