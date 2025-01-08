import { Card } from "reactstrap";
import TotalProfitCardHeader from "./TotalProfitCardHeader";
import TotalProfitCardBody from "./TotalProfitCardBody";
import "./styles.css"

const TotalProfitCard = () => {
  return (
    <Card className="card profit-card hover-styles">
      <TotalProfitCardHeader />
      <TotalProfitCardBody />
    </Card>
  );
};

export default TotalProfitCard;
