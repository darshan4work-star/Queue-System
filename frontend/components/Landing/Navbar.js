"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import MagneticButton from './MagneticButton';

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(10, 10, 10, 0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 50,
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: 'var(--border)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
                <div style={{ backgroundColor: 'var(--accent)', padding: '6px', borderRadius: '12px', display: 'flex' }}>
                    <LayoutGrid size={20} color="white" />
                </div>
                <span>QueueNow</span>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }}>Features</a>
                <a href="#story" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }}>Our Story</a>
                <a href="#contact" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }}>Contact</a>
            </div>

            <MagneticButton style={{
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                padding: '0.8rem 2rem',
                borderRadius: '9999px',
                fontWeight: '600',
                fontSize: '0.9rem'
            }}>
                <span style={{ position: 'relative', zIndex: 10 }}>Get a Demo</span>
            </MagneticButton>
        </motion.nav>
    );
}
