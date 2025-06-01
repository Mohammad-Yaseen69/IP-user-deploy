import React, { useState } from 'react'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'

const DataDecrypt = () => {
    const [str, setStr] = useState("")
    const [data, setData] = useState("")
    return (
        <>
            <div>
                <input
                    type="text"
                    value={str}
                    onChange={a => setStr(a.target.value)}
                />
                <button onClick={() => {
                    const dec = decryptData(str)
                    console.log(dec)
                    setData(JSON.stringify(dec))
                }}>
                    Decrypt
                </button>
            </div>
            <div>
                {data}
            </div>
        </>
    )
}

export default DataDecrypt