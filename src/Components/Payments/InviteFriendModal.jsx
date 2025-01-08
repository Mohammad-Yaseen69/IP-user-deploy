import { useState } from "react";
import FormModal from "../UiKits/Modals/VaryingContent/common/FormModal";

const InviteFriend = () => {
    const [modal, setModal] = useState(false)
    const toggle = () => setModal(!modal)
    const [email, setEmail] = useState("")
    const [number, setNumber] = useState()

    return (
        <>
            <span style={{ cursor: "pointer", fontSize: ".7rem", color: "var(--theme-default)" }} onClick={toggle}>Not on InstaPay? Invite Them Now.</span>
            <FormModal modal={modal} NewMessage={"Invite Friend"} toggle={toggle} email={email} setEmail={setEmail} number={number} setNumber={setNumber} />
        </>
    )
}

export default InviteFriend;