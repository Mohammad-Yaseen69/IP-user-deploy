import { useTranslation } from 'react-i18next';
import { Card, Spinner, Table } from 'reactstrap';

const STATUS_COLORS = {
    pending: '#B45309',
    approved: '#047857',
    rejected: '#DC2626',
};

const toHistoryRow = (entry) => ({
    title: entry.title,
    timestamp: entry.edited_at ?? entry.timestamp ?? entry.updatedAt ?? entry.createdAt,
    previousStatus: entry.previous_status ?? entry.previousStatus ?? entry.status,
});

const FeeModelEditHistory = ({ history, loading }) => {
    const { t } = useTranslation();

    const rows = Array.isArray(history) ? history.map(toHistoryRow) : [];

    return (
        <Card style={{ borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px', marginTop: '8px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px 0', color: '#111827' }}>
                {t("Edit History")} ({rows.length})
            </h4>

            {loading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <Spinner size="sm" style={{ color: '#5926F0' }} />
                </div>
            ) : rows.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    {t("No edits made yet.")}
                </div>
            ) : (
                <Table responsive bordered hover size="sm" style={{ fontSize: '13px', marginBottom: 0 }}>
                    <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                            <th>{t("Title")}</th>
                            <th>{t("Timestamp")}</th>
                            <th>{t("Previous Status")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i}>
                                <td>{row.title || '-'}</td>
                                <td>{row.timestamp ? new Date(row.timestamp).toLocaleString() : '-'}</td>
                                <td style={{ fontWeight: 600, textTransform: 'uppercase', color: STATUS_COLORS[row.previousStatus] || '#374151' }}>
                                    {row.previousStatus ? t(row.previousStatus) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Card>
    );
};

export default FeeModelEditHistory;
