<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
    defineProps<{
        /** 二维数据数组，data[row][col] */
        data: number[][];
        /** 行标签 */
        rowLabels?: string[];
        /** 列标签 */
        colLabels?: string[];
        /** 单元格大小 (px) */
        cellSize?: number;
        /** 单元格间距 (px) */
        gap?: number;
        /** 覆盖用于颜色映射的最小值，默认取 data 中的最小值 */
        minValue?: number;
        /** 覆盖用于颜色映射的最大值，默认取 data 中的最大值 */
        maxValue?: number;
        /** 是否显示值文本 */
        showValue?: boolean;
    }>(),
    {
        cellSize: 16,
        gap: 3,
        showValue: false,
    },
);

/** data 的实际最小 / 最大值 */
const computedMin = computed(() => {
    let min = Infinity;
    for (const row of props.data) {
        for (const v of row) {
            if (v < min) min = v;
        }
    }
    return min === Infinity ? 0 : min;
});

const computedMax = computed(() => {
    let max = -Infinity;
    for (const row of props.data) {
        for (const v of row) {
            if (v > max) max = v;
        }
    }
    return max === -Infinity ? 0 : max;
});

const effectiveMin = computed(() => props.minValue ?? computedMin.value);
const effectiveMax = computed(() => props.maxValue ?? computedMax.value);

/** 行数 / 列数 */
const rowCount = computed(() => props.data.length);
const colCount = computed(() => props.data[0]?.length ?? 0);

/** 热力颜色：浅色 → 深色（跟随主题） */
const HEAT_LIGHT = "var(--bg-secondary)";
const HEAT_DARK = "var(--text-primary)";

/** 解析 CSS 变量名 */
function extractCSSVar(color: string): string | null {
    const m = color.match(/var\((--[\w-]+)\)/);
    return m ? m[1] : null;
}

/** 将颜色字符串解析为 RGB 分量，支持 hex / rgb() / CSS 变量 */
function parseColor(color: string): [number, number, number] {
    // CSS 变量 → 运行时解析
    const varName = extractCSSVar(color);
    if (varName) {
        const resolved = getComputedStyle(document.documentElement)
            .getPropertyValue(varName)
            .trim();
        if (resolved) return parseColor(resolved);
        return [0, 0, 0];
    }

    // rgb(r, g, b) 格式
    const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
        return [
            parseInt(rgbMatch[1]),
            parseInt(rgbMatch[2]),
            parseInt(rgbMatch[3]),
        ];
    }

    // hex 格式
    const h = color.replace("#", "");
    if (h.length === 3) {
        return [
            parseInt(h[0] + h[0], 16),
            parseInt(h[1] + h[1], 16),
            parseInt(h[2] + h[2], 16),
        ];
    }
    return [
        parseInt(h.substring(0, 2), 16),
        parseInt(h.substring(2, 4), 16),
        parseInt(h.substring(4, 6), 16),
    ];
}

/** 根据值在浅色 → 深色之间插值 */
function interpolateColor(value: number): string {
    const min = effectiveMin.value;
    const max = effectiveMax.value;
    const minRGB = parseColor(HEAT_LIGHT);
    const maxRGB = parseColor(HEAT_DARK);
    if (max === min) return `rgb(${maxRGB.join(",")})`;

    const ratio = (value - min) / (max - min);
    const r = Math.round(minRGB[0] + (maxRGB[0] - minRGB[0]) * ratio);
    const g = Math.round(minRGB[1] + (maxRGB[1] - minRGB[1]) * ratio);
    const b = Math.round(minRGB[2] + (maxRGB[2] - minRGB[2]) * ratio);

    return `rgb(${r},${g},${b})`;
}

/** 单元格样式 */
function cellStyle(value: number) {
    return {
        width: props.cellSize + "px",
        height: props.cellSize + "px",
        backgroundColor: interpolateColor(value),
    };
}

/** 网格容器样式 */
const gridStyle = computed(() => ({
    display: "grid",
    gridTemplateColumns: `${props.colLabels ? "auto " : ""}repeat(${colCount.value}, ${props.cellSize}px)`,
    gridTemplateRows: `${props.rowLabels ? "auto " : ""}repeat(${rowCount.value}, ${props.cellSize}px)`,
    gap: props.gap + "px",
    alignItems: "center",
}));

/** 空标签占位样式（当同时有行标签和列标签时，左上角需要空占位） */
const hasBothLabels = computed(() => props.rowLabels && props.colLabels);
</script>

<template>
    <div class="heatmap-container">
        <div class="heatmap-grid" :style="gridStyle">
            <!-- 列标签行 -->
            <template v-if="colLabels">
                <!-- 左上角空占位 -->
                <div v-if="hasBothLabels" class="label label--corner" />
                <div
                    v-for="(label, ci) in colLabels"
                    :key="'col-' + ci"
                    class="label label--col"
                >
                    {{ label }}
                </div>
            </template>

            <!-- 数据行 -->
            <template v-for="(row, ri) in data" :key="'row-' + ri">
                <!-- 行标签 -->
                <div
                    v-if="rowLabels?.[ri] !== undefined"
                    class="label label--row"
                >
                    {{ rowLabels[ri] }}
                </div>
                <!-- 单元格 -->
                <div
                    v-for="(value, ci) in row"
                    :key="'cell-' + ri + '-' + ci"
                    class="cell"
                    :style="cellStyle(value)"
                    :title="String(value)"
                >
                    <span v-if="showValue" class="cell-value">{{ value }}</span>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.heatmap-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.heatmap-grid {
    display: inline-grid;
}

.label {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    user-select: none;
}

.label--row {
    text-align: right;
    padding-right: 6px;
}

.label--col {
    text-align: center;
    padding-bottom: 2px;
}

.cell {
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cell-value {
    font-size: 9px;
    color: #fff;
    pointer-events: none;
    user-select: none;
}
</style>
