import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, FormGroup, Input } from 'reactstrap';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const {t} = useTranslation();
  const handleChange = (event) => {
    event.preventDefault();
    setSearchTerm(event.target.value);
  };
  return (
    <Fragment>
      <Form className="form-inline">
        <FormGroup className="d-flex m-0">
          <i className="fa fa-search"></i>
          <Input
            className="form-control-plaintext form-control p-1 border-0"
            type="text"
            value={searchTerm}
            onChange={(e) => handleChange(e)}
            placeholder={t("Search...")}
          />
        </FormGroup>
      </Form>
    </Fragment>
  );
};
export default SearchBar;
