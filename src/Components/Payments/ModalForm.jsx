import React from 'react';
import { Form, FormGroup, Input, Label } from 'reactstrap';
import AddBeneficiaryModal from './AddBeneficiaryModal';

const ModalForm = ({ modal, toggle }) => {
    return (
        <AddBeneficiaryModal isOpen={modal} title={"Add Beneficiary"} toggler={toggle} buttonOneText="Cancel" buttonTwoText="Add" >
            <Form>
                <FormGroup>
                    <Label className="col-form-label" for="recipient-name">Name</Label>
                    <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                        <Input className="form-control" type="text" placeholder='First name' required />
                        <Input className="form-control" type="text" placeholder='Middle name' required />
                        <Input className="form-control" type="text" placeholder='Last name' required />
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label className="col-form-label" for="recipient-name">Bank Details</Label>
                    <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                        <Input className="form-control" type="text" placeholder='Bank name' required />
                        <Input className="form-control" type="text" placeholder='Branch name' required />
                        <Input className="form-control" type="text" placeholder='Account number' required />
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label className="col-form-label" for="recipient-name">Address</Label>
                    <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                        <Input className="form-control" type="text" placeholder='Address line' required />
                        <Input className="form-control" type="text" placeholder='City/Town' required />
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label className="col-form-label" for="recipient-name">Contact Details</Label>
                    <Input className="form-control" type="text" placeholder='Mobile Number' required />
                </FormGroup>
            </Form>
        </AddBeneficiaryModal>

    );
};

export default ModalForm;