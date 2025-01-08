import { Breadcrumbs } from "../../../AbstractElements";
import LatestOfferCard from "./LatesOfferCard/LatestOfferCard";
import OrderList from "./OrderList/OrderList";
import ProfitCard from "./ProfitCard/ProfitCard";
import TotalSellingProduct from "./Total/TotalSellingProduct";
import { Container, Row } from "reactstrap";

// removed components
// import GoalOverview from "./GoalOverview/GoalOverview";
// import OrderStatics from "./OrderStatics/OrderStatics";
// import RecentActivity from "./RecentActivity/RecentActivity";

const Ecommerce = () => {
  return (
    <>
      <Breadcrumbs mainTitle="Ecommerce" parent="Dashboard" title="Ecommerce" />
      <Container fluid={true} className="dashboard-2">
        <Row>
          <ProfitCard />
          <TotalSellingProduct />
          {/* <GoalOverview /> */}
          {/* <RecentActivity /> */}
          {/* <OrderStatics /> */}
          <LatestOfferCard />
          <OrderList />
        </Row>
      </Container>
    </>
  );
};

export default Ecommerce;
