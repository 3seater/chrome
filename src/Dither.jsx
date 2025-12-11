/* eslint-disable react/no-unknown-property */

import { useRef, useEffect, forwardRef, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Effect } from 'postprocessing';
import * as THREE from 'three';
import './Dither.css';

const imageVertexShader = `
precision highp float;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const imageFragmentShader = `
precision highp float;
uniform sampler2D imageTexture;
uniform float time;
uniform float brightness;
uniform vec2 resolution;
uniform vec2 mousePos;
uniform int enableMouseInteraction;
uniform float mouseRadius;
varying vec2 vUv;

void main() {
  vec4 texColor = texture2D(imageTexture, vUv);
  
  // Convert to grayscale
  float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
  
  // Apply brightness and subtle wave effect
  float wave = sin(vUv.x * 10.0 + time * 0.5) * 0.05;
  gray = clamp(gray * brightness + wave, 0.0, 1.0);
  
  // Mouse interaction effect - very subtle darkening, dither still visible
  if (enableMouseInteraction == 1) {
    vec2 screenUv = gl_FragCoord.xy / resolution.xy;
    vec2 mouseNDC = mousePos / resolution;
    mouseNDC.y = 1.0 - mouseNDC.y;
    float dist = length(screenUv - mouseNDC);
    // Gradual fade from center
    float effect = 1.0 - smoothstep(mouseRadius * 0.2, mouseRadius, dist);
    // Very subtle darkening - dither still visible underneath
    gray *= (1.0 - effect * 0.4);
  }
  
  gl_FragColor = vec4(vec3(gray), texColor.a);
}
`;

const ditherFragmentShader = `
precision highp float;
uniform float colorNum;
uniform float pixelSize;

const float bayerMatrix8x8[64] = float[64](
  0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
  32.0/64.0,16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0,19.0/64.0, 47.0/64.0, 31.0/64.0,
  8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0,59.0/64.0,  7.0/64.0, 55.0/64.0,
  40.0/64.0,24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0,27.0/64.0, 39.0/64.0, 23.0/64.0,
  2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0,49.0/64.0, 13.0/64.0, 61.0/64.0,
  34.0/64.0,18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0,17.0/64.0, 45.0/64.0, 29.0/64.0,
  10.0/64.0,58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0,57.0/64.0,  5.0/64.0, 53.0/64.0,
  42.0/64.0,26.0/64.0, 38.0/64.0, 22.0/64.0, 41.0/64.0,25.0/64.0, 37.0/64.0, 21.0/64.0
);

vec3 dither(vec2 uv, vec3 color) {
  vec2 scaledCoord = floor(uv * resolution / pixelSize);
  int x = int(mod(scaledCoord.x, 8.0));
  int y = int(mod(scaledCoord.y, 8.0));
  float threshold = bayerMatrix8x8[y * 8 + x] - 0.5;
  float step = 1.0 / (colorNum - 1.0);
  color += threshold * step * 0.5;
  return floor(color * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
}

void mainImage(in vec4 inputColor, in vec2 uv, out vec4 outputColor) {
  vec2 normalizedPixelSize = pixelSize / resolution;
  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
  vec4 color = texture2D(inputBuffer, uvPixel);
  color.rgb = dither(uv, color.rgb);
  outputColor = color;
}
`;

class RetroEffectImpl extends Effect {
  constructor() {
    const uniforms = new Map([
      ['colorNum', new THREE.Uniform(4.0)],
      ['pixelSize', new THREE.Uniform(2.0)]
    ]);
    super('RetroEffect', ditherFragmentShader, { uniforms });
    this.uniforms = uniforms;
  }

  set colorNum(v) {
    this.uniforms.get('colorNum').value = v;
  }

  get colorNum() {
    return this.uniforms.get('colorNum').value;
  }

  set pixelSize(v) {
    this.uniforms.get('pixelSize').value = v;
  }

  get pixelSize() {
    return this.uniforms.get('pixelSize').value;
  }
}

const WrappedRetro = wrapEffect(RetroEffectImpl);

const RetroEffect = forwardRef((props, ref) => {
  const { colorNum, pixelSize } = props;
  return <WrappedRetro ref={ref} colorNum={colorNum} pixelSize={pixelSize} />;
});

RetroEffect.displayName = 'RetroEffect';

function DitheredImage({
  imageSrc,
  colorNum,
  pixelSize,
  disableAnimation,
  brightness,
  enableMouseInteraction,
  mouseRadius
}) {
  const mesh = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const { viewport, size, gl } = useThree();
  const texture = useLoader(THREE.TextureLoader, imageSrc);
  
  const imageUniformsRef = useRef({
    imageTexture: new THREE.Uniform(null),
    time: new THREE.Uniform(0),
    brightness: new THREE.Uniform(brightness),
    resolution: new THREE.Uniform(new THREE.Vector2(0, 0)),
    mousePos: new THREE.Uniform(new THREE.Vector2(0, 0)),
    enableMouseInteraction: new THREE.Uniform(enableMouseInteraction ? 1 : 0),
    mouseRadius: new THREE.Uniform(mouseRadius)
  });

  useEffect(() => {
    if (texture) {
      imageUniformsRef.current.imageTexture.value = texture;
    }
  }, [texture]);

  useEffect(() => {
    const dpr = gl.getPixelRatio();
    const w = Math.floor(size.width * dpr);
    const h = Math.floor(size.height * dpr);
    const res = imageUniformsRef.current.resolution.value;
    if (res.x !== w || res.y !== h) {
      res.set(w, h);
    }
  }, [size, gl]);

  useFrame(({ clock }) => {
    const u = imageUniformsRef.current;
    if (!disableAnimation) {
      u.time.value = clock.getElapsedTime();
    }
    u.brightness.value = brightness;
    u.enableMouseInteraction.value = enableMouseInteraction ? 1 : 0;
    u.mouseRadius.value = mouseRadius;
    if (enableMouseInteraction) {
      u.mousePos.value.copy(mouseRef.current);
    }
  });

  // Use window-level mouse tracking to work through overlapping elements
  useEffect(() => {
    if (!enableMouseInteraction) return;
    
    const handleMouseMove = (e) => {
      const rect = gl.domElement.getBoundingClientRect();
      const dpr = gl.getPixelRatio();
      mouseRef.current.set((e.clientX - rect.left) * dpr, (e.clientY - rect.top) * dpr);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableMouseInteraction, gl]);

  return (
    <>
      <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={imageVertexShader}
          fragmentShader={imageFragmentShader}
          uniforms={imageUniformsRef.current}
        />
      </mesh>
      <EffectComposer>
        <RetroEffect colorNum={colorNum} pixelSize={pixelSize} />
      </EffectComposer>
    </>
  );
}

export default function Dither({
  imageSrc = '/MainImage/download.jpg',
  colorNum = 4,
  pixelSize = 2,
  disableAnimation = false,
  brightness = 0.3,
  enableMouseInteraction = true,
  mouseRadius = 1
}) {
  return (
    <Canvas
      className="dither-container"
      camera={{ position: [0, 0, 6] }}
      dpr={1}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <DitheredImage
        imageSrc={imageSrc}
        colorNum={colorNum}
        pixelSize={pixelSize}
        disableAnimation={disableAnimation}
        brightness={brightness}
        enableMouseInteraction={enableMouseInteraction}
        mouseRadius={mouseRadius}
      />
    </Canvas>
  );
}

