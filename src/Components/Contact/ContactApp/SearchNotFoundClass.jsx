import { P } from '../../../AbstractElements';
// import search from '../../../assets/images/search-not-found.png';
import React, { Fragment } from 'react';
import { Col } from 'reactstrap';

// eslint-disable-next-line no-unused-vars
const SearchNotFoundClass = () => {
  return (
    <Fragment>
      <Col sm="12">
        <div>
          <div className="search-not-found text-center p-3">
            {/* <Image attrImage={{ src: `${search}`, alt: '', className: 'second-search', style: { display: 'inline' } }} /> */}
            <P attrPara={{ className: 'mb-0' }} >{'Sorry, Not Found Any Contact'}</P>
          </div>
        </div>
      </Col>
    </Fragment>
  );
};

export default SearchNotFoundClass;