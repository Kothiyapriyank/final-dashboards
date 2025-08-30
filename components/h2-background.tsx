/* eslint-disable react/no-unknown-property */
"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import type * as THREE from "three"

function HydrogenMolecule() {
  const group = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.12
      group.current.rotation.x = Math.sin(performance.now() * 0.0002) * 0.15
    }
  })

  return (
    <group ref={group}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 2.2, 24]} />
        <meshStandardMaterial color={"#10b981"} metalness={0.35} roughness={0.25} />
      </mesh>
      <mesh position={[-1.2, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color={"#34d399"} metalness={0.55} roughness={0.2} />
      </mesh>
      <mesh position={[1.2, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color={"#059669"} metalness={0.55} roughness={0.2} />
      </mesh>
      {Array.from({ length: 24 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i) * 3.5, Math.cos(i * 1.7) * 2, (i % 6) - 3]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color={"#a7f3d0"} emissive={"#34d399"} emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  )
}

export default function H2Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" style={{ background: "#f7fdfa" }}>
      <Canvas className="opacity-60" camera={{ position: [0, 0, 5], fov: 55 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 5, 6]} intensity={0.8} />
        <HydrogenMolecule />
        <Html wrapperClass="sr-only">
          <span>Decorative hydrogen molecule background</span>
        </Html>
      </Canvas>
    </div>
  )
}
