import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import iso2 from "../AddFunds/WalletFund/countries_iso2.json"
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';

const getCities = async (iso2) => {
    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/country/get-cities/${iso2}`);
    return decryptData(res.data.data)?.data;
}

const CitiesDropDown = ({ userCity, setUserCity, disabled = false, iso_3 = "", isState, title = "Select City", stateData, background = "#fff", }) => {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false);
    const cityInputRef = useRef()
    const [searchTerm, setSearchTerm] = useState('');
    const iso2Value = useMemo(() => {
        return iso2[iso_3?.toUpperCase()]
    }, [iso2, iso_3])

    const { data: cities = [] } = useQuery({
        queryKey: ["GetCities", iso2Value],
        queryFn: () => getCities(iso2Value),
        staleTime: Infinity,
        cacheTime: Infinity,
        enabled: !!iso2Value,
    })


   
    const filtered = useMemo(() => {
        if (!searchTerm) return isState ? stateData : cities;
        return (isState ? stateData : cities)?.filter(item => item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())) || []
    }, [searchTerm, cities, stateData])

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                cityInputRef?.current?.focus();
            }, 500)
        } else {
            cityInputRef?.current?.blur()
        }
    }, [isOpen])

    const [renderCount, setRenderCount] = useState(100);
    const menuRef = useRef(null)
    const [reachedEnd, setReachedEnd] = useState(false);

    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting && !reachedEnd) {
            setRenderCount(prev => {
                const newCount = prev + 100;
                if (newCount >= filtered?.length) {
                    setReachedEnd(true);
                    return filtered?.length;
                }
                return newCount;
            });
        }
    }, [filtered, reachedEnd]);

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '20px',
            threshold: 0.1,
        });
        if (menuRef.current) {
            observer.observe(menuRef.current)
        }
        return () => {
            if (menuRef.current) observer.unobserve(menuRef.current)
        }
    }, [handleObserver])

    useEffect(() => {
        setRenderCount(100);
        setReachedEnd(false);
    }, [searchTerm, cities]);

    return (
        <Dropdown isOpen={isOpen} toggle={toggleDropdown}>
            <DropdownToggle color='white' style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", border: "1px solid rgba(0,0,0,.05)", borderRadius: "5px", padding: ".75rem", background: disabled ? "#eee" : background }} disabled={disabled}>
                {
                    isOpen
                        ?
                        <input style={{ border: "none", outline: "none", padding: 0, margin: 0, height: "100%", width: "100%", background: "transparent" }} placeholder={`Search ${isState ? "State" : "City"} `} ref={cityInputRef} onClick={(e) => e.stopPropagation()} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        :
                        <>
                            {userCity ? (
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <span style={{ fontWeight: 700 }}>{userCity}</span>
                                </div>
                            ) : <span style={{ color: "#a8a8a8" }}>{t(title)}</span>}
                        </>
                }

                {!disabled && <span>{ }</span>}

            </DropdownToggle>
            <DropdownMenu style={{ maxHeight: "350px", overflowY: "auto", overflowX: "auto", width: "100%" }}>
                {filtered?.length === 0 && searchTerm && !isState && (
                    <>
                        <div style={{ padding: '0.5rem 1rem', color: '#d9534f', fontWeight: 500, background: '#f6f6f6', borderBottom: '1px solid #f8f8f8' }}>
                            {t("If you can not find your city in the list just enter manually.")}
                        </div>
                        <DropdownItem
                            key="manual-entry"
                            onClick={() => {
                                setUserCity(searchTerm);
                                setIsOpen(false);
                                setSearchTerm("");
                            }}
                            style={{ color: '#5926F0', fontWeight: 700 }}
                        >
                            {t("Set city as")}: <span style={{ fontWeight: 700 }}>&apos;{searchTerm}&apos;</span>
                        </DropdownItem>
                    </>
                )}
                {
                    !isState && filtered?.slice(0, renderCount)?.map((item, idx) => (
                        <DropdownRenderItem key={idx} item={item} setItem={setUserCity} setSearchTerm={setSearchTerm} />
                    ))
                }
                {
                    isState && filtered?.map((item, idx) => (
                        <DropdownRenderItem key={idx} item={item} setItem={setUserCity} isState={isState} setSearchTerm={setSearchTerm} />
                    ))
                }
                {!reachedEnd && <div ref={menuRef} style={{ height: "1px" }} />}
            </DropdownMenu>
        </Dropdown>
    );
};

export default CitiesDropDown;


const DropdownRenderItem = ({ item, setItem, setSearchTerm, isState }) => {
    return (
        <DropdownItem key={item.code} onClick={() => {
            if (isState) {
                setItem(item?.name, item?.isoCode?.replace("US-", ""))
            } else {
                setItem(item?.name)
            }
            setSearchTerm("")
        }} style={{ opacity: 1, color: "black" }}>
            <div key={item.name} style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: ".5rem",
                cursor: "pointer",
                borderRadius: "10px"
            }}>
                <span style={{ fontWeight: 700 }}>{item?.name}</span>
            </div>
        </DropdownItem>
    )
}