import { useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiWrapper } from '../../../../utils/Functions/apiWrapper';
import { UserContext } from '../../../../Context/UserContext';
import {
    getBvnkRequirements,
    getThunesRequirements,
    resolveTransactionType,
} from './vendorFields';
import { BVNK_METHODS, THUNES_DESTINATION_TYPE, methodFromServiceName } from './constants';

export const useAvailableMethods = (countryIso3) => {
    const { userDetails } = useContext(UserContext);
    const senderIso3 = userDetails?.country?.country_iso_code || userDetails?.country_iso_code;

    const { data, isFetching, error } = useQuery({
        queryKey: ['abfServices', countryIso3, senderIso3],
        queryFn: () =>
            apiWrapper({
                endpoint: `/api/payment/services/${countryIso3}/${senderIso3}`,
                method: 'GET',
                isDecrypted: true,
            }),
        enabled: !!countryIso3 && !!senderIso3,
        staleTime: 5 * 60 * 1000,
    });

    const methods = useMemo(() => {
        const services = data?.services || [];

        const transfer = services
            .map((service) => {
                const [name, vendor] = String(service.method || '').split(' - ');
                const method = methodFromServiceName(name);
                if (!method) return null;
                return {
                    value: method,
                    serviceId: service.id,
                    serviceName: name?.trim(),
                    vendor: (vendor || 'thunes').trim().toLowerCase(),
                };
            })
            .filter(Boolean);

        return { transfer, virtualIban: BVNK_METHODS };
    }, [data]);

    return { methods, isLoading: isFetching, error };
};

export const useRequiredFields = ({ countryIso3, serviceId, method, recipientType, enabled = true }) => {
    const { userDetails } = useContext(UserContext);
    const transactionType = resolveTransactionType(userDetails?.account_type, recipientType);
    const destinationType = THUNES_DESTINATION_TYPE[method] ?? serviceId;

    const { data, isFetching, error } = useQuery({
        queryKey: ['abfRequiredFields', countryIso3, serviceId, destinationType, transactionType],
        queryFn: () =>
            apiWrapper({
                endpoint: `/api/payment/get-required-fields/${countryIso3}/${serviceId}/${transactionType}?destinationType=${destinationType}`,
                method: 'GET',
                isDecrypted: true,
            }),
        enabled: enabled && !!countryIso3 && !!serviceId,
        staleTime: 5 * 60 * 1000,
    });

    const fields = useMemo(() => data?.data || data || null, [data]);

    return { fields, transactionType, isLoading: isFetching, error };
};

export const useRequirements = ({ method, vendor, fields, recipientType, channel }) => {
    const cryptoAsset = channel?.crypto_asset;

    return useMemo(() => {
        if (BVNK_METHODS.some((m) => m.value === method)) {
            return getBvnkRequirements(method, recipientType, { crypto_asset: cryptoAsset });
        }
        if (!fields) return null;
        return getThunesRequirements(fields, recipientType);
    }, [method, vendor, fields, recipientType, cryptoAsset]);
};
