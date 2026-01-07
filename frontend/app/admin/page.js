"use client";
import React, { useState, useEffect } from 'react';
import styles from './admin.module.css';

import FormBuilder from './FormBuilder';
import { API_URL } from '../../utils/config';

export default function AdminPanel() {
    const [vendors, setVendors] = useState([]);
    const [newVendor, setNewVendor] = useState({ name: '', phone: '', email: '', password: '', shop_id: '', business_type: 'custom' });
    const [loading, setLoading] = useState(false);

    // Form Builder State
    const [editingFormVendor, setEditingFormVendor] = useState(null);
    const [currentFormFields, setCurrentFormFields] = useState([]);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/vendors`);
            const data = await res.json();
            if (data.success) {
                setVendors(data.vendors);
            }
        } catch (error) {
            console.error("Failed to fetch vendors", error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/create-vendor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newVendor)
            });
            const data = await res.json();
            if (data.success) {
                setVendors([data.vendor, ...vendors]);
                setNewVendor({ name: '', phone: '', email: '', password: '', shop_id: '', business_type: 'custom' });
                alert("Vendor Created Successfully!");
            } else {
                alert(data.error || "Failed to create vendor");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating vendor");
        } finally {
            setLoading(false);
        }
    };

    // Form Builder Logic
    const openFormBuilder = async (vendor) => {
        try {
            const res = await fetch(`${API_URL}/api/form/${vendor.id}`);
            const data = await res.json();
            if (data.success) {
                setCurrentFormFields(data.fields);
                setEditingFormVendor(vendor);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to load form");
        }
    };

    const saveForm = async (fields) => {
        try {
            await fetch(`${API_URL}/api/form/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendor_id: editingFormVendor.id, fields })
            });
            alert("Form Saved!");
            setEditingFormVendor(null);
        } catch (e) {
            console.error(e);
            alert("Failed to save form");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied: " + text);
    };

    return (
        <main className={styles.adminContainer}>
            <header className={styles.header}>
                <h1>Super Admin</h1>
                <div className={styles.user}>Admin account</div>
            </header>

            <div className={styles.content}>

                {editingFormVendor ? (
                    <div className={styles.card}>
                        <h2>Editing Form: {editingFormVendor.name}</h2>
                        <FormBuilder
                            vendorId={editingFormVendor.id}
                            initialFields={currentFormFields}
                            onSave={saveForm}
                            onCancel={() => setEditingFormVendor(null)}
                        />
                    </div>
                ) : (
                    <>
                        <div className={styles.card}>
                            <h2>Create New Vendor</h2>
                            <form onSubmit={handleCreate} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <input
                                        type="text"
                                        placeholder="Vendor Name"
                                        value={newVendor.name}
                                        onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                                        className={styles.input}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Shop ID (Unique, e.g. store1)"
                                        value={newVendor.shop_id}
                                        onChange={(e) => setNewVendor({ ...newVendor, shop_id: e.target.value })}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <select
                                        value={newVendor.business_type}
                                        onChange={(e) => setNewVendor({ ...newVendor, business_type: e.target.value })}
                                        className={styles.input}
                                    >
                                        <option value="custom">Custom Form</option>
                                        <option value="clinic">Clinic</option>
                                        <option value="salon">Salon</option>
                                        <option value="court">Court</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <input
                                        type="email"
                                        placeholder="Email (Login ID)"
                                        value={newVendor.email}
                                        onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                                        className={styles.input}
                                        required
                                    />
                                    <input
                                        type="text" // Using text to see password easily for demo
                                        placeholder="Password"
                                        value={newVendor.password}
                                        onChange={(e) => setNewVendor({ ...newVendor, password: e.target.value })}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={newVendor.phone}
                                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                                <div className={styles.formGroup}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={newVendor.can_customize || false}
                                            onChange={(e) => setNewVendor({ ...newVendor, can_customize: e.target.checked })}
                                        />
                                        Allow Form Customization
                                    </label>
                                </div>
                                <button className={styles.createBtn} disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Vendor'}
                                </button>
                            </form>
                        </div>

                        <div className={styles.listCard}>
                            <h2>Active Vendors</h2>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Shop ID</th>
                                        <th>Type</th>
                                        <th>Credentials</th>
                                        <th>URLs</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendors.map(vendor => {
                                        const displayUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/display/${vendor.shop_id}`;
                                        const bookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${vendor.shop_id}`;
                                        return (
                                            <tr key={vendor.id}>
                                                <td>{vendor.name}<br /><span style={{ fontSize: '0.8em', color: '#666' }}>{vendor.phone_number}</span></td>
                                                <td>{vendor.shop_id}</td>
                                                <td>{vendor.business_type || 'custom'}</td>
                                                <td>
                                                    <span style={{ fontSize: '0.8em' }}>
                                                        {vendor.email}<br />
                                                    </span>
                                                    {vendor.can_customize && <span style={{ fontSize: '0.7em', background: '#dcfce7', color: '#166534', padding: '2px 4px', borderRadius: '4px' }}>Customizer</span>}
                                                </td>
                                                <td>
                                                    <div className={styles.urlActions}>
                                                        <button onClick={() => copyToClipboard(displayUrl)} className={styles.smallBtn}>Display</button>
                                                        <button onClick={() => copyToClipboard(bookUrl)} className={styles.smallBtn}>Book Link</button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => openFormBuilder(vendor)}
                                                        className={styles.smallBtn}
                                                        style={{ background: '#4f46e5', color: 'white', border: 'none' }}
                                                    >
                                                        Manage Form
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
