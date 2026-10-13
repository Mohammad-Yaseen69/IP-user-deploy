import { useState } from "react";
import "./Form.css";

const Form = () => {
  const [recipientType, setRecipientType] = useState("individual");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [iban, setIban] = useState("DE89 3704 0044 0532 0130 00");
  const [reference, setReference] = useState("Invoice 2026-0341");
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);

  return (
    <div className="form-container">
      <div className="header">
        <p>{"Who are you paying? "}</p>
        <strong>{"Sending €2,500.00"}</strong>
      </div>
      <div className="tabs-container">
        <button
          className={`tab-button ${recipientType === "individual" ? "active" : ""}`}
          onClick={() => setRecipientType("individual")}
          type="button"
        >
          Individual
        </button>
        <button
          className={`tab-button ${recipientType === "business" ? "active" : ""}`}
          onClick={() => setRecipientType("business")}
          type="button"
        >
          Business
        </button>
      </div>

      <div className="row-group">
        <div className="input-group">
          <label>First name *</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Last name *</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="input-group">
        <label>IBAN *</label>
        <input
          type="text"
          value={iban}
          onChange={(e) => setIban(e.target.value)}
        />
        <div className="field-helper">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="#039855"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Germany - Euro area IBAN</span>
        </div>
      </div>

      <div className="success-banner">
        <div className="success-text">
          <h4>
            {" "}
            <div className="success-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.3333 4L5.99992 11.3333L2.66658 8"
                  stroke="#027A48"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>{" "}
            Name matches the account
          </h4>
          <p>Verification of name confirmed with the recipient's bank</p>
        </div>
      </div>

      <div className="read-only-group">
        <label>BIC / SWIFT (optional - needed then IBAN)</label>
        <div className="read-only-value">DELTDEFF</div>
        <div className="bank-info">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#475467"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <span>Deutsche Bank - Frankfurt, DE</span>
        </div>
      </div>

      <div className="input-group">
        <label>Reference (visible to recipient) - required</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </div>

      <div className="toggle-container">
        <div
          className={`toggle-switch ${saveBeneficiary ? "active" : ""}`}
          onClick={() => setSaveBeneficiary(!saveBeneficiary)}
        >
          <div className="toggle-knob"></div>
        </div>
        <span className="toggle-label">
          Save this beneficiary for next time
        </span>
      </div>

      <div className="form-footer">
        <button type="button" className="btn-cancel">
          Cancel
        </button>
        <div className="footer-right">
          <button type="button" className="btn-back">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>
          <button type="button" className="btn-next">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form;
