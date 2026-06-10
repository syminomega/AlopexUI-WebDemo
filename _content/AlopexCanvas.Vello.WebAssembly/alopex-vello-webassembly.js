export function createBrowserVelloImports() {
    const renderers = new Map();
    let nextRendererId = 1;

    return {
        createRenderer: async (canvasId, width, height, wasmJsModuleUrl, wasmModuleUrl) => {
            const canvas = resolveCanvas(canvasId);
            canvas.width = normalizeSize(width, "width");
            canvas.height = normalizeSize(height, "height");

            const module = await loadVelloModule(wasmJsModuleUrl, wasmModuleUrl);

            if (typeof module.create_renderer !== "function") {
                throw new Error("The Vello wasm bridge does not export create_renderer(canvas, width, height).");
            }

            const bridge = await module.create_renderer(canvas, canvas.width, canvas.height);
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

        registerImage: (rendererId, imageId, imageBytes) => {
            const renderer = getRenderer(renderers, rendererId);
            renderer.api.registerImage(BigInt(imageId), new Uint8Array(imageBytes.slice()));
        },

        registerFont: (rendererId, familyName, fontBytes) => {
            const renderer = getRenderer(renderers, rendererId);
            renderer.api.registerFont(String(familyName ?? ""), new Uint8Array(fontBytes.slice()));
        },

        measureText: (rendererId, text, familyName, size) => {
            const renderer = getRenderer(renderers, rendererId);
            return renderer.api.measureText(String(familyName ?? ""), String(text ?? ""), size);
        },

        directBeginFrame: rendererId => getRenderer(renderers, rendererId).api.beginFrame(),
        directBeginElement: (rendererId, elementIdHigh, elementIdLow) =>
            getRenderer(renderers, rendererId).api.beginElement(composeU64(elementIdHigh, elementIdLow)),
        directEndElement: rendererId => getRenderer(renderers, rendererId).api.endElement(),
        directDrawElement: (rendererId, elementIdHigh, elementIdLow, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawElement(composeU64(elementIdHigh, elementIdLow), m11, m12, m21, m22, m31, m32),
        directDropElement: (rendererId, elementIdHigh, elementIdLow) =>
            getRenderer(renderers, rendererId).api.dropElement(composeU64(elementIdHigh, elementIdLow)),
        directBeginFrameGraph: (rendererId, frameIdHigh, frameIdLow) =>
            getRenderer(renderers, rendererId).api.beginFrameGraph(composeU64(frameIdHigh, frameIdLow)),
        directEndFrameGraph: rendererId => getRenderer(renderers, rendererId).api.endFrameGraph(),
        directDrawFrameGraph: (rendererId, frameIdHigh, frameIdLow, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawFrameGraph(composeU64(frameIdHigh, frameIdLow), m11, m12, m21, m22, m31, m32),
        directDropFrameGraph: (rendererId, frameIdHigh, frameIdLow) =>
            getRenderer(renderers, rendererId).api.dropFrameGraph(composeU64(frameIdHigh, frameIdLow)),

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
        directPushClipPath: (rendererId, pathId, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.pushClipPath(pathId, m11, m12, m21, m22, m31, m32),
        directPopLayer: rendererId => getRenderer(renderers, rendererId).api.popLayer(),

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
        directDrawPath: (rendererId, pathId, style, strokeWidth, strokeCap, strokeJoin, r, g, b, a, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawPath(pathId, style, strokeWidth, strokeCap, strokeJoin, colorByte(r), colorByte(g), colorByte(b), colorByte(a), m11, m12, m21, m22, m31, m32),
        directDrawText: (rendererId, text, x, y, align, familyName, size, r, g, b, a, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawText(String(text ?? ""), x, y, align, String(familyName ?? ""), size, colorByte(r), colorByte(g), colorByte(b), colorByte(a), m11, m12, m21, m22, m31, m32),

        directDrawShapeWithBrush: (rendererId, shape, x0, y0, x1, y1, r0, r1, r2, r3, style, strokeWidth, strokeCap, strokeJoin, brushKind, r, g, b, a, p0x, p0y, p1x, p1y, radius, startAngle, endAngle, spread, stopOffsets, stopColors, imageId, tileMode, stretch, alignX, alignY, hasBounds, boundsX, boundsY, boundsWidth, boundsHeight, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawShapeWithBrush(shape, x0, y0, x1, y1, r0, r1, r2, r3, style, strokeWidth, strokeCap, strokeJoin, brushKind, colorByte(r), colorByte(g), colorByte(b), colorByte(a), p0x, p0y, p1x, p1y, radius, startAngle, endAngle, spread, new Uint8Array(stopOffsets.slice()), new Uint8Array(stopColors.slice()), BigInt(imageId || "0"), tileMode, stretch, alignX, alignY, Boolean(hasBounds), boundsX, boundsY, boundsWidth, boundsHeight, m11, m12, m21, m22, m31, m32),
        directDrawTextWithBrush: (rendererId, text, x, y, align, familyName, size, brushKind, r, g, b, a, p0x, p0y, p1x, p1y, radius, startAngle, endAngle, spread, stopOffsets, stopColors, imageId, tileMode, stretch, alignX, alignY, hasBounds, boundsX, boundsY, boundsWidth, boundsHeight, m11, m12, m21, m22, m31, m32) =>
            getRenderer(renderers, rendererId).api.drawTextWithBrush(String(text ?? ""), x, y, align, String(familyName ?? ""), size, brushKind, colorByte(r), colorByte(g), colorByte(b), colorByte(a), p0x, p0y, p1x, p1y, radius, startAngle, endAngle, spread, new Uint8Array(stopOffsets.slice()), new Uint8Array(stopColors.slice()), BigInt(imageId || "0"), tileMode, stretch, alignX, alignY, Boolean(hasBounds), boundsX, boundsY, boundsWidth, boundsHeight, m11, m12, m21, m22, m31, m32),

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
        registerFont: requireExport(bridge, "register_font"),
        measureText: requireExport(bridge, "measure_text"),
        beginFrame: requireExport(bridge, "direct_begin_frame"),
        beginElement: requireExport(bridge, "direct_begin_element"),
        endElement: requireExport(bridge, "direct_end_element"),
        drawElement: requireExport(bridge, "direct_draw_element"),
        dropElement: requireExport(bridge, "direct_drop_element"),
        beginFrameGraph: requireExport(bridge, "direct_begin_frame_graph"),
        endFrameGraph: requireExport(bridge, "direct_end_frame_graph"),
        drawFrameGraph: requireExport(bridge, "direct_draw_frame_graph"),
        dropFrameGraph: requireExport(bridge, "direct_drop_frame_graph"),
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
        pushClipPath: requireExport(bridge, "direct_push_clip_path"),
        popLayer: requireExport(bridge, "direct_pop_layer"),
        drawRect: requireExport(bridge, "direct_draw_rect"),
        drawRoundRect: requireExport(bridge, "direct_draw_round_rect"),
        drawCircle: requireExport(bridge, "direct_draw_circle"),
        drawOval: requireExport(bridge, "direct_draw_oval"),
        drawLine: requireExport(bridge, "direct_draw_line"),
        drawPath: requireExport(bridge, "direct_draw_path"),
        drawText: requireExport(bridge, "direct_draw_text"),
        drawShapeWithBrush: requireExport(bridge, "direct_draw_shape_with_brush"),
        drawTextWithBrush: requireExport(bridge, "direct_draw_text_with_brush"),
        dispose: typeof bridge.dispose === "function" ? bridge.dispose.bind(bridge) : () => {},
    };
}

function composeU64(high, low) {
    return (BigInt(high >>> 0) << 32n) | BigInt(low >>> 0);
}

function requireExport(bridge, name) {
    const fn = bridge?.[name];
    if (typeof fn !== "function") {
        throw new Error(`The Vello wasm bridge does not export ${name}.`);
    }

    return fn.bind(bridge);
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
