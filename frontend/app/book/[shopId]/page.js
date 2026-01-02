"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './book.module.css';

import DynamicFormRenderer from './DynamicFormRenderer';

export default function BookTokenPage() {
    const { shopId } = useParams();
    const [vendor, setVendor] = useState(null);
    const [phone, setPhone] = useState('');
    const [generatedToken, setGeneratedToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form logic
    const [requiredForm, setRequiredForm] = useState(null); // fields array

    useEffect(() => {
        if (shopId) {
            fetch(`http://localhost:5000/api/public/${shopId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setVendor(data.vendor);
                })
                .catch(err => console.error(err));
        }
    }, [shopId]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/webhook/missed-call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shop_id: shopId,
                    user_phone: phone
                })
            });
            const data = await res.json();

            if (data.success) {
                setGeneratedToken(data);
            } else if (data.requires_form) {
                setRequiredForm({
                    fields: data.form_fields,
                    previous_data: data.previous_data || {}
                });
            } else {
                setError(data.error || "Failed to generate token");
            }
        } catch (err) {
            console.error(err);
            setError("Network Error");
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        setLoading(true);
        try {
            // 1. Submit Profile Data
            const submitRes = await fetch('http://localhost:5000/api/form/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendor_id: vendor.id,
                    phone_number: phone,
                    profile_data: formData
                })
            });
            const submitData = await submitRes.json();

            if (submitData.success) {
                // 2. Retry Token Generation
                const res = await fetch('http://localhost:5000/api/webhook/missed-call', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        shop_id: shopId,
                        user_phone: phone
                    })
                });
                const data = await res.json();
                if (data.success) {
                    setGeneratedToken(data);
                    setRequiredForm(null);
                } else {
                    setError(data.error || "Token generation failed after form submit");
                }
            } else {
                setError("Failed to save form data");
            }
        } catch (e) {
            console.error(e);
            setError("Error submitting form");
        } finally {
            setLoading(false);
        }
    };

    if (!vendor) return <div className={styles.center}>Loading Store...</div>;

    if (generatedToken) {
        return (
            <main className={styles.container}>
                <div className={styles.tokenCard}>
                    <div className={styles.tokenTitle}>Token Generated Successfully!</div>
                    <div className={styles.tokenValue}>{generatedToken.token.token_number}</div>
                    <div className={styles.queueInfo}>
                        There are <strong>{generatedToken.queueStatus.waitingCount} people</strong> ahead of you.
                    </div>
                </div>
                <div className={styles.info}>
                    Please show this token at the counter ({vendor.name}).
                </div>
            </main>
        );
    }

    if (requiredForm) {
        return (
            <main className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Details Required</h1>
                    <p className={styles.description}>Please fill in the following details to join the queue.</p>

                    <DynamicFormRenderer
                        fields={requiredForm.fields}
                        initialValues={requiredForm.previous_data}
                        onSubmit={handleFormSubmit}
                    />
                    <button
                        onClick={() => setRequiredForm(null)}
                        className={styles.button}
                        style={{ marginTop: '1rem', background: '#ccc', color: '#333' }}
                    >
                        Cancel
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>{vendor.name} Queue</h1>
                <p className={styles.description}>Enter your phone number to join the queue.</p>

                <form onSubmit={handleGenerate} className={styles.form}>
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={styles.input}
                        required
                        pattern="[0-9]{10}"
                        title="10 digit phone number"
                    />
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    <button className={styles.button} disabled={loading}>
                        {loading ? 'Checking...' : 'Join Queue'}
                    </button>
                </form>
            </div>
        </main>
    );
}
