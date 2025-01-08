// import CashonDelivery from './Cod';
// import CreditCards from './CreditCard';
// import DebitCards from './DebitCard';
// import EMIs from './Emi';
// import NetBankings from './NetBanking';
import { Breadcrumbs } from '../../AbstractElements';
import { Container, Row } from 'reactstrap';
import React, { Fragment } from 'react';
import TransactionCards from './Table/TransactionCard';

const Transactions = () => {
  return (
    <Fragment>
      <Breadcrumbs mainTitle="Transactions" title="Transactions" />
      <Container fluid={true} className="credit-card payment-details">
        <Row>
          {/* <NewTransaction /> */}
          {/* <CreditCards /> */}
          {/* <DebitCards /> */}
          {/* <CashonDelivery /> */}
          {/* <EMIs /> */}
          {/* <NetBankings /> */}
          <TransactionCards />
        </Row>
      </Container>
    </Fragment>
  );
};
export default Transactions;