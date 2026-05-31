"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Animated GLSL shader background (React Three Fiber). A flowing teal/navy
 * field driven by simplex-ish noise in the fragment shader. The two colors
 * tween smoothly toward their targets, so switching between the login and
 * register palettes produces a gentle color shift rather than a hard cut.
 */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec2 uRes;

  // Cheap value noise.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = uv;
    p.x *= aspect;

    float t = uTime * 0.06;
    float n = fbm(p * 2.6 + vec2(t, -t * 0.7));
    n += 0.4 * fbm(p * 5.0 - vec2(t * 0.5, t));

    // Soft diagonal flow + vignette.
    float flow = smoothstep(0.2, 1.1, n + (uv.x + uv.y) * 0.25);
    vec3 col = mix(uColor2, uColor1, flow);

    float vig = smoothstep(1.25, 0.25, length(uv - 0.5));
    col *= mix(0.55, 1.05, vig);

    // Subtle grain.
    col += (hash(uv * uRes + uTime) - 0.5) * 0.025;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function ShaderPlane({ color1, color2 }: { color1: string; color2: string }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const target1 = useMemo(() => new THREE.Color(color1), [color1]);
  const target2 = useMemo(() => new THREE.Color(color2), [color2]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(color1) },
      uColor2: { value: new THREE.Color(color2) },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    // Initialise once; colors are tweened in useFrame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value += delta;
    mat.uniforms.uRes.value.set(state.size.width, state.size.height);
    // Smooth color shift toward the current palette.
    (mat.uniforms.uColor1.value as THREE.Color).lerp(target1, 0.04);
    (mat.uniforms.uColor2.value as THREE.Color).lerp(target2, 0.04);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/**
 * Full-page fixed shader background. `color1` is the highlight, `color2` the
 * deep base. Render this behind the auth cards.
 */
export function HeroGeometric({
  color1 = "#1B7C8A",
  color2 = "#0A1628",
}: {
  color1?: string;
  color2?: string;
}) {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0A1628]">
      <Canvas
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 1] }}
      >
        <ShaderPlane color1={color1} color2={color2} />
      </Canvas>
    </div>
  );
}
