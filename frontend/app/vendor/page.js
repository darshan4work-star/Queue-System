"use client";
import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import styles from './vendor.module.css';
import EditCustomerModal from './EditCustomerModal';
import ViewCustomerModal from './ViewCustomerModal';
import FormBuilder from '../admin/FormBuilder'; // Import FormBuilder

export default function VendorPanel() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [shopId, setShopId] = useState('');
    const [vendorId, setVendorId] = useState('');
    // Check if customization is allowed
    // Note: Vendor object now includes can_customize from login response

    // Helper to get current vendor data from state if needed, but we have isLoggedIn state.
    // We should probably store the full vendor object or at least the flag in state upon login.
    const [canCustomize, setCanCustomize] = useState(false);

    const [queueData, setQueueData] = useState({
        serving: '--',
        waitingCount: 0,
        lastToken: '--'
    });
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Custom Message State
    const [customMessage, setCustomMessage] = useState('');
    const [updatingMsg, setUpdatingMsg] = useState(false);

    // Modal State
    const [viewCustomer, setViewCustomer] = useState(null);
    const [editCustomer, setEditCustomer] = useState(null);

    // Form Builder State
    const [showFormBuilder, setShowFormBuilder] = useState(false);
    const [currentFormFields, setCurrentFormFields] = useState([]);


    // Socket Setup
    useEffect(() => {
        if (!shopId) return;

        function onConnect() {
            setIsConnected(true);
            console.log("Socket Connected");
            socket.emit('join_shop', shopId);
        }
        function onDisconnect() {
            setIsConnected(false);
        }
        function onQueueUpdate(data) {
            console.log("Realtime Update Recvd:", data);
            setQueueData(prev => ({
                ...prev,
                serving: data.serving,
                servingDetails: data.servingDetails, // Update details
                waitingCount: data.waitingCount || data.waiting || 0,
                waitingListDetails: data.waitingListDetails || [], // Update list
                lastToken: data.last
            }));
            setLastUpdate(new Date());
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('queue_update', onQueueUpdate);

        if (socket.connected) {
            onConnect();
        } else {
            socket.connect();
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('queue_update', onQueueUpdate);
        };
    }, [shopId]);

    // Initial Data Fetch
    useEffect(() => {
        if (shopId) {
            // Fetch initial queue status to populate dashboard immediately
            fetch(`http://localhost:5000/api/public/${shopId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setQueueData({
                            serving: data.queue.serving,
                            servingDetails: data.queue.servingDetails,
                            waitingCount: data.queue.waitingCount,
                            waitingListDetails: data.queue.waitingListDetails,
                            lastToken: data.queue.last
                        });
                        setCustomMessage(data.vendor.custom_message || '');
                    }
                })
                .catch(err => console.error(err));
        }
    }, [shopId]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/vendor/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });
            const data = await res.json();

            if (data.success) {
                setIsLoggedIn(true);
                setShopId(data.vendor.shop_id);
                setVendorId(data.vendor.id);
                setCanCustomize(data.vendor.can_customize); // Set permission
            } else {
                alert(data.error || "Login Failed");
            }
        } catch (err) {
            console.error(err);
            alert("Connection Error. Is Backend Running?");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/next', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendor_id: vendorId, shop_id: shopId })
            });
            const data = await res.json();
            if (!data.success) {
                console.error("Error calling next");
            }
        } catch (e) {
            console.error("Connection Error", e);
        }
    };

    const handleUpdateMessage = async () => {
        setUpdatingMsg(true);
        try {
            const res = await fetch('http://localhost:5000/api/vendor/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendor_id: vendorId, shop_id: shopId, custom_message: customMessage })
            });
            const data = await res.json();
            if (data.success) {
                alert("Message Updated!");
            } else {
                alert("Failed to update message");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating message");
        } finally {
            setUpdatingMsg(false);
        }
    };

    const handleSkip = () => {
        alert("Skip functionality coming soon.");
    };

    const handleSaveCustomer = async (updatedCustomer) => {
        try {
            const res = await fetch('http://localhost:5000/api/form/customer', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendor_id: vendorId,
                    phone_number: updatedCustomer.phone || updatedCustomer.user_phone_number,
                    profile_data: updatedCustomer.profile_data
                })
            });
            const data = await res.json();
            if (data.success) {
                // Refresh Queue (simplest way to update UI)
                // In real app, we might update local state directly or wait for socket event
                alert("Customer updated");
                setEditCustomer(null);
            } else {
                alert("Failed to update");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating customer");
        }
    };

    const handleCancelToken = async (token) => {
        if (!confirm(`Are you sure you want to cancel token ${token.token}?`)) return;

        try {
            const res = await fetch('http://localhost:5000/api/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token_id: token.id, // We need token ID, waitingListDetails currently does not have it.
                    // IMPORTANT: We need to update getQueueStatus to include token ID!
                    // For now, let's assume we might fail or need to update backend first. 
                    // Wait, getQueueStatus returns token_number, let's stick to update logic first.
                    // Actually, let's updating getQueueStatus to return ID is safer.
                    vendor_id: vendorId,
                    shop_id: shopId
                })
            });
            // ... waiting for task to update backend token ID retrieval
            // Assuming we pass token_number and lookup? No, cancelToken expects `token_id`.
            // Let's rely on token_number for cancel if we change backend or fetch ID.
            // Let's pass token_number instead for now and update backend to support it or fetch ID.

            // Actually, the previous backend `cancelToken` uses `id = $1`.
            // I need to update `getQueueStatus` to return `id` as well.
        } catch (e) {
            console.error(e);
        }
    };

    // Form Builder Logic
    const openFormBuilder = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/form/${vendorId}`);
            const data = await res.json();
            if (data.success) {
                setCurrentFormFields(data.fields);
                setShowFormBuilder(true);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to load form");
        }
    };

    const saveForm = async (fields) => {
        try {
            await fetch('http://localhost:5000/api/form/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendor_id: vendorId, fields })
            });
            alert("Form Saved Successfully!");
            setShowFormBuilder(false);
        } catch (e) {
            console.error(e);
            alert("Failed to save form");
        }
    };

    if (!isLoggedIn) {
        return (
            <main className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <h1>Vendor Login</h1>
                    <form onSubmit={handleLogin} className={styles.form}>
                        <div style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            <strong>Enter Credentials</strong><br />
                            (Created by Super Admin)
                        </div>
                        <input
                            type="email"
                            placeholder="Email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    if (showFormBuilder) {
        return (
            <main className={styles.dashboard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '800px' }}>
                    <FormBuilder
                        vendorId={vendorId}
                        initialFields={currentFormFields}
                        onSave={saveForm}
                        onCancel={() => setShowFormBuilder(false)}
                    />
                </div>
            </main>
        );
    }

    return (
        <main className={styles.dashboard}>
            <header className={styles.header}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2>{shopId} Dashboard</h2>
                    {canCustomize && (
                        <button
                            onClick={openFormBuilder}
                            style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '0.9rem', textDecoration: 'underline' }}
                        >
                            Customize Intake Form
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className={styles.statusBadge} style={{ backgroundColor: isConnected ? '#dcfce7' : '#fee2e2', color: isConnected ? '#166534' : '#991b1b' }}>
                        {isConnected ? '● Connected' : '○ Disconnected'}
                    </div>
                    {/* QR Code Popover Trigger */}
                    <div style={{ position: 'relative', cursor: 'pointer' }} title="Scan to Book">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${typeof window !== 'undefined' ? encodeURIComponent(`${window.location.origin}/book/${shopId}`) : ''}`}
                            alt="QR"
                            style={{ width: '40px', height: '40px', border: '1px solid #ccc', borderRadius: '4px' }}
                            onClick={() => {
                                const url = `${window.location.origin}/book/${shopId}`;
                                window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`, '_blank');
                            }}
                        />
                    </div>
                </div>
            </header>

            {lastUpdate && (
                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                    Last Update: {lastUpdate.toLocaleTimeString()}
                </div>
            )}

            <div className={styles.queueContainer}>
                {/* Now Serving Card */}
                <div className={styles.nowServingCard}>
                    <div className={styles.currentDisplay}>
                        <span className={styles.label}>Now Serving</span>
                        <div className={styles.tokenDisplay}>{queueData.serving}</div>
                    </div>

                    {queueData.servingDetails && (
                        <div className={styles.userDetails}>
                            <h3>Customer Details</h3>
                            <div className={styles.detailRow}>
                                <span>Phone:</span> <strong>{queueData.servingDetails.user_phone_number}</strong>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Status:</span>
                                <span style={{
                                    color: queueData.servingDetails.visit_count > 1 ? '#047857' : '#d97706',
                                    fontWeight: 'bold'
                                }}>
                                    {queueData.servingDetails.visit_count > 1 ? 'Returning' : 'New Customer'}
                                </span>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Visits:</span> <strong>{queueData.servingDetails.visit_count}</strong>
                            </div>

                            {queueData.servingDetails.profile_data && Object.entries(queueData.servingDetails.profile_data).map(([key, value]) => (
                                <div key={key} className={styles.detailRow}>
                                    <span style={{ textTransform: 'capitalize' }}>{key}:</span> <strong>{String(value)}</strong>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.actions} style={{ marginTop: '1rem' }}>
                        <button className={`${styles.actionBtn} ${styles.btnNext}`} onClick={handleNext}>
                            CALL NEXT
                        </button>
                        <button className={`${styles.actionBtn} ${styles.btnSkip}`} onClick={handleSkip}>
                            SKIP
                        </button>
                    </div>
                </div>

                {/* Right Side: Stats & Waiting List */}
                <div className={styles.rightPanel}>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <h4>Waiting</h4>
                            <div className={styles.statValue}>{queueData.waitingCount}</div>
                        </div>
                        <div className={styles.statCard}>
                            <h4>Last Token</h4>
                            <div className={styles.statValue}>{queueData.lastToken}</div>
                        </div>
                    </div>

                    <div className={styles.waitingCheckList}>
                        <h3>Up Next</h3>
                        {queueData.waitingListDetails?.length > 0 ? (
                            <div className={styles.tableContainer}>
                                <table className={styles.queueTable}>
                                    <thead>
                                        <tr>
                                            <th>Token</th>
                                            <th>Waitable Customer</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {queueData.waitingListDetails.map((item, idx) => {
                                            // Find a name-like field or fallback to phone
                                            const nameKey = Object.keys(item).find(k => k.toLowerCase().includes('name'));
                                            const distinctName = nameKey ? item[nameKey] : null;
                                            const displayName = distinctName || item.phone || 'Guest';

                                            // Truncate if too long
                                            const displayStr = displayName.length > 20 ? displayName.substring(0, 18) + '...' : displayName;

                                            return (
                                                <tr key={idx}>
                                                    <td><span className={styles.tokenBadge}>{item.token}</span></td>
                                                    <td>
                                                        <div style={{ fontWeight: '600', color: '#374151' }}>{displayStr}</div>
                                                        {distinctName && <div style={{ fontSize: '0.8em', color: '#6b7280' }}>{item.phone}</div>}
                                                    </td>
                                                    <td>
                                                        <div className={styles.actionGroup}>
                                                            <button className={styles.iconBtn} onClick={() => setViewCustomer(item)} title="View Details">
                                                                👁️
                                                            </button>
                                                            <button className={styles.iconBtn} onClick={() => setEditCustomer(item)} title="Edit">
                                                                ✏️
                                                            </button>
                                                            <button className={styles.iconBtn} onClick={() => handleCancelToken(item)} title="Cancel" style={{ color: '#ef4444' }}>
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={styles.emptyState}>No one waiting in queue</div>
                        )}
                    </div>

                    <div className={styles.messageSection}>
                        <label>Display Message:</label>
                        <div className={styles.messageInputGroup}>
                            <input
                                type="text"
                                className={styles.input}
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="e.g. Lunch Break"
                            />
                            <button onClick={handleUpdateMessage} disabled={updatingMsg} className={styles.button} style={{ width: 'auto' }}>
                                Upd
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {viewCustomer && <ViewCustomerModal customer={viewCustomer} onClose={() => setViewCustomer(null)} />}
            {editCustomer && <EditCustomerModal customer={editCustomer} onClose={() => setEditCustomer(null)} onSave={handleSaveCustomer} />}
        </main>
    );
}
