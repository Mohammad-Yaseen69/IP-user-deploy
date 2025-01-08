import { CardHeader } from "reactstrap";
import { H4, P } from "../../../../AbstractElements";

const TotalGrowthCardHeader = () => {
  return (
    <CardHeader className="pb-0">
      <div className="d-flex justify-content-between">
        <div className="flex-grow-1" style={{ maxWidth: "max-content" }}>
          <P attrPara={{ className: "square-after f-w-600 header-text-primary" }}>
            Monthly Income:
            <i className="fa fa-circle f-10"> </i>
          </P>
          <H4>$600,000</H4>
        </div>
        <div className="flex-grow-1" style={{ maxWidth: "max-content" }}>
          <P attrPara={{ className: "square-after f-w-600 header-text-primary" }}>
            Monthly Sales:
            <i className="fa fa-circle f-10"> </i>
          </P>
          <H4>$1,000,000</H4>
        </div>
        <div className="flex-grow-1" style={{ maxWidth: "max-content" }}>
          <P attrPara={{ className: "square-after f-w-600 header-text-primary" }}>
            Monthly Expense:
            <i className="fa fa-circle f-10"> </i>
          </P>
          <H4>$400,000</H4>
        </div>
      </div>
    </CardHeader>
  );
};

export default TotalGrowthCardHeader;