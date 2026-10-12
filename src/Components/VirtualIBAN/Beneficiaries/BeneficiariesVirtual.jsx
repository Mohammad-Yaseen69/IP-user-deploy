import React, { useContext, useState } from 'react';
import { Copy, Plus, ChevronLeft, Search, User, Trash2, Edit3, Shield, Phone, Mail, MapPin, Filter, Sliders } from 'react-feather';
import styles from './BeneficiariesVirtual.module.css';
import IbanBreadcrumb from '../components/IbanBreadcrumb';
import { useTranslation } from 'react-i18next';
import useWindowWidth from '../../../utils/useWindowWidth';
import TopRight from '../../topRight';
import AddBeneficiaryModal from './Modals/AddBeneficiaryModal';
import DynamicChannelModal from './Modals/DynamicChannelModal';
import AddBeneficiaryFlowV2 from './AddBeneficiaryFlowV2';
import { USE_NEW_BENEFICIARY_FLOW } from './AddBeneficiaryFlowV2/constants';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { apiWrapper } from '../../../utils/Functions/apiWrapper';
import { handlePaymentApiError } from '../../../utils/Functions/handlePaymentApiError';
import { UserContext } from '../../../Context/UserContext';
import { toast } from 'react-toastify';

const TYPE_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'individual', label: 'Individual' },
    { value: 'business', label: 'Business' },
];

const SORT_OPTIONS = [
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'date_desc', label: 'Date (Newest first)' },
    { value: 'date_asc', label: 'Date (Oldest first)' },
    { value: 'type', label: 'Type' },
];

const getDisplayName = (b) =>
    b.beneficiary_type === 'business'
        ? (b.company_name || '')
        : `${b.first_name || ''} ${b.last_name || ''}`.trim();

const getCreatedAt = (b) => new Date(b.createdAt || 0).getTime();

const BeneficiariesVirtual = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const navigate = useNavigate();
    const { userDetails } = useContext(UserContext);
    const isMobile = width <= 600;
    const accountId = userDetails?._id || userDetails?.account_id;

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name_asc');
    const [openMenu, setOpenMenu] = useState(null);
    const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
    const [beneficiaryToEdit, setBeneficiaryToEdit] = useState(null);
    const [channelModalBeneficiary, setChannelModalBeneficiary] = useState(null);

    const { data: rawData, refetch, isFetching } = useQuery({
        queryKey: ['userBeneficiaries', accountId],
        queryFn: () => {
            return apiWrapper({
                endpoint: `/api/beneficiary/get-user-beneficiaries/${accountId}`,
                method: 'GET',
                isDecrypted: true
            });
        },
        enabled: !!accountId
    });

    const allBeneficiaries = rawData?.beneficiaryList || rawData?.data?.beneficiaryList || (Array.isArray(rawData?.data) ? rawData.data : []);
    const beneficiaries = allBeneficiaries;

    const filteredBeneficiaries = beneficiaries
        .filter(b => {
            if (typeFilter === 'business' && b.beneficiary_type !== 'business') return false;
            if (typeFilter === 'individual' && b.beneficiary_type === 'business') return false;

            const query = searchQuery.trim().toLowerCase();
            if (!query) return true;

            const fullName = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
            const company = (b.company_name || '').toLowerCase();
            const email = (b.email || '').toLowerCase();
            const phone = (b.phone || '').toLowerCase();
            const country = (b.country_name || b.country_iso_code || '').toLowerCase();
            return fullName.includes(query) || company.includes(query) || email.includes(query) || phone.includes(query) || country.includes(query);
        })
        .sort((a, b) => {
            if (sortBy === 'date_desc' || sortBy === 'date_asc') {
                const diff = getCreatedAt(a) - getCreatedAt(b);
                return sortBy === 'date_desc' ? -diff : diff;
            }
            if (sortBy === 'type') {
                return (a.beneficiary_type || '').localeCompare(b.beneficiary_type || '');
            }
            const cmp = getDisplayName(a).localeCompare(getDisplayName(b));
            return sortBy === 'name_desc' ? -cmp : cmp;
        });

    const activeFilterCount = typeFilter !== 'all' ? 1 : 0;

    const toggleMenu = (name) => setOpenMenu(prev => (prev === name ? null : name));

    const activeBeneficiary = beneficiaries.find(b => b._id === selectedBeneficiaryId) || filteredBeneficiaries[0] || beneficiaries[0];

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(t("Copied to clipboard"));
    };

    const handleDeleteChannel = async (channelType, channelId) => {
        if (!activeBeneficiary?._id || !channelId) return;
        if (!window.confirm(t("Are you sure you want to remove this channel?"))) return;

        try {
            await apiWrapper({
                endpoint: `/api/beneficiary/v2/${activeBeneficiary._id}/channel/${channelType}/${channelId}`,
                method: 'DELETE',
                isDecrypted: true
            });
            toast.success(t("Channel removed successfully"));
            refetch();
        } catch (err) {
            handlePaymentApiError({
                error: err,
                navigate,
                fallback: t("Failed to remove channel"),
                setError: (message) => toast.error(message),
            });
        }
    };

    const handleBeneficiarySaved = async (savedBeneficiary) => {
        if (savedBeneficiary?._id) {
            setSelectedBeneficiaryId(savedBeneficiary._id);
        }
        await refetch();
        // The DS 2.0 flow creates the payout channel as part of the same journey,
        // so there is no longer a second modal to chain into here.
    };

    const getInitials = (b) => {
        if (!b) return 'B';
        if (b.beneficiary_type === 'business' && b.company_name) {
            return b.company_name.slice(0, 2).toUpperCase();
        }
        const first = b.first_name?.[0] || '';
        const last = b.last_name?.[0] || '';
        return (first + last).toUpperCase() || 'B';
    };

    const getAvatarBg = (index) => {
        const colors = ['#F59E0B', '#4F46E5', '#10B981', '#EC4899', '#8B5CF6', '#3B82F6'];
        return colors[index % colors.length];
    };

    return (
        <div className={styles.container}>
            {!isMobile &&
                <div className={styles.top}>
                    <div className={styles.headerTitleMain}>
                        <div className={styles.titleWithBack}>
                            <h1>{t("IBAN Beneficiaries")}</h1>
                        </div>
                        <p>{t("Manage your virtual bank and payout channel beneficiaries.")}</p>
                    </div>
                    <div className={styles.topright}>
                        {width > 1000 && <TopRight />}
                    </div>
                </div>
            }
            <div className={styles.mainContent}>
                {!isMobile &&
                    <div className={styles.navigationHeader}>
                        <IbanBreadcrumb items={[
                            { label: "My virtual bank", path: "/virtual-IBAN" },
                            { label: "Beneficiaries" }
                        ]} />
                    </div>
                }
                <div className={styles.contentLayout}>
                    <div className={styles.columnsFlexGrid}>
                        <div className={styles.leftColumn}>
                            <div className={styles.lefHeader}>
                                <div className={styles.subHeaderFlex}>
                                    <h1>{t("Beneficiaries")}</h1>
                                    <button
                                        className={styles.addBeneficiaryBtn}
                                        onClick={() => {
                                            setBeneficiaryToEdit(null);
                                            setIsAddModalOpen(true);
                                        }}
                                    >
                                        <Plus size={16} /> {t("Add beneficiary")}
                                    </button>
                                </div>
                                <div className={styles.searchBarWrapper}>
                                    <Search size={16} className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder={t("Search items...")}
                                        className={styles.searchInput}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className={styles.toolbarRow}>
                                    <div className={styles.dropdown}>
                                        <button type="button" className={styles.toolbarBtn} onClick={() => toggleMenu('filter')}>
                                            <Filter size={14} /> {t("Filter")}
                                            {activeFilterCount > 0 && <span className={styles.badge}>{activeFilterCount}</span>}
                                        </button>
                                        {openMenu === 'filter' && (
                                            <div className={styles.menu}>
                                                {TYPE_OPTIONS.map(o => (
                                                    <button
                                                        key={o.value}
                                                        type="button"
                                                        className={`${styles.menuItem} ${typeFilter === o.value ? styles.menuItemActive : ''}`}
                                                        onClick={() => { setTypeFilter(o.value); setOpenMenu(null); }}
                                                    >
                                                        {t(o.label)}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.dropdown}>
                                        <button type="button" className={styles.toolbarBtn} onClick={() => toggleMenu('sort')}>
                                            <Sliders size={14} /> {t("Sort")}
                                        </button>
                                        {openMenu === 'sort' && (
                                            <div className={styles.menu}>
                                                {SORT_OPTIONS.map(o => (
                                                    <button
                                                        key={o.value}
                                                        type="button"
                                                        className={`${styles.menuItem} ${sortBy === o.value ? styles.menuItemActive : ''}`}
                                                        onClick={() => { setSortBy(o.value); setOpenMenu(null); }}
                                                    >
                                                        {t(o.label)}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.beneficiariesList}>
                                {isFetching && beneficiaries.length === 0 ? (
                                    <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                                        {t("Loading beneficiaries...")}
                                    </div>
                                ) : filteredBeneficiaries.length === 0 ? (
                                    <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                                        {t("No beneficiaries found")}
                                    </div>
                                ) : (
                                    filteredBeneficiaries.map((b, idx) => {
                                        const isSelected = activeBeneficiary?._id === b._id;
                                        const name = b.beneficiary_type === 'business' ? b.company_name : `${b.first_name || ''} ${b.last_name || ''}`.trim();
                                        const totalChannels = (b.bank_details?.length || 0) + (b.mobile_wallet?.length || 0) + (b.crypto?.length || 0);

                                        return (
                                            isMobile ?
                                                <div
                                                    key={b._id || idx}
                                                    className={`${styles.beneficiaryItem} ${isSelected ? styles.activeItem : ''}`}
                                                    onClick={() => setSelectedBeneficiaryId(b._id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className={styles.beneficiaryItemWrapper}>
                                                        <div className={styles.avatarCircle} style={{ background: getAvatarBg(idx) }}>
                                                            {getInitials(b)}
                                                        </div>
                                                        <div className={styles.itemMeta}>
                                                            <h4>{name || t("Unnamed Beneficiary")}</h4>
                                                            <p>
                                                                {b.beneficiary_type === 'business' ? t("Company") : t("Individual")}
                                                                {b.country_name ? ` • ${b.country_name}` : ''}
                                                                {!isMobile && ` • ${totalChannels} ${t("channels")}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={styles.channelBadge}>{totalChannels}</div>
                                                </div>
                                                :
                                                <div
                                                    key={b._id || idx}
                                                    className={`${styles.beneficiaryItem} ${isSelected ? styles.activeItem : ''}`}
                                                    onClick={() => setSelectedBeneficiaryId(b._id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className={styles.avatarCircle} style={{ background: getAvatarBg(idx) }}>
                                                        {getInitials(b)}
                                                    </div>
                                                    <div className={styles.itemMeta}>
                                                        <h4>{name || t("Unnamed Beneficiary")}</h4>
                                                        <p>
                                                            {b.beneficiary_type === 'business' ? t("Company") : t("Individual")}
                                                            {b.country_name ? ` • ${b.country_name}` : ''}
                                                            {` • ${totalChannels} ${t("channels")}`}
                                                        </p>
                                                    </div>
                                                </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className={styles.rightColumn}>
                            {activeBeneficiary ? (
                                <>
                                    <div className={styles.profileHeaderBox}>
                                        <div className={styles.profileLeftGroup}>
                                            <div className={styles.avatarCircleBig}>{getInitials(activeBeneficiary)}</div>
                                            <div className={styles.profileTitleBlock}>
                                                <div>
                                                    <div className={styles.nameBadgeRow}>
                                                        <h2>
                                                            {activeBeneficiary.beneficiary_type === 'business'
                                                                ? activeBeneficiary.company_name
                                                                : `${activeBeneficiary.first_name || ''} ${activeBeneficiary.last_name || ''}`.trim()}
                                                        </h2>
                                                        <span className={styles.badgeLabel}>
                                                            {activeBeneficiary.beneficiary_type === 'business' ? t("Business") : t("Individual")}
                                                        </span>
                                                    </div>
                                                    {isMobile &&
                                                        <div className={styles.profileActionGroup}>
                                                            <button
                                                                className={styles.editIconButton}
                                                                onClick={() => {
                                                                    setBeneficiaryToEdit(activeBeneficiary);
                                                                    setIsAddModalOpen(true);
                                                                }}
                                                                title={t("Edit Beneficiary")}
                                                            >
                                                                <Edit3 size={isMobile ? 13 : 16} />
                                                            </button>
                                                        </div>
                                                    }
                                                </div>
                                                <p className={styles.subTextDetail}>
                                                    {activeBeneficiary.country_name || activeBeneficiary.country_iso_code || t("Global")}
                                                    {activeBeneficiary.city ? `, ${activeBeneficiary.city}` : ''}
                                                    {activeBeneficiary.zip_code ? ` ${activeBeneficiary.zip_code}` : ''}
                                                    {activeBeneficiary.email ? ` • ${activeBeneficiary.email}` : ''}
                                                    {activeBeneficiary.phone ? ` • ${activeBeneficiary.phone}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        {!isMobile &&
                                            <div className={styles.profileActionGroup}>
                                                <button
                                                    className={styles.editIconButton}
                                                    onClick={() => {
                                                        setBeneficiaryToEdit(activeBeneficiary);
                                                        setIsAddModalOpen(true);
                                                    }}
                                                    title={t("Edit Beneficiary")}
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                            </div>
                                        }
                                    </div>

                                    <div className={styles.sectionHeaderRow}>
                                        <span className={styles.sectionSubTitle}>{t("Payout Channels")}</span>
                                        <button
                                            className={styles.addChannelLink}
                                            onClick={() => {
                                                setChannelModalBeneficiary(activeBeneficiary);
                                                setIsChannelModalOpen(true);
                                            }}
                                        >
                                            + {t("Add channel")}
                                        </button>
                                    </div>

                                    {activeBeneficiary.bank_details && activeBeneficiary.bank_details.length > 0 && (
                                        activeBeneficiary.bank_details.map((bank, bIdx) => (
                                            isMobile ?
                                                <div key={bank._id || bIdx} className={styles.cryptoWalletCard} style={{ marginTop: '12px' }}>
                                                    <div className={styles.walletHeader}>
                                                        <div className={styles.channelTypeLabel}>
                                                            <div className={styles.iconwrap} style={{ borderRadius: "12px", background: "#F5F2FF" }}>
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2">
                                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                                    <line x1="9" y1="21" x2="9" y2="9"></line>
                                                                    <line x1="15" y1="21" x2="15" y2="9"></line>
                                                                    <line x1="3" y1="9" x2="21" y2="9"></line>
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <span className={styles.networkTag}>{t("Bank Account")}</span>                                                 <span className={styles.networkActive}>{bank.name || t("Bank")}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteChannel('bank', bank._id)}
                                                            style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                                            title={t("Delete channel")}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <div className={styles.addressRow}>
                                                        <span className={styles.cryptoAddress}>
                                                            {bank.iban || bank.account_number || bank.bank_account_number || ''}
                                                        </span>
                                                        <button className={styles.copyBtn} onClick={() => handleCopy(bank.iban || bank.account_number)}>
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                :
                                                <div key={bank._id || bIdx} className={styles.cryptoWalletCard} style={{ marginTop: '12px' }}>
                                                    <div className={styles.walletHeader}>
                                                        <div className={styles.channelTypeLabel}>
                                                            <div className={styles.iconwrap} style={{ borderRadius: "12px", background: "#F5F2FF" }}>
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2">
                                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                                    <line x1="9" y1="21" x2="9" y2="9"></line>
                                                                    <line x1="15" y1="21" x2="15" y2="9"></line>
                                                                    <line x1="3" y1="9" x2="21" y2="9"></line>
                                                                </svg>
                                                            </div>
                                                            <span className={styles.networkTag}>{t("Bank Account")}</span>
                                                            <span className={styles.networkActive}>{bank.name || t("Bank")}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteChannel('bank', bank._id)}
                                                            style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                                            title={t("Delete channel")}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <div className={styles.addressRow}>
                                                        <span className={styles.cryptoAddress}>
                                                            {bank.iban || bank.account_number || bank.bank_account_number || ''}
                                                        </span>
                                                        <button className={styles.copyBtn} onClick={() => handleCopy(bank.iban || bank.account_number)}>
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                        ))
                                    )}

                                    {activeBeneficiary.mobile_wallet && activeBeneficiary.mobile_wallet.length > 0 && (
                                        activeBeneficiary.mobile_wallet.map((mw, mIdx) => (
                                            <div key={mw._id || mIdx} className={styles.cryptoWalletCard} style={{ marginTop: '12px' }}>
                                                <div className={styles.walletHeader}>
                                                    <div className={styles.channelTypeLabel}>
                                                        <div className={styles.iconwrap} style={{ borderRadius: "12px", background: "#ECFDF5" }}>
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                                                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                                                <line x1="12" y1="18" x2="12" y2="18"></line>
                                                            </svg>
                                                        </div>
                                                        <span className={styles.networkTag}>{t("Mobile Wallet")}</span>
                                                        <span className={styles.networkActive}>{mw.money_provider || mw.wallet_name || t("Mobile")}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteChannel('mobile_wallet', mw._id)}
                                                        style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                                        title={t("Delete channel")}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className={styles.addressRow}>
                                                    <span className={styles.cryptoAddress}>
                                                        {`${mw.wallet_name || mw.money_provider || ''} • ${mw.wallet_account_number || ''}`}
                                                    </span>
                                                    <button className={styles.copyBtn} onClick={() => handleCopy(mw.wallet_account_number)}>
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {activeBeneficiary.crypto && activeBeneficiary.crypto.length > 0 && (
                                        activeBeneficiary.crypto.map((cr, cIdx) => (
                                            <div key={cr._id || cIdx} className={styles.cryptoWalletCard} style={{ marginTop: '12px' }}>
                                                <div className={styles.walletHeader}>
                                                    <div className={styles.channelTypeLabel}>
                                                        <div className={styles.iconwrap} style={{ borderRadius: "12px", background: "#EEF2FF" }}>
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
                                                                <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0 0-4z"></path>
                                                                <circle cx="18" cy="12" r="1"></circle>
                                                            </svg>
                                                        </div>
                                                        <span className={styles.networkTag}>{t("Crypto Wallet")}</span>
                                                        <span className={styles.networkActive}>{(cr.currency || 'USDT').toUpperCase()}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteChannel('crypto', cr._id)}
                                                        style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                                        title={t("Delete channel")}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className={styles.addressRow}>
                                                    <span className={styles.cryptoAddress}>
                                                        {`${(cr.currency || 'USDT').toUpperCase()} • ${cr.wallet_address || ''}`}
                                                    </span>
                                                    <button className={styles.copyBtn} onClick={() => handleCopy(cr.wallet_address)}>
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {(!activeBeneficiary.bank_details || activeBeneficiary.bank_details.length === 0) &&
                                        (!activeBeneficiary.mobile_wallet || activeBeneficiary.mobile_wallet.length === 0) &&
                                        (!activeBeneficiary.crypto || activeBeneficiary.crypto.length === 0) && (
                                            <div style={{ padding: '32px 16px', textAlign: 'center', background: '#FAF9FD', borderRadius: '16px', border: '1px dashed #E5E7EB', marginTop: '16px' }}>
                                                <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#6B7280', fontWeight: isMobile && 400 }}>
                                                    {t("No payout channels added for this beneficiary yet.")}
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setChannelModalBeneficiary(activeBeneficiary);
                                                        setIsChannelModalOpen(true);
                                                    }}
                                                    style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: isMobile ? '#5926F0' : '#4F46E5', color: '#FFF', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                                                >
                                                    + {t("Add first channel")}
                                                </button>
                                            </div>
                                        )}
                                </>
                            ) : (
                                <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
                                    <p>{t("Select or add a beneficiary to view payout channels")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* New beneficiaries go through the vendor-driven DS 2.0 flow, which asks
                only for the fields the chosen payout provider actually requires. */}
            {USE_NEW_BENEFICIARY_FLOW && (
                <AddBeneficiaryFlowV2
                    open={isAddModalOpen && !beneficiaryToEdit}
                    handleClose={() => {
                        setIsAddModalOpen(false);
                        setBeneficiaryToEdit(null);
                    }}
                    onSaveSuccess={handleBeneficiarySaved}
                />
            )}

            {USE_NEW_BENEFICIARY_FLOW && beneficiaryToEdit && (
                <AddBeneficiaryFlowV2
                    open={isAddModalOpen && !!beneficiaryToEdit}
                    mode="edit"
                    existingBeneficiary={beneficiaryToEdit}
                    handleClose={() => {
                        setIsAddModalOpen(false);
                        setBeneficiaryToEdit(null);
                    }}
                    onSaveSuccess={handleBeneficiarySaved}
                />
            )}

            {/* Editing without the new flow, which also handles creation when the flag is off. */}
            {!USE_NEW_BENEFICIARY_FLOW && (
                <AddBeneficiaryModal
                    open={isAddModalOpen}
                    handleClose={() => {
                        setIsAddModalOpen(false);
                        setBeneficiaryToEdit(null);
                    }}
                    beneficiaryToEdit={beneficiaryToEdit}
                    onSaveSuccess={handleBeneficiarySaved}
                />
            )}

            {/* Adding a channel reuses the same vendor-driven flow, starting at the
                method step with the beneficiary already known. The original
                DynamicChannelModal is kept below for the flag-off path. */}
            {USE_NEW_BENEFICIARY_FLOW ? (
                <AddBeneficiaryFlowV2
                    open={isChannelModalOpen}
                    handleClose={() => {
                        setIsChannelModalOpen(false);
                        setChannelModalBeneficiary(null);
                    }}
                    existingBeneficiary={channelModalBeneficiary || activeBeneficiary}
                    onSaveSuccess={() => refetch()}
                />
            ) : (
                <DynamicChannelModal
                    open={isChannelModalOpen}
                    handleClose={() => {
                        setIsChannelModalOpen(false);
                        setChannelModalBeneficiary(null);
                    }}
                    beneficiaryData={channelModalBeneficiary || activeBeneficiary}
                    onSaveSuccess={() => refetch()}
                />
            )}
        </div>
    );
};

export default BeneficiariesVirtual;