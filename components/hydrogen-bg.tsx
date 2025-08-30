"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import { useRef } from "react"
import type * as THREE from "three"

// Simple H2 molecule: two spheres connected by a bond (cylinder)
function HydrogenMolecule() {
  const group = useRef<THREE.Group>(null!)
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.2
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Left Hydrogen atom */}
      <mesh position={[-1, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={"#60a5fa"} emissive={"#3b82f6"} emissiveIntensity={0.15} />
      </mesh>

      {/* Right Hydrogen atom */}
      <mesh position={[1, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={"#60a5fa"} emissive={"#3b82f6"} emissiveIntensity={0.15} />
      </mesh>

      {/* Bond */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 2, 24]} />
        <meshStandardMaterial color={"#93c5fd"} metalness={0.4} roughness={0.2} />
      </mesh>
    </group>
  )
}

export default function HydrogenBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 5]} intensity={0.8} />
        <HydrogenMolecule />
        {/* Very subtle controls; disabled zoom to keep background calm */}
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
        <Environment preset="city" />
      </Canvas>
      {/* Soft gradient overlay for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white/90"></div>
    </div>
  )
}
