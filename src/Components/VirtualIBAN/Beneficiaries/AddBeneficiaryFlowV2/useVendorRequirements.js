import { useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiWrapper } from '../../../../utils/Functions/apiWrapper';
import { UserContext } from '../../../../Context/UserContext';
import {
    getBvnkRequirements,
    getThunesRequirements,
    resolveTransactionType,
} from './vendorFields';
import { BVNK_METHODS, THUNES_SERVICE_BY_METHOD, methodFromServiceName } from './constants';

/*
 * Talks to the money-transfer APIs so the form can ask for exactly what the
 * chosen vendor needs.
 *
 *   GET  /api/payment/services/:recipientIso3/:senderIso3
 *        -> [{ method: "Bank Account - Thunes", id }]  which methods exist at all
 *   POST /api/payment/payers  { vendor, service, country, transaction_type }
 *        -> raw payer objects, each carrying its own required fields
 *
 * Note we deliberately do NOT use /api/payment/get-required-fields: that
 * endpoint unions the requirements of every payer in the country, which is what
 * made the old screen ask for fields a given bank never wanted.
 */

/** Available payout methods for a country, from the services API. */
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

        /* "Bank Account - Thunes" -> { method: 'bank_account', vendor: 'thunes' } */
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

/** Payers (banks, wallet providers, cash networks) for one money-transfer method. */
export const usePayers = ({ countryIso3, method, vendor, recipientType, enabled = true }) => {
    const { userDetails } = useContext(UserContext);
    const transactionType = resolveTransactionType(userDetails?.account_type, recipientType);
    const serviceName = THUNES_SERVICE_BY_METHOD[method];

    const { data, isFetching, error } = useQuery({
        queryKey: ['abfPayers', countryIso3, serviceName, vendor, transactionType],
        queryFn: () =>
            apiWrapper({
                endpoint: '/api/payment/payers',
                method: 'POST',
                payload: {
                    vendor,
                    service: serviceName,
                    country: countryIso3,
                    transaction_type: transactionType,
                },
                isDecrypted: true,
            }),
        enabled: enabled && !!countryIso3 && !!serviceName && !!vendor,
        staleTime: 5 * 60 * 1000,
    });

    const payers = useMemo(() => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.destinations)) {
            return data.destinations.map((d) => ({ id: d.destinationId, name: d.destinationName }));
        }
        return [];
    }, [data]);

    return { payers, transactionType, isLoading: isFetching, error };
};

/**
 * The field requirements for the current selection.
 *
 * BVNK rails resolve straight from the static registry. Thunes resolves from
 * whichever payer the user picked, so it stays null until they pick one.
 */
export const useRequirements = ({ method, vendor, payer, recipientType, transactionType }) => {
    return useMemo(() => {
        if (BVNK_METHODS.some((m) => m.value === method)) {
            return getBvnkRequirements(method, recipientType);
        }
        if (!payer) return null;
        return getThunesRequirements(payer, transactionType);
    }, [method, vendor, payer, recipientType, transactionType]);
};
