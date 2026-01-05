"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Smartphone, QrCode, Lock } from 'lucide-react';

const features = [
    {
        icon: <Zap size={24} />,
        title: "Instant Setup",
        desc: "No signups, no hardware. Create a queue in seconds and start serving."
    },
    {
        icon: <QrCode size={24} />,
        title: "QR Integration",
        desc: "Customers join by scanning a QR code. No app download required."
    },
    {
        icon: <Smartphone size={24} />,
        title: "Real-time Updates",
        desc: "Live status updates keep your customers informed and relaxed."
    },
    {
        icon: <Lock size={24} />,
        title: "Secure & Private",
        desc: "We value privacy. Guest mode allows anonymous joining for customers."
    }
];

export default function Features() {
    return (
        <section id="features" style={{ padding: '6rem 2rem', background: 'var(--bg-primary)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        Why choose QueueNow?
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Built for modern businesses that value time and efficiency.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem'
                }}>
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(79, 70, 229, 0.3)' }}
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                padding: '2rem',
                                borderRadius: '16px',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: 'var(--border)',
                                cursor: 'default'
                            }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(79, 70, 229, 0.1)',
                                color: 'var(--accent)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>{f.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section >
    );
}
