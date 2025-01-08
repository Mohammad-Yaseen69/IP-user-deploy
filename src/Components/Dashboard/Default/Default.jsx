// import Ravanuechart from "./RevanueChart.jsx/index.jsx";
// import TotalUserCard from "./TotalUser/TotalUserCard.jsx";
import TotalGrowthCard from "./TotalGrowth/TotalGrowthCard.jsx";
// import { Breadcrumbs } from "../../../AbstractElements";
import { Container, Row } from "reactstrap";
import Statistics from "./Statistics/Statistics.jsx";
import AccountsCard from "./Accounts/AccountCard.jsx";


// removed components
// import TotalEarning from "./TotalEarning/TotalEarning.jsx";
// import Greetingcard from "./GreetingCard";
// import AppoimentCard from "./Appoiment/AppoimentCard.jsx";
// import RecentActivity from "./RecentActivity/RecentActivity.jsx";
// import CountryCard from "./Country/Country.jsx";
// import ChatCard from "./Chat/ChatCard.jsx";
// import TodoList from "./Todo/TodoList.jsx";


const Default = () => {
  return (
    <>
      {/* <Breadcrumbs mainTitle="Default" parent="Dashboard" title="Default" /> */}
      <Container fluid={true} className="dashboard-default dashboard-2">
        <Row>
          <AccountsCard />
          <Statistics />
          <TotalGrowthCard />
          {/* <Greetingcard /> */}
          {/* <Ravanuechart />
          <TotalUserCard /> */}
          {/* <TotalEarning /> */}
          {/* <AppoimentCard /> */}
          {/* <CountryCard /> */}
          {/* <RecentActivity />
          <ChatCard />
          <TodoList /> */}
        </Row>
      </Container>
    </>
  );
};

export default Default;
