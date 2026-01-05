"use client";
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';

function Token({ position, color, label }) {
    const mesh = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Gentle floating
        mesh.current.position.y = position[1] + Math.sin(t / 2 + position[0]) * 0.2;
        mesh.current.rotation.x = Math.sin(t / 3) * 0.2;
        mesh.current.rotation.y = Math.cos(t / 4) * 0.2;
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group position={position} ref={mesh}>
                <mesh>
                    <sphereGeometry args={[0.4, 32, 32]} />
                    <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
                </mesh>
                <Text
                    position={[0, 0, 0.5]}
                    fontSize={0.3}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {label}
                </Text>
            </group>
        </Float>
    );
}

function Path() {
    return (
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[10, 2]} />
            <meshStandardMaterial color="#222" transparent opacity={0.5} />
        </mesh>
    );
}

import { useInView } from 'framer-motion';

export default function QueueFlow3D() {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "100px" });

    return (
        <div ref={ref} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.6 }}>
            <Canvas
                frameloop={isInView ? "always" : "never"}
                dpr={[1, 1.5]}
                performance={{ min: 0.5 }}
                gl={{ powerPreference: "high-performance", antialias: false, stencil: false, depth: false }}
            >
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Environment preset="city" />

                {/* Distributed background tokens */}
                <group position={[0, -2, 0]}>
                    <Token position={[-6, 2, -5]} color="#4f46e5" label="" />
                    <Token position={[6, -1, -2]} color="#6366f1" label="" />
                    <Token position={[-4, -3, -4]} color="#818cf8" label="" />
                    <Token position={[5, 4, -8]} color="#4338ca" label="" />
                </group>
            </Canvas>
        </div>
    );
}
