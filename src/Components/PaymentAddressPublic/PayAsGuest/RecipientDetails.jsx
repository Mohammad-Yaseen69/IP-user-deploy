import { useTranslation } from "react-i18next";
import DateMomentUtils from '@date-io/moment';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import ShippingDetails from "../../ReceiptInvoices/InvoicePaymentQr/ShippingDetails";
import PhoneInput from "../../PhoneInput";
import styles from "./styles/index.module.css";
import { toast } from "react-toastify";


const RecipientDetails = ({ data, dataHandler, isShipping, isReferenceRequired }) => {
    const { t } = useTranslation();



    const handleDateChange = (date) => {
        if (date) {
            const selected = new Date(date);
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - 15);
            if (selected <= minDate) {
                dataHandler("dob", date.format ? date.format("YYYY-MM-DD") : date.toISOString().split("T")[0]);
            } else {
                toast.error(t("Please select a date at least 15 years ago or earlier."));
            }
        } else {
            dataHandler("dob", "");
        }
    };
    return (
        <MuiPickersUtilsProvider utils={DateMomentUtils}>
            <div style={{ height: "100%", overflow: "auto" }}>
                <div className={styles.bot_top}>
                    <h5>{t("Personal Details")}</h5>
                    <span>
                        {t(
                            "Please finalize your payment by entering the required personal information."
                        )}
                    </span>
                </div>
                <div className={styles.personal}>
                    <div className={styles.inpt_co}>
                        <label>
                            {t("Full Name")} <span>*</span>{" "}
                        </label>
                        <input
                            type="text"
                            placeholder={t("Enter your Name")}
                            value={data.fullName}
                            onChange={(e) => dataHandler("fullName", e.target.value)}
                        />
                    </div>
                    <div className={styles.inpt_co}>
                        <label>
                            {t("Phone Number")} <span>*</span>{" "}
                        </label>
                        <PhoneInput
                            country={data.country?.alpha3}
                            setPhone={(e) => dataHandler("phone", e)}
                            disableDropdown={true}
                            phone={data.phone}
                        />
                        {data?.phone_error && (
                            <div style={{ color: "red", fontWeight: 500, marginTop: ".5rem" }}>
                                {t("Incorrect phone number, please enter a valid number.")}
                            </div>
                        )}
                    </div>
                    <div className={styles.inpt_co}>
                        <label>{t("Date of Birth")}*</label>
                        <DatePicker
                            required={true}
                            format="YYYY-MM-DD"
                            className="form-control custom-datepicker"
                            style={{ width: '100%' }}
                            value={data.dob || null}
                            onChange={handleDateChange}
                            placeholder="YYYY-MM-DD"
                            maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 15))}
                            disableFuture
                            InputProps={{
                                disableUnderline: true,
                                style: {
                                    background: '#fff',
                                    border: '1px solid #e9e9e9',
                                    borderRadius: '6px',
                                    boxShadow: 'none',
                                    padding: '0 10px',
                                    minHeight: '40px',
                                    fontWeight: 500,
                                }
                            }}
                            inputProps={{
                                style: {
                                    background: '#fff',
                                    border: 'none',
                                    boxShadow: 'none',
                                    padding: '2px 0px',
                                    minHeight: '40px',
                                }
                            }}
                            clearable
                            autoOk
                        />
                    </div>

                    {data.payment_type?.value === "card" &&
                        <>
                            <div className={styles.inpt_co}>
                                <label>
                                    {t("Customer Town")}
                                </label>
                                <input
                                    type="text"
                                    value={data.customerTown}
                                    onChange={(e) => dataHandler("customerTown", e.target.value)}
                                    required={data.payment_type?.value === "card"}
                                />
                            </div>
                            <div className={styles.inpt_co}>
                                <label>
                                    {t("Customer Street")}{" "}
                                </label>
                                <input
                                    type="text"
                                    value={data.customerStreet}
                                    onChange={(e) => dataHandler("customerStreet", e.target.value)}
                                    required={data.payment_type?.value === "card"}
                                />
                            </div>
                            <div className={styles.inpt_co}>
                                <label>
                                    {t("Customer Country")}{" "}
                                </label>
                                <input
                                    type="text"
                                    value={data.customer_county}
                                    onChange={(e) => dataHandler("customer_county", e.target.value)}
                                    required={data.payment_type?.value === "card"}
                                />
                            </div>
                        </>
                    }

                    <div className={styles.inpt_co}>
                        <label>
                            {isReferenceRequired ? `${t("Ucard Number or Sharer ID")}*` : t("Payment Reference")} {!isReferenceRequired && `(${t("Optional")})`}{" "}
                        </label>
                        <input
                            type="text"
                            value={data.paymentRef}
                            onChange={(e) => dataHandler("paymentRef", e.target.value.trim())}
                            required={isReferenceRequired}
                        />
                    </div>
                    <div className={styles.inpt_co}>
                        <label>
                            {t("Email")} ({t("Optional")}){" "}
                        </label>
                        <input
                            required={true}
                            type="email"
                            placeholder="ie: abc@gmail.com"
                            value={data.email}
                            onChange={(e) => dataHandler("email", e.target.value.trim())}
                        />
                        {!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                            data.email
                        ) && data.email.length > 0 ? (
                            <span
                                style={{
                                    fontWeight: "600",
                                    color: "red",
                                    padding: ".4rem .7rem",
                                }}
                            >
                                {t("Please enter a valid email address.")}
                            </span>
                        ) : (
                            ""
                        )}
                    </div>
                </div>
                {isShipping && <ShippingDetails data={data} dataHandler={dataHandler} />}
            </div>

        </MuiPickersUtilsProvider>
    );
};

export default RecipientDetails