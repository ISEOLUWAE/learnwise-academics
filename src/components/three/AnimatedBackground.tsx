import { Canvas } from "@react-three/fiber";
import { Float, Sphere } from "@react-three/drei";
import { useRef } from "react";
import { Mesh } from "three";

const FloatingParticles = () => {
  const meshRef = useRef<Mesh>(null);

  return (
    <>
      {[...Array(5)].map((_, i) => (
        <Float
          key={i}
          speed={1 + i * 0.2}
          rotationIntensity={0.5}
          floatIntensity={0.5}
          position={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 5
          ]}
        >
          <Sphere ref={meshRef} args={[0.2 + Math.random() * 0.3]}>
            <meshBasicMaterial
              color={i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#8b5cf6" : "#10b981"}
              transparent
              opacity={0.6}
            />
          </Sphere>
        </Float>
      ))}
    </>
  );
};

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <FloatingParticles />
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;