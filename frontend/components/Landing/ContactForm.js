"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';

export default function ContactForm() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch('http://localhost:5000/api/contact/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();

            if (data.success) {
                setStatus('success');
                setForm({ name: '', email: '', message: '' });
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div style={{ marginTop: '3rem', textAlign: 'left', maxWidth: '500px', margin: '3rem auto 0' }}>
            {status === 'success' ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '2rem', borderRadius: '16px', textAlign: 'center', color: '#34d399' }}
                >
                    <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
                    <h3>Message Sent!</h3>
                    <p>We'll get back to you shortly.</p>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Name"
                            required
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }}
                        />
                    </div>
                    <textarea
                        placeholder="How can we help?"
                        required
                        rows={4}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white', resize: 'none' }}
                    />
                    <button
                        disabled={status === 'submitting'}
                        style={{
                            padding: '1rem',
                            borderRadius: '9999px',
                            background: 'white',
                            color: 'black',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {status === 'submitting' ? 'Sending...' : <><Send size={18} /> Send Message</>}
                    </button>
                    {status === 'error' && <p style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>Failed to send. Please try again.</p>}
                </form>
            )}
        </div>
    );
}
