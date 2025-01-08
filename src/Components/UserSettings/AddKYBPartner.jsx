import { Search } from "react-feather"
import { Input } from "reactstrap"
import { useTranslation } from "react-i18next"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../Context/UserContext"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import axios from "axios"
import InstaPayLoader from "../Loader"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import SearchedUserCard from "./SearchedUserCard"

const AddKYBPartner = ({ setPartners }) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [searchInFocus, setSearchInFocus] = useState(false);
    const { authHeader, userDetails } = useContext(UserContext);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [isLoading, setIsLoading] = useState(false)
    const [users, setUsers] = useState([])

    useEffect(() => {
        setIsLoading(true)
        const searchUser = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_IP_DEV_API}/api/account/search-users/${search}`,
                    {
                        headers: authHeader,
                    }
                );
                const data = await decryptData(response.data.data);
                // console.log(data)
                setUsers(data?.users);
                setIsLoading(false)
            } catch (error) {
                // console.log(decryptData(error.response.data.data));
                setIsLoading(false)
            }
        };

        // Clear the previous timeout
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Set a new timeout for 2 seconds
        if (search.length > 0) {
            const timeoutId = setTimeout(() => {
                searchUser();
            }, 1500);

            setDebounceTimeout(timeoutId);
        }
    }, [search, authHeader]);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            background: "#FFF",
            boxShadow: "0px 4.32752px 35.70205px 0px rgba(0, 0, 0, 0.06)",
            padding: ".5rem 1rem",
            borderRadius: "10px",
            height: "50px",
            flex: 1,
            position: "relative",
            marginBottom: "1.5rem"
        }}>
            <Search />
            <Input onFocus={() => setSearchInFocus(true)} type='search' placeholder={t(`Add New Partner`)} style={{ padding: ".5rem 1rem", border: "none", outline: "none" }} value={search} onChange={e => setSearch(e.target.value)} />
            {
                searchInFocus
                &&
                <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    height: "fit-content",
                    minHeight: "100px",
                    maxHeight: "400px",
                    overflowY: "auto",
                    zIndex: 100,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "10px",
                    background: "white",
                    gap: ".5rem",
                    boxShadow: "0px 0px 3px #1111113e"
                }}>
                    {
                        !search
                            ?
                            <div style={{ padding: "1rem 3.5rem", background: "white", fontSize: "15px", fontWeight: "600" }}>
                                Search users here
                            </div>
                            :
                            <>
                                {
                                    isLoading
                                        ?
                                        <div style={{ height: "100px", width: "100px", margin: "0 auto" }}>
                                            <InstaPayLoader />
                                        </div>
                                        :
                                        <>
                                            {
                                                users?.length > 0
                                                    ?
                                                    users.map(user => (
                                                        <SearchedUserCard key={user?._id} setPartners={setPartners} user={user} userDetails={userDetails} setSearchInFocus={setSearchInFocus} authHeader={authHeader} />
                                                    ))
                                                    :
                                                    <div style={{ padding: "1rem 3.5rem", background: "white", fontSize: "15px", fontWeight: "600" }}>
                                                        No User Found
                                                    </div>
                                            }
                                        </>
                                }
                            </>
                    }
                </div>
            }
        </div>
    )
}

export default AddKYBPartner