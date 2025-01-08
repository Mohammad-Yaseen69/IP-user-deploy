import React from 'react'
import { Card, CardHeader, Col } from 'reactstrap'
import { H4 } from '../../AbstractElements'

const NewTransaction = () => {
    return (
        <Col>
            <Card>
                <CardHeader>
                    <H4>Quick Transaction</H4>
                    <hr />
                </CardHeader>
            </Card>
        </Col>
    )
}

export default NewTransaction