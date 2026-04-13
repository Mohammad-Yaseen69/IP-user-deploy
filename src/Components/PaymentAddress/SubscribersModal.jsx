import { useTranslation } from 'react-i18next'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { XCircle } from 'react-feather'
import useCancelSubscription from '../../hooks/GeneralUse/useCancelSubscription'
import PaymentsConfirmationModal from '../Payments/PaymentsConfirmationModal'

const SubscribersModal = ({ isOpen, toggle, subscribers = [], queryKeyToInvalidate = "GetUserPlans" }) => {
    const { t } = useTranslation()

    const {
        requestCancel,
        confirmCancel,
        closeModal,
        isPending: isCancelling,
        isModalOpen,
    } = useCancelSubscription("owner", [queryKeyToInvalidate])

    return (
        <>
            <Modal toggle={toggle} isOpen={isOpen} size="lg" style={{ minWidth: window.innerWidth > 768 ? '700px' : '90%' }}>
                <ModalHeader toggle={toggle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5926F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span style={{ fontWeight: 600, fontSize: '20px', color: '#111' }}>
                            {t('Plan Subscribers')}
                        </span>
                    </div>
                </ModalHeader>
                <ModalBody style={{ padding: '12px' }}>

                    {subscribers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                            <p>{t('No subscribers found for this plan.')}</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto', maxHeight: '60vh' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left', color: '#666', fontSize: '13px' }}>
                                        <th style={{ padding: '12px 10px', fontWeight: 600 }}>{t('Name')}</th>
                                        <th style={{ padding: '12px 10px', fontWeight: 600 }}>{t('Contact')}</th>
                                        <th style={{ padding: '12px 10px', fontWeight: 600 }}>{t('Amount')}</th>
                                        <th style={{ padding: '12px 10px', fontWeight: 600 }}>{t('Method')}</th>
                                        <th style={{ padding: '12px 10px', fontWeight: 600 }}>{t('Cycle')}</th>
                                        <th style={{ padding: '12px 10px', fontWeight: 600 }}>{t('Next Billing')}</th>
                                        <th style={{ padding: '12px 10px', fontWeight: 600 }}>{t('Joined')}</th>
                                        <th style={{ padding: '12px 10px', fontWeight: 600 }}>{t('Status')}</th>
                                        <th style={{ padding: '12px 10px', fontWeight: 600 }}>{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscribers.map((sub, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>
                                            <td style={{ padding: '12px 10px', fontWeight: 600 }}>{sub?.subscriber?.name || t('N/A')}</td>
                                            <td style={{ padding: '12px 10px', color: '#666' }}>{sub?.subscriber?.email || sub?.subscriber?.phone}</td>
                                            <td style={{ padding: '12px 10px', fontWeight: 600 }}>{sub?.totalAmount?.toLocaleString()}</td>
                                            <td style={{ padding: '12px 10px', textTransform: 'capitalize' }}>{sub?.paymentMethod || '-'}</td>
                                            <td style={{ padding: '12px 10px' }}>{t(sub?.billingCycle)}</td>
                                            <td style={{ padding: '12px 10px', color: '#5926F0', fontWeight: 500 }}>{sub?.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : '-'}</td>
                                            <td style={{ padding: '12px 10px', color: '#999' }}>{sub?.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '-'}</td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <span style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '10px',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    background: sub?.status === 'active' ? '#DCFCE7' : '#FEE2E2',
                                                    color: sub?.status === 'active' ? '#166534' : '#991B1B'
                                                }}>
                                                    {t(sub?.status)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                {sub?.status === 'active' && (
                                                    <button
                                                        onClick={() => requestCancel(sub._id)}
                                                        disabled={isCancelling}
                                                        title={t('Cancel Subscription')}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            background: '#FEE2E2',
                                                            color: '#991B1B',
                                                            border: '1px solid #FECACA',
                                                            borderRadius: '6px',
                                                            padding: '4px 10px',
                                                            fontWeight: 600,
                                                            fontSize: '11px',
                                                            cursor: isCancelling ? 'not-allowed' : 'pointer',
                                                            opacity: isCancelling ? 0.6 : 1,
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        <XCircle size={13} />
                                                        {t('Cancel')}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </ModalBody>
            </Modal>

            <PaymentsConfirmationModal
                isOpen={isModalOpen}
                onCancel={closeModal}
                title={t('Cancel Subscription')}
                message={t('Are you sure you want to cancel this subscriber\'s subscription? This action cannot be undone.')}
                onConfirm={confirmCancel}
                btnOneText={t('No, Keep it')}
                btnTwoText={isCancelling ? t('Cancelling...') : t('Yes, Cancel')}
            />
        </>
    )
}

export default SubscribersModal
