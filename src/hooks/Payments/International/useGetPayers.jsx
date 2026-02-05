import { useQuery } from '@tanstack/react-query';
import { apiWrapper } from '../../../utils/Functions/apiWrapper';

const useGetPayers = ({ data, dataHandler }) => {
    const { isLoading } = useQuery({
        queryKey: ['InternationalPayers', data?.country.alpha3, data?.payoutChannel?.name, data.payoutChannel?.vendor],
        queryFn: () => apiWrapper({
            endpoint: "/api/payment/payers",
            isEncrypted: false,
            method: "POST",
            payload: {
                country: data?.country.alpha3,
                service: data?.payoutChannel?.name,
                vendor: data?.payoutChannel?.vendor,
                transaction_type: data?.flow
            }
        }).then((dec) => {
            console.log(dec)

            if (Array.isArray(dec)) {

                if(dec.length === 0){
                    dataHandler("error", `No ${data.flow} payers found in ${data.country?.name ?? "your selected country"} with ${data.payoutChannel?.name ?? ""}`)
                }

                dataHandler("payers", dec?.map(item => {
                    const types = Object.keys(item?.transaction_types)

                    return {
                        ...item,
                        icon: data?.payoutChannel?.icon,
                        payerTransactionTypes: types
                    }
                }));
            }

            if (dec?.destinations) {
                const payers = dec?.destinations?.map(p => ({
                    country_iso_code: p?.country,
                    id: p?.destinationId,
                    name: p?.destinationName,
                    currency: p?.currencies[0],
                    precision: p?.destinationType,
                    icon: data?.payoutChannel?.icon
                }))

                console.log(payers)

                if (payers.length === 1) {
                    dataHandler("payer", payers[0])
                }

                dataHandler("payers", payers);
            }

            if (dec.length === 1) {
                dataHandler("payer", { ...dec?.[0], icon: data?.payoutChannel?.icon })
            }
        }).catch(() => {
            dataHandler("payers", [])
        }),
        enabled: !!data?.country?.alpha3 && !!data?.payoutChannel?.name && !!data?.payoutChannel?.vendor,
        retry: 3
    })


    return { isLoading }
}

export default useGetPayers
