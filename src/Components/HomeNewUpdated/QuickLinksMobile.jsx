// import { Search } from 'react-feather';
import { useTranslation } from 'react-i18next'
import sq from "./files/sq.svg"
import funds from "./files/AddFunds.png"
import sm from "./files/SendMoney.png"
import rm from "./files/ReceiveMoney.png"
import cf from "./files/CryptoToFiat.svg"
import styles from "./styles/QuickLinkMobile.module.css"
import mqlt from "./files/mqlt.png"
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchComponent from './Search'


const QuickLinksMobile = () => {
  const { t } = useTranslation();

  const items = [
    { icon: funds, text: t('Add Funds'), width: "26px", link: "/add-funds" },
    { icon: sm, text: t('Send Money'), width: "27px", link: "/payments?payment_action=send_money" },
    { icon: rm, text: t('Request Money'), width: "26px", link: "/payments?payment_action=req_money" },
    { icon: sq, text: t('Send A Quote'), width: "21px", link: "/payments?payment_action=send_quote" },
    // { icon: cf, text: t('Pay With Crypto'), width: "23px", link: "/payments?payment_action=send_crypto" },
  ];

  const [selected, setSelected] = useState(items[0])

  return (
    <div className={styles.container}>
      {/* <h5 style={{ fontSize: "1rem", fontWeight: 700 }}>{t("Transfer Money")}</h5> */}
      {/* <div className={styles.search}>
        <Search size={16} />
        <input type="search" placeholder='Search for anything' />
      </div> */}
      <SearchComponent showS={true} />
      <div className={styles.scroll_view}>
        {
          items.map(it => (
            <div key={it.icon} className={`${styles.sv_item} ${it.text === selected.text ? styles.active : ""}`} onClick={() => setSelected(it)}>
              {it.text}
            </div>
          ))
        }
      </div>
      <div className={styles.bottom}>
        <div className={styles.left}>
          {/* <img src={mqlt} alt="" /> */}
          <iframe width="560" height="315" src="https://www.youtube.com/embed/ARWECRW17f0?si=w4XRwayZWL-UKuNm" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
        <div className={styles.right}>
          <Link to={selected.link}>
            <img src={selected.icon} alt="" loading="lazy" />
            <h5>{selected.text}</h5>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default QuickLinksMobile