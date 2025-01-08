import { Card, Col, Row } from 'reactstrap';
import TopContainer from './TopContainer';
import SpecificQrTable from './SpecificQrTable';
import { useState } from 'react';
import ChipsInItemTable from './ItemTable';

const ChipsInContent = () => {
  const [showItemTable, setShowItemTable] = useState(false)
  const [tableItem, setTableItem] = useState()
  return (
    <Col>
      <Row>
        <TopContainer sti={setTableItem} ssit={setShowItemTable} />
        {
          showItemTable
            ?
            <ChipsInItemTable item={tableItem} ssit={setShowItemTable} />
            :
            <SpecificQrTable ssit={setShowItemTable} sti={setTableItem} />
        }
      </Row>
    </Col >
  );
};
export default ChipsInContent;