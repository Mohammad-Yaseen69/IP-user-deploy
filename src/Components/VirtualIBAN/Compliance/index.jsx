import React, { useState } from 'react';
import { complianceMockData } from './complianceData';
import ActionNeededView from './ActionNeededView';
import AccountRestrictedView from './AccountRestrictedView';
import AllCaughtUpView from './AllCaughtUpView';
import styles from './compliance.module.css';


const Compliance = () => {
    const [data] = useState(complianceMockData);
    const renderComplianceContent = () => {
        switch (data.viewState) {
            case 'restricted':
            case 'blocked': 
                return <AccountRestrictedView restrictedData={data.restrictedData} />;
            case 'all_clear':
            case 'verified':
                return <AllCaughtUpView lastReviewed={data.lastReviewed} />;

            case 'action_needed':
            case 'pending':
            default:
                return (
                    <ActionNeededView
                        bannerMessage={data.bannerMessage}
                        requests={data.requests}
                    />
                );
        }
    };
    return (
        <div className={styles.complianceContainer}>
            {renderComplianceContent()}
        </div>
    );
};

export default Compliance;