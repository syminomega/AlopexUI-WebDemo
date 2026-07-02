export function createBrowserVelloImports() {
    const renderers = new Map();
    let nextRendererId = 1;

    return {
        createRenderer: async (canvasId, width, height, wasmJsModuleUrl, wasmModuleUrl, antialiasing = 1) => {
            const canvas = resolveCanvas(canvasId);
            canvas.width = normalizeSize(width, "width");
            canvas.height = normalizeSize(height, "height");

            const module = await loadVelloModule(wasmJsModuleUrl, wasmModuleUrl);

            if (typeof module.create_renderer !== "function") {
                throw new Error("The Vello wasm bridge does not export create_renderer(canvas, width, height).");
            }

            const bridge = await module.create_renderer(canvas, canvas.width, canvas.height, Number(antialiasing) || 1);
            const id = nextRendererId++;
            renderers.set(id, {
                canvas,
                bridge,
                api: cacheApi(bridge),
                rendering: false,
            });
            return id;
        },

        resize: async (rendererId, width, height) => {
            const renderer = getRenderer(renderers, rendererId);
            renderer.canvas.width = normalizeSize(width, "width");
            renderer.canvas.height = normalizeSize(height, "height");
            await renderer.api.resize(renderer.canvas.width, renderer.canvas.height);
        },

        // IDs are passed as high/low u32 values instead of BigInt so the same bridge works
        // on browser runtimes that cannot marshal 64-bit integers through JS interop.
        registerImage: (rendererId, imageIdHigh, imageIdLow, imageBytes) => {
            const renderer = getRenderer(renderers, rendererId);
            renderer.api.registerImage(imageIdHigh >>> 0, imageIdLow >>> 0, new Uint8Array(imageBytes.slice()));
        },

        registerSvg: (rendererId, svgIdHigh, svgIdLow, svgBytes) => {
            const renderer = getRenderer(renderers, rendererId);
            renderer.api.registerSvg(svgIdHigh >>> 0, svgIdLow >>> 0, new Uint8Array(svgBytes.slice()));
        },

        registerFont: (rendererId, familyName, fontBytes, weight) => {
            const renderer = getRenderer(renderers, rendererId);
            const data = new Uint8Array(fontBytes.slice());
            if (renderer.api.registerFont.length >= 3) {
                renderer.api.registerFont(String(familyName ?? ""), data, Number(weight || 400));
            } else {
                renderer.api.registerFont(String(familyName ?? ""), data);
            }
        },

        measureText: (rendererId, text, familyName, weight, size) => {
            const renderer = getRenderer(renderers, rendererId);
            if (typeof renderer.api.measureText !== "function") {
                return fallbackMeasureText(renderer.canvas, text, familyName, weight, size);
            }
            if (renderer.api.measureText.length >= 4) {
                return renderer.api.measureText(String(familyName ?? ""), String(text ?? ""), Number(weight || 400), size);
            }
            return renderer.api.measureText(String(familyName ?? ""), String(text ?? ""), size);
        },

        directBeginFrame: rendererId => getRenderer(renderers, rendererId).api.beginFrame(),
        // Retained IDs stay split across the JS boundary and are recomposed in Rust.
        directBeginElement: (rendererId, elementIdHigh, elementIdLow) =>
            getRenderer(renderers, rendererId).api.beginElement(elementIdHigh >>> 0, elementIdLow >>> 0),
        directEndElement: rendererId => getRenderer(renderers, rendererId).api.endElement(),
        directDrawElement: (rendererId, elementIdHigh, elementIdLow, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawElement(elementIdHigh >>> 0, elementIdLow >>> 0, m11, m12, m21, m22, m31, m32),
        directDropElement: (rendererId, elementIdHigh, elementIdLow) =>
            getRenderer(renderers, rendererId).api.dropElement(elementIdHigh >>> 0, elementIdLow >>> 0),
        directBeginFrameGraph: (rendererId, frameIdHigh, frameIdLow) =>
            getRenderer(renderers, rendererId).api.beginFrameGraph(frameIdHigh >>> 0, frameIdLow >>> 0),
        directEndFrameGraph: rendererId => getRenderer(renderers, rendererId).api.endFrameGraph(),
        directDrawFrameGraph: (rendererId, frameIdHigh, frameIdLow, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawFrameGraph(frameIdHigh >>> 0, frameIdLow >>> 0, m11, m12, m21, m22, m31, m32),
        directDropFrameGraph: (rendererId, frameIdHigh, frameIdLow) =>
            getRenderer(renderers, rendererId).api.dropFrameGraph(frameIdHigh >>> 0, frameIdLow >>> 0),
        directHasActiveTransitions: rendererId => {
            const api = getRenderer(renderers, rendererId).api;
            return typeof api.hasActiveTransitions === "function" && api.hasActiveTransitions();
        },
        directBeginTransitionScope: (rendererId, transitionIdHigh, transitionIdLow, durationMs, fromWidth, fromHeight, toWidth, toHeight) => {
            const api = getRenderer(renderers, rendererId).api;
            if (typeof api.beginTransitionScope === "function") {
                api.beginTransitionScope(transitionIdHigh >>> 0, transitionIdLow >>> 0, durationMs, fromWidth, fromHeight, toWidth, toHeight);
            }
        },
        directEndTransitionScope: rendererId => {
            const api = getRenderer(renderers, rendererId).api;
            if (typeof api.endTransitionScope === "function") {
                api.endTransitionScope();
            }
        },

        directRender: (rendererId, backgroundR, backgroundG, backgroundB, backgroundA) => {
            const renderer = getRenderer(renderers, rendererId);
            if (renderer.rendering) {
                return;
            }

            renderer.rendering = true;
            try {
                renderer.api.render(colorByte(backgroundR), colorByte(backgroundG), colorByte(backgroundB), colorByte(backgroundA));
            } finally {
                renderer.rendering = false;
            }
        },

        directCreatePath: rendererId => getRenderer(renderers, rendererId).api.createPath(),
        directDropPath: (rendererId, pathId) => getRenderer(renderers, rendererId).api.dropPath(pathId),
        directPathMoveTo: (rendererId, pathId, x, y) => getRenderer(renderers, rendererId).api.pathMoveTo(pathId, x, y),
        directPathLineTo: (rendererId, pathId, x, y) => getRenderer(renderers, rendererId).api.pathLineTo(pathId, x, y),
        directPathQuadTo: (rendererId, pathId, cx, cy, x, y) => getRenderer(renderers, rendererId).api.pathQuadTo(pathId, cx, cy, x, y),
        directPathCubicTo: (rendererId, pathId, x, y, cx, cy, tx, ty) => getRenderer(renderers, rendererId).api.pathCubicTo(pathId, x, y, cx, cy, tx, ty),
        directPathArcTo: (rendererId, pathId, x1, y1, x2, y2, radius) => getRenderer(renderers, rendererId).api.pathArcTo(pathId, x1, y1, x2, y2, radius),
        directPathClose: (rendererId, pathId) => getRenderer(renderers, rendererId).api.pathClose(pathId),

        directPushClipRect: (rendererId, x, y, width, height, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.pushClipRect(x, y, width, height, m11, m12, m21, m22, m31, m32),
        directPushRetainedClipRect: (rendererId, x, y, width, height, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.pushRetainedClipRect(x, y, width, height, m11, m12, m21, m22, m31, m32),
        directPushClipPath: (rendererId, pathId, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.pushClipPath(pathId, m11, m12, m21, m22, m31, m32),
        directPushRetainedClipPath: (rendererId, pathId, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.pushRetainedClipPath(pathId, m11, m12, m21, m22, m31, m32),
        directPopLayer: rendererId => getRenderer(renderers, rendererId).api.popLayer(),
        directPopRetainedClip: rendererId => getRenderer(renderers, rendererId).api.popRetainedClip(),

        directDrawRect: (rendererId, x, y, width, height, style, strokeWidth, strokeCap, strokeJoin, r, g, b, a, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawRect(x, y, width, height, style, strokeWidth, strokeCap, strokeJoin, colorByte(r), colorByte(g), colorByte(b), colorByte(a), m11, m12, m21, m22, m31, m32),
        directDrawRoundRect: (rendererId, x, y, width, height, tl, tr, br, bl, style, strokeWidth, strokeCap, strokeJoin, r, g, b, a, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawRoundRect(x, y, width, height, tl, tr, br, bl, style, strokeWidth, strokeCap, strokeJoin, colorByte(r), colorByte(g), colorByte(b), colorByte(a), m11, m12, m21, m22, m31, m32),
        directDrawCircle: (rendererId, cx, cy, radius, style, strokeWidth, strokeCap, strokeJoin, r, g, b, a, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawCircle(cx, cy, radius, style, strokeWidth, strokeCap, strokeJoin, colorByte(r), colorByte(g), colorByte(b), colorByte(a), m11, m12, m21, m22, m31, m32),
        directDrawOval: (rendererId, x, y, width, height, style, strokeWidth, strokeCap, strokeJoin, r, g, b, a, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawOval(x, y, width, height, style, strokeWidth, strokeCap, strokeJoin, colorByte(r), colorByte(g), colorByte(b), colorByte(a), m11, m12, m21, m22, m31, m32),
        directDrawLine: (rendererId, x1, y1, x2, y2, strokeWidth, strokeCap, strokeJoin, r, g, b, a, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawLine(x1, y1, x2, y2, strokeWidth, strokeCap, strokeJoin, colorByte(r), colorByte(g), colorByte(b), colorByte(a), m11, m12, m21, m22, m31, m32),
        directDrawBlurredRoundedRect: (rendererId, x, y, width, height, cornerRadius, blurRadius, r, g, b, a, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawBlurredRoundedRect(x, y, width, height, cornerRadius, blurRadius, colorByte(r), colorByte(g), colorByte(b), colorByte(a), m11, m12, m21, m22, m31, m32),
        directDrawPath: (rendererId, pathId, style, strokeWidth, strokeCap, strokeJoin, r, g, b, a, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawPath(pathId, style, strokeWidth, strokeCap, strokeJoin, colorByte(r), colorByte(g), colorByte(b), colorByte(a), m11, m12, m21, m22, m31, m32),
        directDrawText: (rendererId, text, x, y, align, familyName, weight, size, r, g, b, a, m11, m12, m21, m22, m31, m32) => {
            const api = getRenderer(renderers, rendererId).api;
            if (api.drawText.length >= 16) {
                api.drawText(String(text ?? ""), x, y, align, String(familyName ?? ""), Number(weight || 400), size, colorByte(r), colorByte(g), colorByte(b), colorByte(a), m11, m12, m21, m22, m31, m32);
            } else {
                api.drawText(String(text ?? ""), x, y, align, String(familyName ?? ""), size, colorByte(r), colorByte(g), colorByte(b), colorByte(a), m11, m12, m21, m22, m31, m32);
            }
        },
        directDrawSvg: (rendererId, svgIdHigh, svgIdLow, x, y, width, height, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawSvg(svgIdHigh >>> 0, svgIdLow >>> 0, x, y, width, height, m11, m12, m21, m22, m31, m32),

        // The brush hot path is intentionally positional to avoid JSON/object churn while
        // rendering. Keep this signature aligned with VelloWebAssemblyRenderer.cs and the
        // wasm-bindgen generated vello_web.js exports.
        directDrawShapeWithBrush: (rendererId, shape, x0, y0, x1, y1, r0, r1, r2, r3, style, strokeWidth, strokeCap, strokeJoin, brushKind, r, g, b, a, p0x, p0y, p1x, p1y, radius, startAngle, endAngle, spread, stopOffsets, stopColors, imageIdHigh, imageIdLow, tileMode, stretch, alignX, alignY, hasBounds, boundsX, boundsY, boundsWidth, boundsHeight, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawShapeWithBrush(shape, x0, y0, x1, y1, r0, r1, r2, r3, style, strokeWidth, strokeCap, strokeJoin, brushKind, colorByte(r), colorByte(g), colorByte(b), colorByte(a), p0x, p0y, p1x, p1y, radius, startAngle, endAngle, spread, new Uint8Array(stopOffsets.slice()), new Uint8Array(stopColors.slice()), imageIdHigh >>> 0, imageIdLow >>> 0, tileMode, stretch, alignX, alignY, Boolean(hasBounds), boundsX, boundsY, boundsWidth, boundsHeight, m11, m12, m21, m22, m31, m32),
        directDrawTextWithBrush: (rendererId, text, x, y, align, familyName, weight, size, brushKind, r, g, b, a, p0x, p0y, p1x, p1y, radius, startAngle, endAngle, spread, stopOffsets, stopColors, imageIdHigh, imageIdLow, tileMode, stretch, alignX, alignY, hasBounds, boundsX, boundsY, boundsWidth, boundsHeight, m11, m12, m21, m22, m31, m32) => {
            const args = [String(text ?? ""), x, y, align, String(familyName ?? ""), Number(weight || 400), size, brushKind, colorByte(r), colorByte(g), colorByte(b), colorByte(a), p0x, p0y, p1x, p1y, radius, startAngle, endAngle, spread, new Uint8Array(stopOffsets.slice()), new Uint8Array(stopColors.slice()), imageIdHigh >>> 0, imageIdLow >>> 0, tileMode, stretch, alignX, alignY, Boolean(hasBounds), boundsX, boundsY, boundsWidth, boundsHeight, m11, m12, m21, m22, m31, m32];
            const api = getRenderer(renderers, rendererId).api;
            if (api.drawTextWithBrush.length >= 38) {
                api.drawTextWithBrush(...args);
            } else {
                api.drawTextWithBrush(args[0], args[1], args[2], args[3], args[4], args[6], ...args.slice(7));
            }
        },

        dispose: async (rendererId) => {
            const renderer = renderers.get(rendererId);
            if (!renderer) return;

            renderer.api.dispose();
            renderers.delete(rendererId);
        },
    };
}

export const alopexVello = createBrowserVelloImports();

const modulePromises = new Map();
const initPromises = new Map();

async function loadVelloModule(wasmJsModuleUrl, wasmModuleUrl) {
    const moduleUrl = String(wasmJsModuleUrl ?? "");
    let modulePromise = modulePromises.get(moduleUrl);
    if (!modulePromise) {
        modulePromise = import(moduleUrl);
        modulePromises.set(moduleUrl, modulePromise);
    }

    const module = await modulePromise;
    if (typeof module.default === "function") {
        const initKey = `${moduleUrl}\n${wasmModuleUrl ?? ""}`;
        let initPromise = initPromises.get(initKey);
        if (!initPromise) {
            initPromise = wasmModuleUrl ? module.default(wasmModuleUrl) : module.default();
            initPromises.set(initKey, initPromise);
        }

        await initPromise;
    }

    return module;
}

function cacheApi(bridge) {
    return {
        resize: requireExport(bridge, "resize"),
        registerImage: requireExport(bridge, "register_image"),
        registerSvg: requireExport(bridge, "register_svg"),
        registerFont: requireExport(bridge, "register_font"),
        measureText: optionalExport(bridge, "measure_text"),
        beginFrame: requireExport(bridge, "direct_begin_frame"),
        beginElement: requireExport(bridge, "direct_begin_element"),
        endElement: requireExport(bridge, "direct_end_element"),
        drawElement: requireExport(bridge, "direct_draw_element"),
        dropElement: requireExport(bridge, "direct_drop_element"),
        beginFrameGraph: requireExport(bridge, "direct_begin_frame_graph"),
        endFrameGraph: requireExport(bridge, "direct_end_frame_graph"),
        drawFrameGraph: requireExport(bridge, "direct_draw_frame_graph"),
        dropFrameGraph: requireExport(bridge, "direct_drop_frame_graph"),
        hasActiveTransitions: typeof bridge.direct_has_active_transitions === "function" ? bridge.direct_has_active_transitions.bind(bridge) : undefined,
        beginTransitionScope: typeof bridge.direct_begin_transition_scope === "function" ? bridge.direct_begin_transition_scope.bind(bridge) : undefined,
        endTransitionScope: typeof bridge.direct_end_transition_scope === "function" ? bridge.direct_end_transition_scope.bind(bridge) : undefined,
        render: requireExport(bridge, "direct_render"),
        createPath: requireExport(bridge, "direct_create_path"),
        dropPath: requireExport(bridge, "direct_drop_path"),
        pathMoveTo: requireExport(bridge, "direct_path_move_to"),
        pathLineTo: requireExport(bridge, "direct_path_line_to"),
        pathQuadTo: requireExport(bridge, "direct_path_quad_to"),
        pathCubicTo: requireExport(bridge, "direct_path_cubic_to"),
        pathArcTo: requireExport(bridge, "direct_path_arc_to"),
        pathClose: requireExport(bridge, "direct_path_close"),
        pushClipRect: requireExport(bridge, "direct_push_clip_rect"),
        pushRetainedClipRect: requireExport(bridge, "direct_push_retained_clip_rect"),
        pushClipPath: requireExport(bridge, "direct_push_clip_path"),
        pushRetainedClipPath: requireExport(bridge, "direct_push_retained_clip_path"),
        popLayer: requireExport(bridge, "direct_pop_layer"),
        popRetainedClip: requireExport(bridge, "direct_pop_retained_clip"),
        drawRect: requireExport(bridge, "direct_draw_rect"),
        drawRoundRect: requireExport(bridge, "direct_draw_round_rect"),
        drawCircle: requireExport(bridge, "direct_draw_circle"),
        drawOval: requireExport(bridge, "direct_draw_oval"),
        drawLine: requireExport(bridge, "direct_draw_line"),
        drawBlurredRoundedRect: requireExport(bridge, "direct_draw_blurred_rounded_rect"),
        drawPath: requireExport(bridge, "direct_draw_path"),
        drawText: requireExport(bridge, "direct_draw_text"),
        drawSvg: requireExport(bridge, "direct_draw_svg"),
        drawShapeWithBrush: requireExport(bridge, "direct_draw_shape_with_brush"),
        drawTextWithBrush: requireExport(bridge, "direct_draw_text_with_brush"),
        dispose: typeof bridge.dispose === "function" ? bridge.dispose.bind(bridge) : () => {},
    };
}

function requireExport(bridge, name) {
    const fn = bridge?.[name];
    if (typeof fn !== "function") {
        throw new Error(`The Vello wasm bridge does not export ${name}.`);
    }

    return fn.bind(bridge);
}

function optionalExport(bridge, name) {
    const fn = bridge?.[name];
    return typeof fn === "function" ? fn.bind(bridge) : undefined;
}

function fallbackMeasureText(canvas, text, familyName, weight, size) {
    const normalizedText = String(text ?? "");
    const fontSize = Number(size);
    if (!normalizedText || !Number.isFinite(fontSize) || fontSize <= 0) {
        return 0;
    }

    const context = canvas?.getContext?.("2d");
    if (context) {
        context.save();
        try {
            const cssWeight = normalizeFontWeight(weight);
            const cssFamily = normalizeFontFamily(familyName);
            context.font = `${cssWeight} ${fontSize}px ${cssFamily}`;
            return normalizedText
                .split(/\r\n|\r|\n/)
                .reduce((width, line) => Math.max(width, context.measureText(line).width), 0);
        } finally {
            context.restore();
        }
    }

    let width = 0;
    let lineWidth = 0;
    for (const ch of normalizedText) {
        if (ch === "\n" || ch === "\r") {
            width = Math.max(width, lineWidth);
            lineWidth = 0;
            continue;
        }

        lineWidth += isWideCharacter(ch) ? fontSize : fontSize * 0.55;
    }

    return Math.max(width, lineWidth);
}

function normalizeFontWeight(weight) {
    const value = Number(weight || 400);
    return Number.isFinite(value) && value > 0 ? Math.round(value).toString() : "400";
}

function normalizeFontFamily(familyName) {
    const family = String(familyName ?? "").trim();
    if (!family) {
        return "sans-serif";
    }

    return family
        .split(",")
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => /[\s"']/.test(part) ? `"${part.replaceAll("\"", "\\\"")}"` : part)
        .join(", ") || "sans-serif";
}

function isWideCharacter(ch) {
    const code = ch.codePointAt(0) ?? 0;
    return (code >= 0x2E80 && code <= 0x9FFF) ||
        (code >= 0xF900 && code <= 0xFAFF) ||
        (code >= 0xFF00 && code <= 0xFFEF);
}

function resolveCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error(`Element '${canvasId}' was not found or is not a canvas.`);
    }

    return canvas;
}

function getRenderer(renderers, rendererId) {
    const renderer = renderers.get(rendererId);
    if (!renderer) {
        throw new Error(`Renderer '${rendererId}' was not found.`);
    }

    return renderer;
}

function normalizeSize(value, name) {
    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) {
        throw new Error(`Renderer ${name} must be a positive number.`);
    }

    return Math.floor(size);
}

function colorByte(value) {
    const byteValue = Number(value);
    if (!Number.isFinite(byteValue)) {
        return 0;
    }

    return Math.max(0, Math.min(255, byteValue)) & 0xff;
}
