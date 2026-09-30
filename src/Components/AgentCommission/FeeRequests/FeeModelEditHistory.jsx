import { useTranslation } from 'react-i18next';
import { Table } from 'reactstrap';

const STATUS_COLORS = {
    pending: '#B45309',
    approved: '#047857',
    rejected: '#DC2626',
};

const toHistoryRow = (entry) => ({
    title: entry.title,
    timestamp: entry.edited_at ?? entry.timestamp ?? entry.createdAt,
    previousStatus: entry.previous_status,
});

const FeeModelEditHistory = ({ history }) => {
    const { t } = useTranslation();

    if (!Array.isArray(history) || history.length === 0) return null;

    const rows = history.map(toHistoryRow);

    return (
        <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                {t("Edit History")} ({t("Edited {{count}} times", { count: rows.length })}):
            </div>
            <Table responsive bordered size="sm" style={{ fontSize: '12px', marginBottom: 0 }}>
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
        </div>
    );
};

export default FeeModelEditHistory;
