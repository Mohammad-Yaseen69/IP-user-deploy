import React from 'react';
import { Form, FormGroup, Input, Label } from 'reactstrap';
import CommonModal from '../../common/modal';

const FormModal = ({ modal, NewMessage, toggle, email, setEmail, number, setNumber }) => {
  return (
    <CommonModal isOpen={modal} title={NewMessage} toggler={toggle} buttonOneText="Cancel" buttonTwoText="Invite" >
      <Form>
        <FormGroup>
          <Label className="col-form-label" for="recipient-name">Friend's Email</Label>
          <Input className="form-control" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label className="col-form-label" for="recipient-name">Friend's Mobile Number</Label>
          <Input className="form-control" type="text" required value={number} onChange={(e) => setNumber(e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label className="col-form-label" for="message-text">Enter Message</Label>
          <Input type="textarea" className="form-control" id="message-text"></Input>
        </FormGroup>
      </Form>
    </CommonModal>

  );
};

export default FormModal;