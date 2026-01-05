"use client";
import React, { useEffect, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import QueueFlow3D from './QueueFlow3D';

function MouseMoveEffectBase() {
    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            onMouseMove={handleMouseMove}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, overflow: 'hidden' }}
        >
            <motion.div
                style={{
                    background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(79, 70, 229, 0.15), transparent 80%)`,
                    position: 'absolute',
                    inset: 0,
                    willChange: 'background'
                }}
            />
        </div>
    );
}

const MouseMoveEffect = React.memo(MouseMoveEffectBase);


export default function Hero({ createForm }) {
    return (
        <section style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8rem 2rem 4rem',
            background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #0a0a0a 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* 3D Background */}
            <QueueFlow3D />

            {/* Background Ambience */}
            <MouseMoveEffect />
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '500px',
                height: '500px',
                background: 'var(--accent)',
                filter: 'blur(80px)',
                opacity: 0.1,
                borderRadius: '50%',
                zIndex: 0,
                transform: 'translate3d(0,0,0)',
                willChange: 'transform'
            }} />

            <div style={{
                maxWidth: '1200px',
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
                alignItems: 'center',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--border)',
                        borderRadius: '20px',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)'
                    }}>
                        ✨ Smart Queue Management v2.0
                    </div>
                    <h1 style={{
                        fontSize: '4rem',
                        lineHeight: 1.1,
                        fontWeight: 800,
                        marginBottom: '1.5rem',
                        color: 'white',
                        filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))'
                    }}>
                        {["Wait", "Less.", "Live", "More."].map((word, wIndex) => (
                            <span key={wIndex} style={{ display: 'inline-block', marginRight: '0.2em' }}>
                                {word.split('').map((char, cIndex) => (
                                    <motion.span
                                        key={cIndex}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: wIndex * 0.2 + cIndex * 0.05,
                                            type: "spring",
                                            damping: 12
                                        }}
                                        style={{ display: 'inline-block', background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                                {wIndex === 1 && <br />}
                            </span>
                        ))}
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        maxWidth: '500px',
                        marginBottom: '2rem'
                    }}>
                        Transform your customer experience with our intelligent, no-hardware queue system.
                        Create a queue instantly and let your customers join from anywhere.
                    </p>

                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>10k+</h3>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Users served</span>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>0s</h3>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Setup time</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Content (The Form) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '2rem',
                        borderRadius: '24px',
                        position: 'relative',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}
                >
                    {/* Animated Border Gradient */}
                    <div style={{
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '26px',
                        background: 'linear-gradient(45deg, #4f46e5, #ec4899, #4f46e5)',
                        backgroundSize: '200% 200%',
                        zIndex: -1,
                        animation: 'shimmer 3s linear infinite',
                        opacity: 0.5
                    }} />
                    <style jsx>{`
                        @keyframes shimmer {
                            0% { background-position: 0% 50% }
                            50% { background-position: 100% 50% }
                            100% { background-position: 0% 50% }
                        }
                    `}</style>
                    <div style={{ position: 'relative', zIndex: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: '24px', height: '100%' }}>
                        {createForm}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
