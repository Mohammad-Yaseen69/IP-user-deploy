import React, { useContext, useState } from 'react';
import countries from "./PaymentsNewer/CountriesData.json";
import { UserContext } from '../Context/UserContext';
import axios from 'axios';
import { decryptData } from '../Helper/EssentilaMethods/Decryption';
import FileSaver from 'file-saver';
import { service_name_formatter } from './TransactionsNewApi/TransactionItem';

const TempCountriesBankFields = () => {
    const { authHeader } = useContext(UserContext);
    const [data, setData] = useState([]);
    const [service, setService] = useState("1")
    const [filename, setFileName] = useState("")
    const [dataType, setDataType] = useState("all")

    const getData = async (country) => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/thunes/get-required-fields-by-country/${country?.alpha3}/${service}/C2C`, {
                headers: authHeader
            });

            const dec = decryptData(res.data.data);
            return { ...dec?.data, country };
        } catch (error) {
            const dec = decryptData(error.response.data.data);
            if (dec?.message === "Unauthorize to access this route") {
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                window.location.pathname = "/auth/login";
            }
            return null;
        }
    };

    const buttonClick = async () => {
        setData([])
        const results = await Promise.all(countries.map(country => getData(country)));
        const filteredResults = results.filter(result => result !== null);
        setData(dataType === "all" ? filteredResults : new Set(filteredResults.flatMap(item => item?.[dataType])));

        // Create a blob from the data
        const blob = new Blob([JSON.stringify(filteredResults, null, 2)], { type: 'application/json' });

        // Save the blob as a file
        FileSaver.saveAs(blob, `${filename}.json`);
    };

    return (
        <div>
            <input type="text" value={filename} onChange={e => setFileName(e.target.value)} />
            <div>
                <label>Data Type</label>
                <select value={service} onChange={e => setService(e.target.value)}>
                    <option value="all">All</option>
                    <option value="required_receiving_entity_fields">{service_name_formatter("required_receiving_entity_fields")}</option>
                    <option value="required_sending_entity_fields">{service_name_formatter("required_sending_entity_fields")}</option>
                    <option value="credit_party_identifiers_accepted">{service_name_formatter("credit_party_identifiers_accepted")}</option>
                    <option value="credit_party_information">{service_name_formatter("credit_party_information")}</option>
                    <option value="credit_party_verification">{service_name_formatter("credit_party_verification")}</option>
                </select>
            </div>
            <div>
                <label>Service</label>
                <select value={service} onChange={e => setService(e.target.value)}>
                    <option value="1">Mobile</option>
                    <option value="2">Bank</option>
                    <option value="3">Cash</option>
                    <option value="4">Card</option>
                </select>
            </div>
            <button onClick={buttonClick} disabled={!filename}>Get Data</button>
            <div>
                <p>Service: {service}</p>
                <p>Completed: {data.length} / {countries.length}</p>
            </div>
        </div>
    );
};

export default TempCountriesBankFields;