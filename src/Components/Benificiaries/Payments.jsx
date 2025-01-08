import styles from "./styles/Payments.module.scss"
import { Breadcrumbs } from '../../AbstractElements';
import { UserPlus, PlusCircle } from "react-feather";
import RecipientsTable from "./RecipientsTable";
import { useState } from "react";
import ModalForm from "../Payments/ModalForm"
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


const Benificiaries = () => {
    const { t } = useTranslation()
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);

    return (
        <div style={{ height: "calc(100vh - 200px)", display: "flex", flexDirection: "column", paddingBottom: "1rem" }}>
            <Breadcrumbs mainTitle={t("Beneficiaries")} />
            <div className={styles.top}>
                <Link to={"/beneficiaries/add"}>
                    <UserPlus size={16} />
                    <span>{t("Add Beneficiary")}</span>
                </Link>
                <ModalForm modal={modal} toggle={toggle} />
                <button>
                    <PlusCircle size={16} />
                    <span>{t("Add New Account")}</span>
                </button>
            </div>
            <RecipientsTable />
        </div>
    )
}

export default Benificiaries