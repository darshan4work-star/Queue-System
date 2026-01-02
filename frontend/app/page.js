"use client";
import React, { useState, useEffect } from 'react';
import { socket } from './socket'; // Direct import since it's same dir level in app maybe? No, socket.js is in app/
import styles from './page.module.css';

export default function Home() {
  const [phone, setPhone] = useState('');
  const [myToken, setMyToken] = useState(null);
  const [shopId, setShopId] = useState('store1'); // Default for MVP
  const [queueStatus, setQueueStatus] = useState({ serving: '--', waiting: 0 });
  const [mode, setMode] = useState('LANDING'); // LANDING, TOKEN_VIEW

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('join_shop', shopId);

    socket.on('queue_update', (data) => {
      setQueueStatus(prev => ({
        ...prev,
        serving: data.serving,
        waiting: data.waiting
      }));
    });

    return () => {
      socket.off('queue_update');
    };
  }, [shopId]);

  const handleGetToken = async () => {
    if (!phone) return alert("Please enter phone number");

    try {
      const res = await fetch('http://localhost:5000/api/webhook/missed-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Using default store1 since public user doesn't know ID in this simple UI
        body: JSON.stringify({
          shop_id: shopId,
          user_phone: phone
        })
      });
      const data = await res.json();
      if (data.success) {
        setMyToken(data.token);
        setMode('TOKEN_VIEW');
        setQueueStatus({
          serving: data.queueStatus.serving,
          waiting: data.queueStatus.waiting
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to get token");
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>QueueStatus</h1>
        <p>Digital Token System</p>
      </header>

      {mode === 'LANDING' ? (
        <div className={styles.card}>
          <h2>Join the Queue</h2>
          <div className={styles.inputGroup}>
            <input
              type="tel"
              placeholder="Enter Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
            />
            <button className={styles.button} onClick={handleGetToken}>Get Token</button>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
            Enter your number to generate a token instantly.
          </p>
        </div>
      ) : (
        <div className={styles.card} style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <h2>Your Token</h2>
          <div className={styles.bigNumber} style={{ fontSize: '3.5rem', margin: '1rem 0' }}>
            {myToken?.token_number || 'A--'}
          </div>
          <p style={{ marginBottom: '1rem', color: '#166534' }}>
            Please wait for your turn.
          </p>
          <button
            className={styles.button}
            style={{ backgroundColor: 'transparent', color: '#666', border: '1px solid #ddd' }}
            onClick={() => { setMode('LANDING'); setPhone(''); setMyToken(null); }}
          >
            Get Another Token
          </button>
        </div>
      )}

      <div className={styles.statusGrid}>
        <div className={styles.statusCard}>
          <h3>Now Serving</h3>
          <div className={styles.bigNumber}>{queueStatus.serving}</div>
        </div>
        <div className={styles.statusCard}>
          <h3>Waiting</h3>
          <div className={styles.number}>{queueStatus.waiting}</div>
        </div>
      </div>

    </main>
  );
}
