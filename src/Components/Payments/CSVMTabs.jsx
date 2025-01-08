import React, { useState } from 'react';
import { Button } from 'reactstrap';
import xml from "./files/xml.png"
import json_img from "./files/json.png"
import txt from "./files/txt.png"
import xls from "./files/xlsx.jpeg"
import csv_img from "./csv.jpeg";

const CSVMTabs = () => {
    const [activeTab, setActiveTab] = useState('CSV');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const data = [
        {
            name: "CSV",
            info: "A comma-separated values file is a delimited text file that uses a comma to separate values. Each line of the file is a data record.",
            img: csv_img,
            file: "files/abc.csv"
        },
        {
            name: "TXT",
            info: "A text file is a kind of computer file that is structured as a sequence of lines of electronic text. A text file exists stored as data within a computer file system.",
            img: txt,
            file: "files/abc.txt"
        },
        {
            name: "JSON",
            info: "JSON is an open standard file format and data interchange format that uses human-readable text to store and transmit data objects consisting of attribute–value pairs and arrays.",
            img: json_img,
            file: "files/abc.json"
        },
        {
            name: "XML",
            info: "Extensible Markup Language is a markup language and file format for storing, transmitting, and reconstructing arbitrary data. It defines a set of rules for encoding documents in a format that is both human-readable and machine-readable.",
            img: xml,
            file: "files/abc.xml"
        },
        {
            name: "XLS/XLSX",
            info: "The XLSX, XLS file extensions are used for Microsoft Excel spreadsheets, part of the Microsoft Office Suite of software. XLSX/XLS files are used to store and manage data such as numbers, formulas, text, and drawing shapes.",
            img: xls,
            file: "files/abc.xls"
        },
    ]

    const filtered = data.filter(item => item.name === activeTab)[0]

    return (
        <div>
            <h5 className='text-center mb-2'>View example formats of supported files.</h5>
            <div style={{ display: "flex", marginBottom: "1rem" }}>
                <Button color='transparent' onClick={() => handleTabClick('CSV')}
                    style={{
                        background: activeTab === "CSV"
                            ?
                            "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
                            :
                            "linear-gradient(to right bottom, #e640674d, #5926f04d, #4828a04d)"
                        ,
                        color: activeTab === "CSV" ? "white" : "initial",
                        border: "none",
                        outline: "none",
                        borderRadius: "5px",
                        padding: ".3rem .75rem",
                        flex: 1
                    }}>
                    CSV
                </Button>
                <Button color='transparent' onClick={() => handleTabClick('TXT')}
                    style={{
                        background: activeTab === "TXT"
                            ?
                            "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
                            :
                            "linear-gradient(to right bottom, #e640674d, #5926f04d, #4828a04d)"
                        ,
                        color: activeTab === "TXT" ? "white" : "initial",
                        border: "none",
                        outline: "none",
                        borderRadius: "5px",
                        padding: ".3rem .75rem",
                        flex: 1
                    }}>
                    TXT
                </Button>
                <Button color='transparent' onClick={() => handleTabClick('JSON')}
                    style={{
                        background: activeTab === "JSON"
                            ?
                            "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
                            :
                            "linear-gradient(to right bottom, #e640674d, #5926f04d, #4828a04d)"
                        ,
                        color: activeTab === "JSON" ? "white" : "initial",
                        border: "none",
                        outline: "none",
                        borderRadius: "5px",
                        padding: ".3rem .75rem",
                        flex: 1
                    }}>
                    JSON
                </Button>
                <Button color='transparent' onClick={() => handleTabClick('XML')}
                    style={{
                        background: activeTab === "XML"
                            ?
                            "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
                            :
                            "linear-gradient(to right bottom, #e640674d, #5926f04d, #4828a04d)"
                        ,
                        color: activeTab === "XML" ? "white" : "initial",
                        border: "none",
                        outline: "none",
                        borderRadius: "5px",
                        padding: ".3rem .75rem",
                        flex: 1
                    }}>
                    XML
                </Button>
                <Button color='transparent' onClick={() => handleTabClick('XLS/XLSX')}
                    style={{
                        background: activeTab === "XLS/XLSX"
                            ?
                            "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
                            :
                            "linear-gradient(to right bottom, #e640674d, #5926f04d, #4828a04d)"
                        ,
                        color: activeTab === "XLS/XLSX" ? "white" : "initial",
                        border: "none",
                        outline: "none",
                        borderRadius: "5px",
                        padding: ".3rem .75rem",
                        flex: 1
                    }}>
                    XLS/XLSX
                </Button>
            </div>
            <div>
                <p>{filtered.info}</p>
                <div
                    style={{
                        position: "relative",
                        margin: "1rem auto 0",
                        borderRadius: "10px",
                    }}
                >
                    <img src={filtered.img} width={"100%"} alt={filtered.info} style={{ borderRadius: "20px" }} />
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            background: "linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))",
                        }}
                    />
                </div>
                {/* <img src={filtered.img} alt={filtered.info} width={"100%"} style={{ borderRadius: "20px" }} draggable="false" /> */}
                <div className='text-end mt-2'>
                    <a href={`/${filtered.file}`} download style={{
                        fontSize: ".8rem",
                        fontWeight: 600,
                        textDecoration: "underline",
                    }}>Download Sample File.</a>
                </div>
            </div>
        </div>
    );
};

export default CSVMTabs;