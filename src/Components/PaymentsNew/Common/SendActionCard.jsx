import styles from "../styles/SendActionCard.module.scss"

const SendActionCard = (props) => {
    const { bg, title, icon, desc, setter, setterValue, showDesc, active, sendPaymentType } = props
    return (
        <div
            style={
                sendPaymentType
                    ?
                    {
                        width: active ? "100%" : "170px",
                        aspectRatio: active ? "339/541" : "170/541",
                        height: active ? "100%" : "541px"
                    }
                    :
                    {
                        aspectRatio: "339/541",
                    }
            }
            className={styles.container}
            onClick={() => {
                setter(setterValue)
            }}
        >
            <img src={bg} alt={title} className={styles.bg} />
            <div className={styles.item_dets}
                style={
                    sendPaymentType
                        ?
                        {
                            background: showDesc ? "#2910705e" : "transparent",
                            justifyContent: showDesc ? "space-between" : "flex-end",
                            transition: ".5s"
                        }
                        :
                        { justifyContent: showDesc ? "space-between" : "flex-end", }
                }
            >
                <div style={
                    sendPaymentType ?
                        {
                            alignItems: showDesc ? "flex-start" : "center",
                            justifyContent: showDesc ? "initial" : "space-between",
                            height: showDesc ? "inherit" : "100%",

                        }
                        :
                        {}
                }>
                    <img src={icon} alt={title} />
                    <h5
                        style={
                            sendPaymentType
                                ?
                                {
                                    writingMode: showDesc ? "horizontal-tb" : "vertical-rl",
                                    rotate: showDesc ? "0deg" : "-180deg",
                                    transition: ".5s",
                                    height: showDesc ? "fit-content" : "270px"
                                }
                                :
                                {}
                        }
                    >{title}</h5>
                </div>
                <p style={
                    sendPaymentType
                        ?
                        {
                            height: showDesc ? "fit-content" : "0px",
                            display: showDesc ? "inherit" : "none",
                            transition: ".5s"
                        }
                        :
                        {}
                }>{desc}</p>
            </div>
        </div>
    )
}

export default SendActionCard;