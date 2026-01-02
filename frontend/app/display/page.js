"use client";
import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import { useSearchParams } from 'next/navigation';
import styles from './display.module.css';

export default function DisplayPanel() {
    const [currentInfo, setCurrentInfo] = useState({
        serving: '--',
        waitingList: [],
        customMessage: "Welcome to Queue System",
        shopName: "Loading..."
    });

    const [isConnected, setIsConnected] = useState(false);
    const [flash, setFlash] = useState(false);
    const searchParams = useSearchParams();
    const shopId = searchParams.get('shop_id') || 'store1';
    const [time, setTime] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);

        if (!socket.connected) {
            socket.connect();
        }

        function onConnect() {
            setIsConnected(true);
            socket.emit('join_shop', shopId);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        function onQueueUpdate(data) {
            // Trigger Flash Animation
            setFlash(true);
            setTimeout(() => setFlash(false), 1000);

            setCurrentInfo(prev => ({
                ...prev,
                serving: data.serving,
                waitingList: data.waitingList || []
            }));
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('queue_update', onQueueUpdate);

        if (socket.connected) {
            onConnect();
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('queue_update', onQueueUpdate);
            clearInterval(timer);
        };
    }, [shopId]);

    return (
        <main className={styles.displayContainer}>
            <header className={styles.header}>
                <div className={styles.logoArea} style={{ color: isConnected ? '#f59e0b' : '#ef4444' }}>
                    {currentInfo.shopName} {isConnected ? '' : '• Disconnected'}
                </div>
                <div className={styles.clock}>{time}</div>
            </header>

            <div className={styles.content}>
                <div className={`${styles.mainDisplay} ${flash ? 'animate-update' : ''}`} style={{ transition: 'background-color 0.5s' }}>
                    <div className={styles.label}>NOW SERVING</div>
                    <div className={styles.tokenBig}>{currentInfo.serving}</div>
                    {flash && <div style={{ color: '#10b981', fontSize: '1.5rem', marginTop: '1rem' }}>UPDATING...</div>}
                </div>

                <div className={styles.sidePanel}>
                    <div className={styles.nextLabel}>COMING UP NEXT</div>
                    <div className={styles.nextList}>
                        {currentInfo.waitingList.length > 0 ? (
                            currentInfo.waitingList.map((token, i) => (
                                <div key={i} className={styles.nextToken}>{token}</div>
                            ))
                        ) : (
                            <div className={styles.nextToken} style={{ opacity: 0.5 }}>No Waiting</div>
                        )}
                    </div>
                </div>
            </div>

            <footer className={styles.footer}>
                <div className={styles.scrollingText}>
                    {currentInfo.customMessage}
                </div>
            </footer>
        </main>
    );
}
