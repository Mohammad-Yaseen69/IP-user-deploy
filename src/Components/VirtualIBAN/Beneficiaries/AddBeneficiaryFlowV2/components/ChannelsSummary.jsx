import { useMemo } from 'react';
import { SummaryCard, SummaryRow } from './index';
import { METHOD_AVATAR_ICON } from '../constants';
import { getProtocolLabel } from '../../../../WalletsNew/SendCryptoModal/cryptoProtocols';

const maskTail = (value, visible = 4) => {
    const text = String(value || '').trim();
    if (text.length <= visible + 4) return text;
    return `${text.slice(0, 4)}…${text.slice(-visible)}`;
};

export const getBeneficiaryChannels = (beneficiary) => {
    const bank = (beneficiary?.bank_details || []).map((item) => ({
        key: item?._id,
        icon: METHOD_AVATAR_ICON.bank_account,
        title: item?.name || 'Bank account',
        value: item?.iban || item?.account_number || item?.bank_account_number || '',
        meta: [item?.swift_code, item?.city].filter(Boolean).join(' • '),
    }));

    const mobile = (beneficiary?.mobile_wallet || []).map((item) => ({
        key: item?._id,
        icon: METHOD_AVATAR_ICON.mobile_wallet,
        title: item?.money_provider || item?.wallet_name || 'Mobile wallet',
        value: item?.wallet_account_number || '',
        meta: item?.wallet_name || '',
    }));

    const crypto = (beneficiary?.crypto || []).map((item) => ({
        key: item?._id,
        icon: METHOD_AVATAR_ICON.crypto_wallet,
        title: `${String(item?.currency || 'USDT').toUpperCase()} wallet`,
        value: maskTail(item?.wallet_address, 6),
        meta: getProtocolLabel(item?.extras?.crypto_network) || '',
    }));

    const card = (beneficiary?.card || []).map((item) => ({
        key: item?._id,
        icon: METHOD_AVATAR_ICON.card_payment,
        title: item?.name || 'Payment card',
        value: maskTail(item?.number, 4),
        meta: item?.expiry || '',
    }));

    return [...bank, ...mobile, ...crypto, ...card];
};

const ChannelsSummary = ({ beneficiary, heading = 'Payout channels' }) => {
    const channels = useMemo(() => getBeneficiaryChannels(beneficiary), [beneficiary]);

    return (
        <SummaryCard heading={heading}>
            {channels.length > 0 ? (
                channels.map((channel, index) => (
                    <SummaryRow
                        key={channel.key || `${channel.title}-${index}`}
                        icon={channel.icon}
                        label={channel.title}
                        value={[channel.value, channel.meta].filter(Boolean).join(' • ')}
                    />
                ))
            ) : (
                <SummaryRow label="No payout channels" value="Add one to send money to this recipient" />
            )}
        </SummaryCard>
    );
};

export default ChannelsSummary;
