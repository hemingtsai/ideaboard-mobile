<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

// ==================== Props ====================
const props = withDefaults(
    defineProps<{
        /** 点间距 (px) */
        dotSpacing?: number;
        /** 波速 */
        waveSpeed?: number;
        /** 波峰宽度比例 */
        waveWidth?: number;
        /** 鼠标涟漪半径 */
        mouseRadius?: number;
        /** 鼠标交互强度 */
        mouseStrength?: number;
        /** 环境亮度 (最低) */
        ambientBrightness?: number;
        /** 峰值亮度 */
        peakBrightness?: number;
        /** 是否自动播放海浪，默认 false */
        playing?: boolean;
        /** 单次触发的海浪持续时间 (秒)，默认自动计算一个完整周期 */
        duration?: number;
        /** 非线性缓动动画，默认关闭 */
        easing?: boolean;
    }>(),
    {
        dotSpacing: 4,
        waveSpeed: 0.28,
        waveWidth: 0.4,
        mouseRadius: 150,
        mouseStrength: 0.8,
        ambientBrightness: 0.0,
        peakBrightness: 0.95,
        playing: true,
        duration: 0,
        easing: false,
    },
);

// ==================== Refs ====================
const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

// ==================== Three.js 状态 ====================
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let points: THREE.Points;
let geometry: THREE.BufferGeometry;
let material: THREE.ShaderMaterial;
let currentCamera: THREE.OrthographicCamera;
let cssWidth = 0;
let cssHeight = 0;
let animationId = 0;
let resizeObserver: ResizeObserver | null = null;

const accentColor = new THREE.Color();
const bgColor = new THREE.Color();

// 鼠标状态
let mouseX = -999;
let mouseY = -999;
let mouseActive = false;
let mouseIntensity = 0;
let mouseClickStrength = 0;

// 定时器 (替代 THREE.Clock)
let lastTime = 0;

// 手动触发海浪
let waveElapsed = 0;
let waveTarget = 0;

const CONFIG = {
    dotSizeFactor: 0.85,
    gapFactor: 0.5,
    riseSigma: 1.2,
    fallSigma: 0.4,
    rippleAmplitude: 0.2,
    rippleFreq: 2.2,
    microAmplitude: 0.1,
    microFreq: 5.5,
    rowPhaseAmp: 0.6,
    rowPhaseFreq: 0.25,
    timeFactor: 0.2,
    mouseDecay: 0.03,
    mouseRippleSpeed: 6.0,
    mouseClickBoost: 2.5,
};

// ==================== 主题颜色 ====================
function resolveCSSVar(name: string): string {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
}
function updateThemeColors() {
    accentColor.set(resolveCSSVar("--accent") || "#000000");
    bgColor.set(resolveCSSVar("--bg-tertiary") || "#ebebeb");
    if (material) {
        material.uniforms.uAccentColor.value.copy(accentColor);
        material.uniforms.uBgColor.value.copy(bgColor);
    }
}

// ==================== 着色器 ====================
const vertexShader = /* glsl */ `
    attribute float size;
    varying vec3 vWorldPosition;
    void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size;
        gl_Position = projectionMatrix * mvPosition;
        vWorldPosition = position;
    }
`;

const fragmentShader = /* glsl */ `
    precision highp float;
    varying vec3 vWorldPosition;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uAccentColor;
    uniform vec3 uBgColor;
    uniform float uWaveSpeed;
    uniform float uWaveWidth;
    uniform float uGapFactor;
    uniform float uRiseSigma;
    uniform float uFallSigma;
    uniform float uRippleAmplitude;
    uniform float uRippleFreq;
    uniform float uMicroAmplitude;
    uniform float uMicroFreq;
    uniform float uRowPhaseAmp;
    uniform float uRowPhaseFreq;
    uniform float uTimeFactor;
    uniform float uAmbient;
    uniform float uPeak;
    uniform vec2 uMousePos;
    uniform float uMouseActive;
    uniform float uMouseRadius;
    uniform float uMouseStrength;
    uniform float uMouseRippleSpeed;
    uniform float uSingleWave;
    uniform float uEasing;
    uniform float uDuration;

    float naturalPulse(float phase, float riseSigma, float fallSigma) {
        float p = clamp(phase, -3.14159, 3.14159);
        float sigma = p >= 0.0 ? riseSigma : fallSigma;
        float norm = p / 3.14159;
        return exp(-abs(norm) / sigma);
    }

    void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;

        float x = vWorldPosition.x;
        float y = vWorldPosition.y;
        float w = uResolution.x;
        float h = uResolution.y;

        float rowPhase = sin(y / h * 6.28318 * uRowPhaseFreq + uTime * uTimeFactor) * uRowPhaseAmp;

        float peakWidth = uWaveWidth * w;
        float gapWidth = peakWidth * uGapFactor;
        float period = peakWidth + gapWidth;
        // 非线性缓动
        float t = uTime;
        if (uEasing > 0.5 && uDuration > 0.0) {
            float p = clamp(uTime / uDuration, 0.0, 1.0);
            // ease-in-out (smoothstep)
            float eased = p * p * (3.0 - 2.0 * p);
            t = eased * uDuration;
        }
        float vt = uWaveSpeed * w * t;
        // 单次触发：不重复；自动播放：重复波浪
        float xMod;
        if (uSingleWave > 0.5) {
            // 单次海浪：波峰从 -peakWidth 移动到 w
            float waveCenter = vt - peakWidth * 0.5;
            xMod = x - waveCenter;
        } else {
            xMod = fract((x - vt + rowPhase * peakWidth * 0.3) / period) * period;
        }

        float waveBrightness = 0.0;
        if (xMod < peakWidth) {
            float phase = (xMod - peakWidth * 0.5) / (peakWidth * 0.5) * 3.14159;
            float pulse = naturalPulse(phase, uRiseSigma, uFallSigma);
            float det1 = sin(phase * uRippleFreq + uTime * 2.0) * uRippleAmplitude;
            float det2 = sin(phase * uMicroFreq - uTime * 3.0) * uMicroAmplitude;
            waveBrightness = pulse * (1.0 + det1 + det2);
        }

        float mouseDist = length(vWorldPosition.xy - uMousePos);
        float mouseInfluence = 1.0 - smoothstep(0.0, uMouseRadius, mouseDist);
        float rippleWave = sin(mouseDist * 0.1 - uTime * uMouseRippleSpeed) * 0.5 + 0.5;
        float mouseBrightness = mouseInfluence * rippleWave * uMouseStrength * uMouseActive;
        float glow = exp(-mouseDist * mouseDist / (uMouseRadius * uMouseRadius * 0.2)) * uMouseActive * 0.4;
        mouseBrightness += glow;

        float finalBrightness = max(waveBrightness, mouseBrightness);
        finalBrightness = clamp(finalBrightness, uAmbient, uPeak);
        finalBrightness = max(finalBrightness, uAmbient);
        finalBrightness *= (1.0 - d);

        if (finalBrightness < 0.02) discard;

        vec3 color = mix(uBgColor, uAccentColor, finalBrightness);
        if (finalBrightness > 0.6) {
            float hl = (finalBrightness - 0.6) / 0.4;
            color = mix(color, vec3(1.0), hl * 0.6);
        }
        if (mouseBrightness > 0.2) {
            color = mix(color, vec3(1.0), mouseBrightness * 0.4);
        }

        gl_FragColor = vec4(color, 1.0);
    }
`;

// ==================== 几何体 ====================
function createPointsGeometry(w: number, h: number): THREE.BufferGeometry {
    const spacing = props.dotSpacing;
    const cols = Math.floor(w / spacing);
    const rows = Math.floor(h / spacing);
    const totalW = cols * spacing;
    const totalH = rows * spacing;
    const offsetX = (w - totalW) / 2;
    const offsetY = (h - totalH) / 2;

    const vertexCount = cols * rows;
    const positions = new Float32Array(vertexCount * 3);
    const sizes = new Float32Array(vertexCount);
    const dotSize = spacing * CONFIG.dotSizeFactor;

    let i = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            positions[i * 3] = offsetX + col * spacing;
            positions[i * 3 + 1] = offsetY + row * spacing;
            positions[i * 3 + 2] = 0;
            sizes[i] = dotSize;
            i++;
        }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geom;
}

// ==================== 场景构建 ====================
function buildScene() {
    if (points) {
        scene.remove(points);
        geometry.dispose();
        material.dispose();
    }

    geometry = createPointsGeometry(cssWidth, cssHeight);

    material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(cssWidth, cssHeight) },
            uAccentColor: { value: accentColor.clone() },
            uBgColor: { value: bgColor.clone() },
            uWaveSpeed: { value: props.waveSpeed },
            uWaveWidth: { value: props.waveWidth },
            uGapFactor: { value: CONFIG.gapFactor },
            uRiseSigma: { value: CONFIG.riseSigma },
            uFallSigma: { value: CONFIG.fallSigma },
            uRippleAmplitude: { value: CONFIG.rippleAmplitude },
            uRippleFreq: { value: CONFIG.rippleFreq },
            uMicroAmplitude: { value: CONFIG.microAmplitude },
            uMicroFreq: { value: CONFIG.microFreq },
            uRowPhaseAmp: { value: CONFIG.rowPhaseAmp },
            uRowPhaseFreq: { value: CONFIG.rowPhaseFreq },
            uTimeFactor: { value: CONFIG.timeFactor },
            uAmbient: { value: props.ambientBrightness },
            uPeak: { value: props.peakBrightness },
            uMousePos: { value: new THREE.Vector2(-999, -999) },
            uMouseActive: { value: 0 },
            uMouseRadius: { value: props.mouseRadius },
            uMouseStrength: { value: props.mouseStrength },
            uMouseRippleSpeed: { value: CONFIG.mouseRippleSpeed },
            uSingleWave: { value: 0 },
            uEasing: { value: 0 },
            uDuration: { value: 1 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false,
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);

    currentCamera = new THREE.OrthographicCamera(
        0,
        cssWidth,
        0,
        cssHeight,
        -1,
        1,
    );
    currentCamera.position.z = 0;
    currentCamera.updateProjectionMatrix();

    renderer.setSize(cssWidth, cssHeight, false);
}

// ==================== 触发海浪 ====================
/** 单次触发一个海浪从左到右 */
function triggerWave() {
    // 重置时间，让海浪从屏幕左侧开始
    const period = (1 + props.waveWidth) / Math.max(props.waveSpeed, 0.01);
    const dur = props.duration > 0 ? props.duration : period;
    waveTarget = dur;
    waveElapsed = 0;
    if (material) {
        material.uniforms.uTime.value = 0;
        material.uniforms.uSingleWave.value = 1;
        material.uniforms.uDuration.value = dur;
    }
}

defineExpose({ triggerWave });

// ==================== 事件处理 ====================
function getRelativePos(e: PointerEvent): { x: number; y: number } {
    const rect = containerRef.value!.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
}
function onPointerMove(e: PointerEvent) {
    const pos = getRelativePos(e);
    mouseX = pos.x;
    mouseY = pos.y;
    mouseActive = true;
}
function onPointerLeave() {
    mouseActive = false;
}
function onPointerEnter(e: PointerEvent) {
    const pos = getRelativePos(e);
    mouseX = pos.x;
    mouseY = pos.y;
    mouseActive = true;
}
function onPointerDown() {
    mouseClickStrength = 1.0;
}

// ==================== 动画循环 ====================
function animate(now: number) {
    animationId = requestAnimationFrame(animate);

    // 基于 performance.now 的 delta (秒)
    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0;
    lastTime = now;

    // 手动触发的海浪计时
    let waveActive = false;
    if (waveElapsed < waveTarget) {
        waveElapsed += dt;
        waveActive = true;
    } else if (material && material.uniforms.uSingleWave.value > 0.5) {
        material.uniforms.uSingleWave.value = 0;
    }

    // 时间推进：自动播放 或 手动触发中
    const shouldAdvanceTime = props.playing || waveActive;

    if (!mouseActive) {
        mouseIntensity *= Math.pow(CONFIG.mouseDecay, dt);
        if (mouseIntensity < 0.001) mouseIntensity = 0;
    } else {
        mouseIntensity = Math.min(1.0, mouseIntensity + dt * 6.0);
    }

    mouseClickStrength *= Math.pow(CONFIG.mouseDecay, dt);
    if (mouseClickStrength < 0.001) mouseClickStrength = 0;

    const activeStrength = Math.min(
        1.0,
        mouseIntensity + mouseClickStrength * CONFIG.mouseClickBoost,
    );

    const hasActivity =
        shouldAdvanceTime ||
        mouseActive ||
        mouseIntensity > 0.001 ||
        mouseClickStrength > 0.001;

    if (points) {
        points.visible = hasActivity;
    }

    if (material && shouldAdvanceTime) {
        material.uniforms.uTime.value += dt;
    }
    if (material) {
        material.uniforms.uEasing.value = props.easing ? 1 : 0;
        material.uniforms.uDuration.value =
            props.duration > 0
                ? props.duration
                : (1 + props.waveWidth) / Math.max(props.waveSpeed, 0.01);
        material.uniforms.uMousePos.value.set(mouseX, mouseY);
        material.uniforms.uMouseActive.value = activeStrength;
    }

    renderer.render(scene, currentCamera);
}

// ==================== 容器尺寸监听 ====================
function updateSize() {
    const el = containerRef.value!;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w !== cssWidth || h !== cssHeight) {
        cssWidth = w;
        cssHeight = h;
        buildScene();
    }
}

// ==================== 主题监听 ====================
let themeObserver: MutationObserver | null = null;
let darkMq: MediaQueryList | null = null;

function setupThemeWatcher() {
    const root = document.documentElement;
    themeObserver = new MutationObserver((mutations) => {
        if (mutations[0]?.attributeName === "data-theme") updateThemeColors();
    });
    themeObserver.observe(root, {
        attributes: true,
        attributeFilter: ["data-theme"],
    });

    darkMq = window.matchMedia("(prefers-color-scheme: dark)");
    darkMq.addEventListener("change", () => {
        if (!root.hasAttribute("data-theme")) updateThemeColors();
    });
}
function teardownThemeWatcher() {
    themeObserver?.disconnect();
    darkMq?.removeEventListener("change", updateThemeColors);
}

// ==================== 生命周期 ====================
onMounted(() => {
    const canvas = canvasRef.value!;
    const container = containerRef.value!;

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0, 0, 0, 0);

    scene = new THREE.Scene();
    cssWidth = container.clientWidth;
    cssHeight = container.clientHeight;

    updateThemeColors();
    buildScene();
    setupThemeWatcher();

    // 初始渲染清空 canvas，后续由 hasActivity 控制
    renderer.render(scene, currentCamera);

    resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("pointerenter", onPointerEnter);
    container.addEventListener("pointerdown", onPointerDown);

    requestAnimationFrame(animate);
});

onUnmounted(() => {
    cancelAnimationFrame(animationId);
    resizeObserver?.disconnect();
    teardownThemeWatcher();
    containerRef.value?.removeEventListener("pointermove", onPointerMove);
    containerRef.value?.removeEventListener("pointerleave", onPointerLeave);
    containerRef.value?.removeEventListener("pointerenter", onPointerEnter);
    containerRef.value?.removeEventListener("pointerdown", onPointerDown);
    renderer?.dispose();
    geometry?.dispose();
    material?.dispose();
});
</script>

<template>
    <div ref="containerRef" class="wave-dots-container">
        <canvas ref="canvasRef" class="wave-dots-canvas" />
    </div>
</template>

<style scoped>
.wave-dots-container {
    width: 100%;
    height: 100%;
    min-height: 120px;
    position: relative;
    overflow: hidden;
    cursor: crosshair;
    -webkit-tap-highlight-color: transparent;
}

.wave-dots-canvas {
    display: block;
    width: 100%;
    height: 100%;
    background: transparent;
}
</style>
