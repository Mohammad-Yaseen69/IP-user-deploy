import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import iso2 from '../../../AddFunds/WalletFund/countries_iso2.json';
import { decryptData } from '../../../../Helper/EssentilaMethods/Decryption';

const getStates = async (iso2Code) => {
    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/country/get-states/${iso2Code}`);
    return decryptData(res.data.data)?.data;
};

export const useCountryStates = (countryIso3) => {
    const iso2Code = iso2[String(countryIso3 || '').toUpperCase()];

    return useQuery({
        queryKey: ['GetStates', iso2Code],
        queryFn: () => getStates(iso2Code),
        staleTime: Infinity,
        cacheTime: Infinity,
        enabled: !!iso2Code,
    });
};

export default useCountryStates;
