import React, { useContext, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import AddNominee from './AddNominee';
import NomineeDetails from './NomineeDetails';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';

const Nominee = () => {
    const { t } = useTranslation()

    const [nominee, setNominee] = useState({})
    const [addNominee, setAddNominee] = useState(false)

    // context
    const { authHeader, userDetails } = useContext(UserContext)


    useEffect(() => {
        const getNomineeDetails = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/nominee/get-nominee/${userDetails?._id}`, {
                    headers: authHeader
                })
                const decrypted = await decryptData(res.data.data)
                setNominee(decrypted?.nomineeDetails)

            } catch (err) {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
            }
        }
        if (userDetails) {
            getNomineeDetails()
        }
    }, [userDetails])

    return (
        <Card>
            <CardHeader>
                <h4>{t("Nominee")}</h4>
            </CardHeader>
            <CardBody>
                {
                    nominee?.full_name
                        ?
                        <NomineeDetails nominee={nominee} setNominee={setNominee} />
                        :
                        <>
                            {
                                addNominee
                                    ?
                                    <AddNominee setNominee={setNominee} setAddNominee={setAddNominee} />
                                    :
                                    <div style={{ display: "flex", alignItems: "center", flexDirection: "column", gap: "10px" }}>
                                        <p style={{ textAlign: "center" }}>{t("You may elect a Nominee of your choice, provided they are not a minor, through the InstaPay platform itself. You acknowledge that no wet signature is required to \nappoint the nominee, and the online registration will be considered final and binding. In the event of the death of an InstaPay Wallet holder, the balance in the Wallet \nwill be transferred to the registered Nominee. KEMIT KINGDOM will be discharged from all its liabilities upon the handover of the amount to the Nominee. The Nominee \nwill provide any documents required by InstaPay, including those for identification and proof of death.")}</p>
                                        <Button style={{
                                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                            border: "none",
                                            outline: "none",
                                            borderRadius: "10px"
                                        }} onClick={() => setAddNominee(true)}>
                                            {t("Add Nominee")}
                                        </Button>
                                    </div>
                            }
                        </>
                }
            </CardBody>
        </Card>
    )
}

export default Nominee