import React from 'react';
import { Card, CardBody, CardHeader, Col, Container, Table } from 'reactstrap';
import { Btn } from '../../AbstractElements';
import { useTranslation } from 'react-i18next';

const ChipsInItemTable = ({ item, ssit }) => {
    const { t } = useTranslation()
    return (
        <Col xl="12">
            <Card>
                <CardHeader className="pb-0">
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                        position: "relative",
                        marginBottom: "1rem"
                    }}>
                        <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                            <h4>{item.name}</h4>
                            |
                            <p style={{ color: "inherit", fontSize: "14px", fontWeight: "600", margin: 0 }}>{t("Total incoming amount:")} {item.total_amount}</p>
                        </div>
                        <form style={{
                            margin: 0,
                            padding: 0,
                            minWidth: "150px",
                            maxWidth: "300px"
                        }}>
                            <input type="text" className="form-control" placeholder='Search items' style={{ margin: 0, width: "100%" }} />
                        </form>
                    </div>

                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                        position: "relative"
                    }}>
                        <Btn
                            attrBtn={{
                                color: "primary",
                                type: "button",
                                style: {
                                    borderRadius: "10px",
                                    marginLeft: "10px",
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    outline: "none",
                                    border: "none",
                                },
                                onClick: () => ssit(false)
                            }}
                        >
                            {t("Go Back")}
                        </Btn>
                    </div>
                </CardHeader>
                <CardBody>
                    <Container style={{ maxWidth: "700px", margin: 0 }}>
                        <Table style={{ border: "1px solid rgba(128,128,128,.1)", borderCollapse: "collapse", borderRadius: "10px" }}>
                            <thead>
                                <tr>
                                    <th>{t("Payer Name")}</th>
                                    <th>{t("Time and Date")}</th>
                                    {
                                        item.type === "General"
                                        &&
                                        <th>{t("Amount")}</th>
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>John Doe</td>
                                    <td>2023-05-19 10:30</td>
                                    {
                                        item.type === "General"
                                        &&
                                        <td>$100</td>
                                    }
                                </tr>
                                <tr>
                                    <td>Jane Smith</td>
                                    <td>2023-05-18 14:15</td>
                                    {
                                        item.type === "General"
                                        &&
                                        <td>$50</td>
                                    }
                                </tr>
                            </tbody>
                        </Table>
                    </Container>
                </CardBody>
            </Card>
        </Col>
    );
};

export default ChipsInItemTable;
