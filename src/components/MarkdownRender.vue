<script setup lang="ts">
/**
 * MarkdownRender - 流式 Markdown 渲染组件
 *
 * 支持:
 * - 流式增量输入 (streaming)
 * - LaTeX 数学公式渲染 ($...$ 行内, $$...$$ 块级)
 * - Mermaid 图表渲染 (```mermaid ... ```)
 * - 代码高亮 (highlight.js — 180+ 语言)
 * - HTML 安全过滤 (DOMPurify)
 */
import { computed, nextTick, onMounted, ref, watch } from "vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import katex from "katex";
import mermaid from "mermaid";
import DOMPurify from "dompurify";

// 样式导入
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";

// ===================== Props =====================
const props = withDefaults(
    defineProps<{
        /** 流式输入的 Markdown 内容 */
        content: string;
    }>(),
    {
        content: "",
    },
);

// ===================== 初始化 Mermaid（主题自适应） =====================
function getMermaidThemeConfig() {
    const style = getComputedStyle(document.documentElement);
    const get = (v: string) => style.getPropertyValue(v).trim();

    const isDark =
        document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.hasAttribute("data-theme") &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (!isDark) {
        return { theme: "neutral" as const };
    }

    return {
        theme: "base" as const,
        themeVariables: {
            primaryColor: get("--bg-secondary") || "#1a1a1a",
            primaryTextColor: get("--text-primary") || "#e0e0e0",
            primaryBorderColor: get("--border-primary") || "#333333",
            lineColor: get("--text-secondary") || "#888888",
            secondaryColor: get("--bg-tertiary") || "#242424",
            tertiaryColor: get("--bg-primary") || "#111111",
        },
    };
}

mermaid.initialize({
    startOnLoad: false,
    securityLevel: "sandbox",
    ...getMermaidThemeConfig(),
});

// ===================== UUID 生成 =====================
let uidCounter = 0;
function uniqueId(): string {
    return "md-" + Date.now().toString(36) + "-" + (uidCounter++).toString(36);
}

// ===================== LaTeX 渲染缓存 =====================
const latexCache = new Map<string, string>();

function renderLatexToHtml(formula: string, displayMode: boolean): string {
    const cacheKey = (displayMode ? "b" : "i") + ":" + formula;
    const cached = latexCache.get(cacheKey);
    if (cached !== undefined) return cached;

    try {
        const html = katex.renderToString(formula, {
            displayMode,
            throwOnError: false,
            strict: false,
            trust: false,
        });
        latexCache.set(cacheKey, html);
        return html;
    } catch {
        const escaped = md.utils.escapeHtml(formula);
        const result = displayMode
            ? '<div class="katex-block-error">' + escaped + "</div>"
            : '<span class="katex-inline-error">' + escaped + "</span>";
        latexCache.set(cacheKey, result);
        return result;
    }
}

// ===================== 初始化 MarkdownIt =====================
const md = new MarkdownIt({
    html: false,
    breaks: true,
    linkify: true,
    highlight: (str: string, lang: string): string => {
        if (lang && lang.toLowerCase() === "mermaid") {
            return "";
        }
        if (lang && hljs.getLanguage(lang)) {
            try {
                return (
                    '<pre class="hljs"><code>' +
                    hljs.highlight(str, {
                        language: lang,
                        ignoreIllegals: true,
                    }).value +
                    "</code></pre>"
                );
            } catch {
                // fall through to auto-detect
            }
        }
        try {
            return (
                '<pre class="hljs"><code>' +
                hljs.highlightAuto(str).value +
                "</code></pre>"
            );
        } catch {
            return (
                '<pre class="hljs"><code>' +
                md.utils.escapeHtml(str) +
                "</code></pre>"
            );
        }
    },
});

// ─── 自定义 inline 规则: LaTeX 行内公式 ($...$ 与 $$...$$) ───
md.inline.ruler.after("backticks", "latex_inline", (state, silent) => {
    const pos = state.pos;
    const max = state.posMax;

    if (state.src.charCodeAt(pos) !== 0x24 /* $ */) return false;

    // 判断是单 $ 还是双 $$ 开头
    let displayMode = false;
    let contentStart: number;
    let contentEnd: number; // 指向闭 $ 的第一个字符位置

    if (pos + 1 < max && state.src.charCodeAt(pos + 1) === 0x24 /* $ */) {
        // $$...$$ 块级公式（行内书写时按 display 模式渲染）
        displayMode = true;
        contentStart = pos + 2;
        contentEnd = contentStart;
        while (contentEnd < max - 1) {
            if (
                state.src.charCodeAt(contentEnd) === 0x24 &&
                state.src.charCodeAt(contentEnd + 1) === 0x24
            ) {
                break;
            }
            if (state.src.charCodeAt(contentEnd) === 0x0a) return false;
            contentEnd++;
        }
        if (contentEnd >= max - 1) return false; // 未闭合 $$
    } else {
        // $...$ 行内公式
        contentStart = pos + 1;
        contentEnd = contentStart;
        while (contentEnd < max) {
            if (state.src.charCodeAt(contentEnd) === 0x24) {
                if (
                    contentEnd + 1 < max &&
                    state.src.charCodeAt(contentEnd + 1) === 0x24
                ) {
                    contentEnd += 2; // 跳过 $$
                    continue;
                }
                break;
            }
            if (state.src.charCodeAt(contentEnd) === 0x0a) return false;
            contentEnd++;
        }
        if (contentEnd >= max) return false;
    }

    if (silent) return true;

    const token = state.push("latex_inline", "", 0);
    token.content = state.src.slice(contentStart, contentEnd).trim();
    token.meta = { displayMode };

    state.pos = contentEnd + (displayMode ? 2 : 1);
    return true;
});

// ─── 自定义 block 规则: LaTeX 块级公式 ($$ standalone lines) ───
md.block.ruler.before(
    "fence",
    "latex_block",
    (state, startLine, endLine, silent) => {
        const startPos = state.bMarks[startLine] + state.tShift[startLine];
        const lineMax = state.eMarks[startLine];

        // 必须以 $$ 开头
        if (startPos + 2 > lineMax) return false;
        if (
            state.src.charCodeAt(startPos) !== 0x24 ||
            state.src.charCodeAt(startPos + 1) !== 0x24
        )
            return false;

        // $$ 后面只能有空白
        for (let i = startPos + 2; i < lineMax; i++) {
            if (state.src.charCodeAt(i) !== 0x20) return false;
        }

        // 寻找闭合 $$
        let nextLine = startLine + 1;
        const lines: string[] = [];

        while (nextLine < endLine) {
            const lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
            const lineEnd = state.eMarks[nextLine];

            if (
                lineStart + 2 <= lineEnd &&
                state.src.charCodeAt(lineStart) === 0x24 &&
                state.src.charCodeAt(lineStart + 1) === 0x24
            ) {
                let onlyWhitespace = true;
                for (let i = lineStart + 2; i < lineEnd; i++) {
                    if (state.src.charCodeAt(i) !== 0x20) {
                        onlyWhitespace = false;
                        break;
                    }
                }
                if (onlyWhitespace) break;
            }

            lines.push(state.src.slice(lineStart, lineEnd));
            nextLine++;
        }

        if (nextLine >= endLine) return false; // 未闭合

        if (silent) return true;

        const token = state.push("latex_block", "", 0);
        token.content = lines.join("\n").trim();
        token.map = [startLine, nextLine + 1];
        state.line = nextLine + 1;
        return true;
    },
);

// ─── 注册 LaTeX 渲染器 ───
md.renderer.rules.latex_inline = (tokens, idx) => {
    const t = tokens[idx];
    return renderLatexToHtml(t.content, t.meta?.displayMode ?? false);
};

md.renderer.rules.latex_block = (tokens, idx) => {
    return (
        '<div class="katex-block-container">' +
        renderLatexToHtml(tokens[idx].content, true) +
        "</div>"
    );
};

// ─── Mermaid 自定义 fence 渲染器 ───
const mermaidBlocks = ref<Map<string, { code: string; rendered: boolean }>>(
    new Map(),
);

const defaultFence = md.renderer.rules.fence!;
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const lang = token.info.trim().toLowerCase();

    if (lang === "mermaid") {
        const code = token.content.trim();
        if (code.length === 0) return "";

        const id = "mermaid-" + uniqueId();
        mermaidBlocks.value.set(id, { code, rendered: false });

        return (
            '<div class="mermaid-container" data-mermaid-id="' +
            id +
            '"><pre class="mermaid-raw"><code>' +
            md.utils.escapeHtml(code) +
            "</code></pre></div>"
        );
    }

    return defaultFence(tokens, idx, options, env, self);
};

// ===================== 响应式渲染 =====================
const renderedHtml = ref("");
let lastContent = "";

watch(
    () => props.content,
    (newContent) => {
        if (!newContent.startsWith(lastContent)) {
            latexCache.clear();
            mermaidBlocks.value.clear();
        }
        lastContent = newContent;

        renderedHtml.value = md.render(newContent);

        nextTick(() => {
            renderMermaidBlocks();
        });
    },
    { immediate: true },
);

// ===================== Mermaid 异步渲染 =====================
let mermaidRenderQueue: Promise<void> | null = null;

async function renderMermaidBlocks(): Promise<void> {
    if (mermaidRenderQueue) {
        await mermaidRenderQueue;
    }

    mermaidRenderQueue = (async () => {
        const container = document.querySelector(".markdown-render");
        if (!container) return;

        const mermaidContainers = container.querySelectorAll<HTMLElement>(
            ".mermaid-container:not(.mermaid-rendered)",
        );

        for (const el of mermaidContainers) {
            const id = el.dataset.mermaidId;
            if (!id) continue;

            const block = mermaidBlocks.value.get(id);
            if (!block || block.rendered) continue;

            try {
                const { svg } = await mermaid.render(
                    "mermaid-svg-" + id,
                    block.code,
                );
                el.innerHTML = svg;
                el.classList.add("mermaid-rendered");
                block.rendered = true;
            } catch {
                el.classList.add("mermaid-pending");
            }
        }
    })();

    await mermaidRenderQueue;
    mermaidRenderQueue = null;
}

// ===================== DOMPurify 安全过滤 =====================
const sanitizedHtml = computed(() => {
    return DOMPurify.sanitize(renderedHtml.value, {
        ADD_TAGS: [
            "svg",
            "path",
            "circle",
            "line",
            "rect",
            "polygon",
            "polyline",
            "text",
            "g",
            "defs",
            "marker",
            "arrowhead",
        ],
        ADD_ATTR: [
            "d",
            "viewBox",
            "stroke",
            "stroke-width",
            "fill",
            "marker-end",
            "transform",
            "xmlns",
        ],
    });
});

// ===================== 主题切换时重新渲染 Mermaid =====================
function refreshMermaidTheme() {
    mermaid.initialize({
        startOnLoad: false,
        securityLevel: "sandbox",
        ...getMermaidThemeConfig(),
    });

    // 重置所有已渲染的块
    for (const block of mermaidBlocks.value.values()) {
        block.rendered = false;
    }

    // 移除已渲染标记
    const container = document.querySelector(".markdown-render");
    if (container) {
        container
            .querySelectorAll(".mermaid-container.mermaid-rendered")
            .forEach((el) => el.classList.remove("mermaid-rendered"));
    }

    renderMermaidBlocks();
}

// 监听系统主题变化
const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
darkModeQuery.addEventListener("change", () => {
    if (!document.documentElement.hasAttribute("data-theme")) {
        refreshMermaidTheme();
    }
});

// 监听手动 data-theme 切换
const themeObserver = new MutationObserver(() => {
    refreshMermaidTheme();
});
themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
});

// ===================== 生命周期 =====================
onMounted(() => {
    if (props.content) {
        renderedHtml.value = md.render(props.content);
        nextTick(() => {
            renderMermaidBlocks();
        });
    }
});
</script>

<template>
    <div class="markdown-render" v-html="sanitizedHtml"></div>
</template>

<style>
/* ===================== 基础排版样式 ===================== */
.markdown-render {
    line-height: 1.75;
    word-break: break-word;
    overflow-wrap: break-word;
}

.markdown-render h1,
.markdown-render h2,
.markdown-render h3,
.markdown-render h4,
.markdown-render h5,
.markdown-render h6 {
    margin: 1.2em 0 0.6em;
    font-weight: 600;
    line-height: 1.4;
}

.markdown-render h1 {
    font-size: 1.5em;
    border-bottom: 1px solid var(--border-secondary);
    padding-bottom: 0.3em;
}

.markdown-render h2 {
    font-size: 1.3em;
    border-bottom: 1px solid var(--border-secondary);
    padding-bottom: 0.25em;
}

.markdown-render h3 {
    font-size: 1.15em;
}

.markdown-render p {
    margin: 0.5em 0;
}

.markdown-render a {
    color: var(--accent);
    text-decoration: none;
}

.markdown-render a:hover {
    text-decoration: underline;
}

.markdown-render strong {
    font-weight: 600;
}

.markdown-render em {
    font-style: italic;
}

.markdown-render del {
    text-decoration: line-through;
}

/* ===================== 列表样式 ===================== */
.markdown-render ul,
.markdown-render ol {
    padding-left: 1.5em;
    margin: 0.5em 0;
}

.markdown-render li {
    margin: 0.25em 0;
}

.markdown-render li > ul,
.markdown-render li > ol {
    margin: 0;
}

/* ===================== 引用块 ===================== */
.markdown-render blockquote {
    margin: 0.5em 0;
    padding: 0.3em 1em;
    border-left: 3px solid var(--border-primary);
    color: var(--text-secondary);
    background: var(--bg-secondary);
}

/* ===================== 代码块 ===================== */
.markdown-render code {
    font-family:
        "Fira Code", "Cascadia Code", "JetBrains Mono", "SF Mono", "Menlo",
        monospace;
    font-size: 0.88em;
}

/* 行内代码 */
.markdown-render :not(pre) > code {
    padding: 0.15em 0.4em;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-secondary);
}

/* 代码块容器 */
.markdown-render pre.hljs {
    margin: 0.75em 0;
    padding: 1em;
    overflow-x: auto;
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
}

.markdown-render pre.hljs code {
    background: transparent;
    padding: 0;
    font-size: 0.85em;
    line-height: 1.6;
}

/* ===================== 表格样式 ===================== */
.markdown-render table {
    width: 100%;
    margin: 0.75em 0;
    border-collapse: collapse;
    font-size: 0.9em;
}

.markdown-render th,
.markdown-render td {
    padding: 0.5em 0.75em;
    border: 1px solid var(--border-primary);
    text-align: left;
}

.markdown-render th {
    background: var(--bg-tertiary);
    font-weight: 600;
}

.markdown-render tr:nth-child(even) td {
    background: var(--bg-secondary);
}

/* ===================== 分割线 ===================== */
.markdown-render hr {
    margin: 1.5em 0;
    border: none;
    border-top: 1px solid var(--border-secondary);
}

/* ===================== 图片 ===================== */
.markdown-render img {
    max-width: 100%;
    height: auto;
    margin: 0.5em 0;
}

/* ===================== LaTeX 公式样式 ===================== */
.markdown-render .katex {
    font-size: 1.05em;
}

.markdown-render .katex-block-container {
    margin: 1em 0;
}

.markdown-render .katex-display {
    margin: 1em 0;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0.3em 0;
}

.markdown-render .katex-inline-error,
.markdown-render .katex-block-error {
    color: #dc2626;
    font-family: monospace;
    font-size: 0.9em;
}

.markdown-render .katex-block-error {
    display: block;
    padding: 0.5em;
    background: #fef2f2;
    border: 1px solid var(--border-primary);
}

/* ===================== Mermaid 图表样式 ===================== */
.markdown-render .mermaid-container {
    margin: 1em 0;
    padding: 1em;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    overflow-x: auto;
    text-align: center;
}

.markdown-render .mermaid-container svg {
    max-width: 100%;
    height: auto;
}

.markdown-render .mermaid-raw code {
    color: #9ca3af;
    background: transparent;
}

.markdown-render .mermaid-pending::after {
    content: "⋯";
    display: block;
    text-align: center;
    color: #9ca3af;
    font-size: 1.2em;
    animation: mermaid-pulse 1.5s ease-in-out infinite;
}

@keyframes mermaid-pulse {
    0%,
    100% {
        opacity: 0.3;
    }
    50% {
        opacity: 1;
    }
}

/* ===================== 任务列表 (checkbox) ===================== */
.markdown-render input[type="checkbox"] {
    margin-right: 0.4em;
    vertical-align: middle;
}

.markdown-render ul:has(input[type="checkbox"]) {
    list-style: none;
    padding-left: 0.5em;
}
</style>
