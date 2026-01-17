import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = (props) => {
    const ref = useRef();

    // Generate particle positions
    const [positions, finalPositions] = useMemo(() => {
        const count = 300; // Low count for performance
        const positions = new Float32Array(count * 3);
        const finalPositions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 15;
            positions[i3 + 1] = (Math.random() - 0.5) * 15;
            positions[i3 + 2] = (Math.random() - 0.5) * 15;
        }
        return [positions, finalPositions];
    }, []);

    useFrame((state, delta) => {
        if (!ref.current) return;

        // Gentle rotation
        ref.current.rotation.x -= delta / 30;
        ref.current.rotation.y -= delta / 40;

        // Subtle wave effect handled by point size or shader if needed, 
        // but for now pure rotation is performant and looks good.
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#06b6d4" // gemini-cyan
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.4}
                />
            </Points>
        </group>
    );
};

export const NeuralField = () => {
    // Detect low power mode or mobile constraints purely via CSS/Logic if needed,
    // but React Three Fiber is generally efficient enough for this simple scene.
    // Fallback logic can be implemented by parent handling errors or lazy loading.

    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 60 }}
                dpr={[1, 1.5]} // Cap DPR for performance
                gl={{ antialias: false, alpha: true }} // Optimize GL context
            >
                <ParticleField />
            </Canvas>
        </div>
    );
};
