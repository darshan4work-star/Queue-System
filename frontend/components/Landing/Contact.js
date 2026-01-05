"use client";
import React from 'react';
import ContactForm from './ContactForm';

export default function Contact() {
    return (
        <footer id="contact" style={{ padding: '4rem 2rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Ready to transform your queue?</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Join thousands of businesses streamlining their operations today.
                </p>

                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Contact Support</a>
                </div>

                <ContactForm />

                <p style={{ marginTop: '3rem', color: '#444', fontSize: '0.8rem' }}>
                    © 2026 QueueNow. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
