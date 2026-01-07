"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { socket } from '../../socket';
import styles from './display.module.css';
import { API_URL } from '../../../utils/config';

export default function DisplayPage() {
    const { shopId } = useParams();
    const [vendor, setVendor] = useState(null);
    const [queue, setQueue] = useState({ serving: '--', waitingCount: 0, lastToken: '--' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!shopId) return;

        // Fetch Initial Data
        fetch(`${API_URL}/api/public/${shopId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setVendor(data.vendor);
                    setQueue(data.queue);
                    setMessage(data.vendor.custom_message);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        // Socket Connection
        function onConnect() {
            socket.emit('join_shop', shopId);
        }

        function onQueueUpdate(data) {
            console.log("Queue Update:", data);
            setQueue(prev => ({
                ...prev,
                serving: data.serving,
                waitingCount: data.waitingCount || data.waiting || 0,
                lastToken: data.last || prev.lastToken
            }));
        }

        function onMessageUpdate(data) {
            console.log("Message Update:", data);
            setMessage(data.custom_message);
        }

        socket.on('connect', onConnect);
        socket.on('queue_update', onQueueUpdate);
        socket.on('message_update', onMessageUpdate);

        if (socket.connected) {
            onConnect();
        } else {
            socket.connect();
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('queue_update', onQueueUpdate);
            socket.off('message_update', onMessageUpdate);
        };
    }, [shopId]);

    if (loading) return <div className={styles.center}>Loading Display...</div>;
    if (!vendor) return <div className={styles.center}>Shop Not Found</div>;

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                {vendor.logo_url && <img src={vendor.logo_url} alt="Logo" className={styles.logo} />}
                <h1>{vendor.name}</h1>
            </header>

            {message && (
                <div className={styles.marqueeContainer}>
                    <div className={styles.marqueeText}>{message}</div>
                </div>
            )}

            <div className={styles.displayBoard}>
                <div className={styles.servingSection}>
                    <div className={styles.label}>NOW SERVING</div>
                    <div className={styles.tokenNumber}>{queue.serving}</div>
                </div>

                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <div className={styles.label}>Wait Time</div>
                        <div className={styles.value}>~{queue.waitingCount * 5} min</div>
                    </div>
                </div>
            </div>
            <div className={styles.footer}>
                Scanner for Booking coming soon
            </div>
        </main>
    );
}
