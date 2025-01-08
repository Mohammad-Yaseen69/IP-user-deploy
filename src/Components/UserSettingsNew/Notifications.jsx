import { Card, CardBody, CardHeader } from 'reactstrap'
import { H4 } from '../../AbstractElements'
import NotifTable from './NotifTable'
import { useTranslation } from 'react-i18next';

const Notifications = () => {
    const { t } = useTranslation()

    return (
        <Card id='notifications'>
            <CardHeader className={`pb-0 expanded`}>
                <div>
                    <H4 attrH4={{ className: 'card-title mb-0' }}>{t("Notifications")}</H4>
                    <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300" }}>{t("Choose how you receive notifications. These notification settings apply to the things you’re watching.")}</p>
                </div>
            </CardHeader>
            <div className={`accordion-body expanded`}>
                <CardBody style={{
                    overflowX: "auto"
                }}>
                    <NotifTable />
                </CardBody>
            </div>
        </Card>
    )
}

export default Notifications