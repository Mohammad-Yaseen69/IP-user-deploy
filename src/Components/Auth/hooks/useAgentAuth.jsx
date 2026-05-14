import { useMutation, useQuery } from '@tanstack/react-query';
import { apiWrapper } from '../../../utils/Functions/apiWrapper';
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';
import axios from 'axios';

export const useAgentAuth = () => {
    const sendLoginOtp = useMutation({
        mutationFn: async (credentials) => apiWrapper({
            endpoint: '/api/business-agents/agents/send-login-otp',
            method: 'POST',
            isEncrypted: true,
            payload: credentials
        })
    });

    const verifyLoginOtp = useMutation({
        mutationFn: async ({ credentials, method }) => apiWrapper({
            endpoint: `/api/business-agents/agents/verify-login-otp`,
            method: 'POST',
            payload: {
                ...credentials,
                isAuthenticator: method === "auth" ? true : false
            },
            isEncrypted: true
        })
    });

    const getAuthDetails = useMutation({
        mutationFn: async (token) => apiWrapper({
            endpoint: `/api/business-agents/agents/auth/${token}`,
            method: 'GET'
        })
    });

    const biometricChallenge = useMutation({
        mutationFn: async (emailOrPhone) => apiWrapper({
            endpoint: '/api/business-agents/agents/login-biometric-challenge',
            method: 'POST',
            payload: emailOrPhone,
            isEncrypted: true
        })
    });

    const biometricVerify = useMutation({
        mutationFn: async (verificationData) => apiWrapper({
            endpoint: '/api/account/login-biometric-verify',
            method: 'POST',
            payload: verificationData,
            isEncrypted: true
        })
    });

    const createLoginHistory = useMutation({
        mutationFn: async (historyData) => apiWrapper({
            endpoint: '/api/login/create-login-history',
            method: 'POST',
            payload: historyData,
            isEncrypted: true
        })
    });

    return {
        sendLoginOtp,
        verifyLoginOtp,
        getAuthDetails,
        biometricChallenge,
        biometricVerify,
        createLoginHistory
    };
};
