import React, { useState } from 'react';
import styles from './vendor.module.css';

export default function EditCustomerModal({ customer, onClose, onSave }) {
    const [formData, setFormData] = useState(customer.profile_data || {});

    const handleChange = (key, value) => {
        setFormData({ ...formData, [key]: value });
    };

    const handleSave = () => {
        onSave({ ...customer, profile_data: formData });
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>Edit Customer Info</h3>
                <div className={styles.detailRow}>
                    <span>Phone:</span> <strong>{customer.phone || customer.user_phone_number}</strong>
                </div>

                <h4 style={{ marginTop: '1rem', borderBottom: '1px solid #eee' }}>Profile Data</h4>
                <div className={styles.editForm}>
                    {Object.entries(formData).map(([key, value]) => (
                        <div key={key} className={styles.formGroup}>
                            <label>{key}</label>
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleChange(key, e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    ))}
                    {Object.keys(formData).length === 0 && <p>No profile data to edit.</p>}
                </div>

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.btnSkip}>Cancel</button>
                    <button onClick={handleSave} className={styles.btnNext}>Save Changes</button>
                </div>
            </div>
        </div>
    );
}
