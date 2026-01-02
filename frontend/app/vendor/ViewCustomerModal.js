import React from 'react';
import styles from './vendor.module.css';

export default function ViewCustomerModal({ customer, onClose }) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>Customer Details</h3>
                <div className={styles.detailRow}>
                    <span>Token:</span> <strong style={{ fontSize: '1.2rem', color: '#2563eb' }}>{customer.token || customer.token_number}</strong>
                </div>
                <div className={styles.detailRow}>
                    <span>Phone:</span> <strong>{customer.phone || customer.user_phone_number}</strong>
                </div>

                <h4 style={{ marginTop: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Full Profile</h4>
                <div className={styles.viewList}>
                    {customer.profile_data ? (
                        Object.entries(customer.profile_data).map(([key, value]) => (
                            <div key={key} className={styles.detailRow}>
                                <span style={{ textTransform: 'capitalize', color: '#666' }}>{key}:</span>
                                <strong>{String(value)}</strong>
                            </div>
                        ))
                    ) : (
                        <p>No additional data submitted.</p>
                    )}
                </div>

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.btnNext} style={{ width: '100%' }}>Close</button>
                </div>
            </div>
        </div>
    );
}
