import { Card, CardBody, CardHeader } from 'reactstrap';
import { AccountsData } from './AccountsData';
import AccountItem from './AccountItem';
import { useTranslation } from 'react-i18next';

const Accounts = () => {
    const { t } = useTranslation()
    return (
        <Card>
            <CardHeader>
                <div>
                    <h4>{t("Social Network Accounts")}</h4>
                    <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300" }}>{t("Here, you can set up and manage your integration settings.")}</p>
                </div>
            </CardHeader>
            <CardBody>
                {
                    AccountsData.map(data => {
                        return (
                            <AccountItem key={data.name} data={data} />
                        )
                    })
                }
            </CardBody>
        </Card>
    )
}

export default Accounts