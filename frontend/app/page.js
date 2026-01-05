"use client";
import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import Navbar from '../components/Landing/Navbar';
import Hero from '../components/Landing/Hero';
import Features from '../components/Landing/Features';
import Contact from '../components/Landing/Contact';
import styles from './page.module.css';

export default function Home() {
  // Create Queue State
  const [newVendor, setNewVendor] = useState({ name: '', phone: '', email: '', password: '', shop_id: '', business_type: 'custom' });
  const [creating, setCreating] = useState(false);
  const [createdVendor, setCreatedVendor] = useState(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  const handleInstantCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newVendor.name,
          is_instant: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setCreatedVendor(data.vendor);
      } else {
        alert(data.error || "Failed to create queue");
      }
    } catch (e) {
      console.error(e);
      alert("Error creating queue");
    } finally {
      setCreating(false);
    }
  };

  // The Form Component to pass to Hero
  const createQueueForm = (
    !createdVendor ? (
      <form onSubmit={handleInstantCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Get Started</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Create your queue instantly. No account required.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Queue Name</label>
          <input
            type="text"
            placeholder="e.g. Dr. Smith Clinic"
            required
            style={{
              padding: '1rem',
              borderRadius: '9999px',
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
            value={newVendor.name}
            onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
          />
        </div>

        <button
          disabled={creating}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            padding: '1rem',
            borderRadius: '9999px',
            fontWeight: 'bold',
            fontSize: '1rem',
            border: 'none',
            cursor: creating ? 'wait' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {creating ? 'Creating...' : 'Create Queue'}
        </button>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          By clicking create, you agree to our Terms.
        </p>
      </form>
    ) : (
      <div style={{ textAlign: 'left' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#34d399', marginTop: 0, fontSize: '1.5rem' }}>Queue Created!</h3>
          <p style={{ marginBottom: '1rem' }}><strong>Shop ID:</strong> <span style={{ color: 'white' }}>{createdVendor.shop_id}</span></p>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Admin Credentials:</p>
            <p style={{ margin: '0', fontSize: '0.95rem' }}>Email: <code style={{ color: '#fff' }}>{createdVendor.email}</code></p>
            <p style={{ margin: '0', fontSize: '0.95rem' }}>Pass: <code style={{ color: '#fff' }}>{createdVendor.generated_password}</code></p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a href="/vendor" target="_blank" style={{ background: 'var(--accent)', color: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold' }}>
            Open Vendor Panel
          </a>
          <a href={`/display/${createdVendor.shop_id}`} target="_blank" style={{ background: 'transparent', color: 'white', border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
            Open Display Panel
          </a>
          <a href={`/book/${createdVendor.shop_id}`} target="_blank" style={{ background: 'transparent', color: 'white', border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
            Open Booking Panel
          </a>
        </div>
      </div>
    )
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <Hero createForm={createQueueForm} />
      <Features />

      {/* Our Story Section */}
      <section id="story" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Our Story</h2>
          <p style={{ fontSize: '1.2rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            We believe time is the most valuable currency. In a post-pandemic world, waiting in crowded lines isn't just inefficient—it's unsafe.
            QueueNow was born from a simple idea: <strong>Wait where you want.</strong>
            By digitizing the queue, we give freedom back to your customers and control back to your business.
          </p>
        </div>
      </section>

      <Contact />
    </main>
  );
}
