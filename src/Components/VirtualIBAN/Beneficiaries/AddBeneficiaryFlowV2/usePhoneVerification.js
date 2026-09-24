import { useEffect, useMemo, useState } from 'react';
import { checkPhoneNumber } from '../../../../utils/Functions/phoneVerification';
import { useDebounce } from '../../../../hooks/useDebounce/useDebounce';

/* Short enough to still be typing. */
const MIN_DIGITS = 7;

/* A wallet is the number it is held on, so a number the provider cannot reach is worth
   catching here rather than when the payout bounces. */
export const usePhoneVerification = (number, enabled = true) => {
    const [status, setStatus] = useState('');
    const digits = String(number || '').replace(/\D/g, '');
    const debouncedDigits = useDebounce(digits, 700);

    useEffect(() => {
        let cancelled = false;

        if (!enabled || debouncedDigits.length < MIN_DIGITS) {
            setStatus('');
            return undefined;
        }

        setStatus('checking');
        checkPhoneNumber(debouncedDigits).then((result) => {
            if (cancelled) return;
            /* Unreachable says nothing about the number, so it is left unjudged. */
            if (!result.reachable) return setStatus('');
            setStatus(result.verified ? 'valid' : 'invalid');
        });

        return () => {
            cancelled = true;
        };
    }, [enabled, debouncedDigits]);

    return useMemo(() => {
        if (!enabled || !digits) return null;
        if (digits !== debouncedDigits || status === 'checking') {
            return { state: 'checking', message: 'Checking the number...' };
        }
        if (status === 'valid') return { state: 'valid', message: 'Number verified' };
        if (status === 'invalid') {
            return { state: 'invalid', message: 'This number could not be verified. Check it and try again.' };
        }
        return null;
    }, [enabled, digits, debouncedDigits, status]);
};

export default usePhoneVerification;
