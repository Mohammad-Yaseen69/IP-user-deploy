import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';
import { apiWrapper } from '../../../utils/Functions/apiWrapper';
import { useContext } from 'react';
import { UserContext } from '../../../Context/UserContext';

const useGetAllChannelPayers = ({ data, payoutChannelData, toggleModalHandler }) => {
    const {userDetails} = useContext(UserContext)

    const { data: services = [], isLoading, isFetching } = useQuery({
        queryKey: ['ServicesWithPayers', data?.country?.alpha3, data?.flow],
        queryFn: async () => {
            if (!data?.country?.alpha3 || !data?.flow) {
                return [];
            }

            const decrypted = await apiWrapper({
                endpoint: `/api/payment/services/${data.country.alpha3}/${data?.userCountryCode}`,
            })

            const mappedServices = decrypted?.services?.map(item => {
                const serviceName = item?.method?.split(" - ")?.[0]?.toLowerCase()
                const updatedServiceName = serviceName === "cards" ? "payment card" : serviceName
                const channelData = payoutChannelData?.find(it => it?.name?.toLowerCase() === updatedServiceName);
                return {
                    ...item,
                    ...channelData,
                    vendor: item?.method?.split(" - ")?.[1]?.toLowerCase()
                };
            }) || [];

            console.log(decrypted, mappedServices, "mapped services")

            if (mappedServices.length === 0) {
                return [];
            }

            const payerPromises = mappedServices.map(service =>
                apiWrapper({
                    endpoint: "/api/payment/payers",
                    isEncrypted: false,
                    method: "POST",
                    payload: {
                        country: data.country.alpha3,
                        service: service?.name,
                        vendor: service?.vendor,
                        transaction_type: data?.flow
                    }
                })
                    .then((dec) => {
                        let payers = [];

                        if (Array.isArray(dec) && dec.length > 0) {
                            payers = dec.map(item => {
                                const types = Object.keys(item?.transaction_types || {});
                                return {
                                    ...item,
                                    icon: service?.icon,
                                    payerTransactionTypes: types,
                                    serviceId: service?.id
                                };
                            });
                        }

                        if (dec?.destinations && Array.isArray(dec.destinations) && dec.destinations.length > 0) {
                            payers = dec.destinations.map(p => ({
                                country_iso_code: p?.country,
                                id: p?.destinationId,
                                name: p?.destinationName,
                                currency: p?.currencies?.[0],
                                precision: p?.destinationType,
                                icon: service?.icon,
                                serviceId: service?.id
                            }));
                        }

                        payers = payers.filter((payer) => {
                            if (payer?.name?.toLowerCase() === "moncash") {
                                return userDetails?.country_iso_code === "CAN" || userDetails?.country_iso_code === "CHE"
                            } else {
                                return true
                            }
                        })

                        console.log(payers, "this is payer")

                        return {
                            service,
                            payers
                        };
                    })
                    .catch(() => ({
                        service,
                        payers: []
                    }))
            );

            const results = await Promise.all(payerPromises);

            console.log(results)

            const servicesWithPayers = results
                .filter(result => result.payers.length > 0)
                .map(result => ({
                    ...result.service,
                    payers: result.payers
                }));


            return servicesWithPayers;
        },
        enabled: !!data?.country?.alpha3 && !!data?.flow,
    });

    return {
        services,
        isLoading: isLoading || isFetching
    };
};

export default useGetAllChannelPayers;