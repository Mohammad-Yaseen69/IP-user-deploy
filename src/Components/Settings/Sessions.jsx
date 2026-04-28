import React, { useContext, useEffect, useMemo } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { H4 } from '../../AbstractElements'
import SessionItem from './SessionItem'
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../Context/UserContext';

const Sessions = () => {
    const { t } = useTranslation()
    const { userSessions } = useContext(UserContext)

    return (
        <Card>
            <CardHeader>
                <div>
                    <h4>{t("Sessions")}</h4>
                    <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300" }}>{t("This is a list of devices that have logged into your account.")}</p>
                </div>
            </CardHeader>
            <CardBody style={{
                maxHeight: "700px",
                overflowY: "auto"
            }}>
                {
                    userSessions.length > 0
                        ?
                        userSessions.map((session, index) => {
                            return <SessionItem key={session._id} session={session} index={index} />
                        })
                        : ""
                }
            </CardBody>
        </Card>
    )
}

export default Sessions