let defaultHost = null;

export function createBrowserApplicationImports(canvasId = "surface", getEventDispatcher = null) {
    defaultHost = new AlopexApplicationHost(resolveHostElement(canvasId), getEventDispatcher);

    return {
        initialize: async (initialCanvasId) => {
            defaultHost = new AlopexApplicationHost(resolveHostElement(initialCanvasId || canvasId), getEventDispatcher);
        },
        createWindow: async (optionsJson) =>
            JSON.stringify(defaultHost.createWindow(parseOptions(optionsJson))),
        start: () => defaultHost.start(),
        requestRedraw: (windowId) => defaultHost.requestRedraw(windowId),
        setTitle: (windowId, title) => defaultHost.setTitle(windowId, title),
        setCursor: (windowId, cursor) => defaultHost.setCursor(windowId, cursor),
        setCursorVisible: (windowId, visible) => defaultHost.setCursorVisible(windowId, visible),
        setOuterPosition: (windowId, x, y) => defaultHost.setOuterPosition(windowId, x, y),
        requestSurfaceSize: (windowId, width, height) => defaultHost.requestSurfaceSize(windowId, width, height),
        setResizable: (windowId, resizable) => defaultHost.setResizable(windowId, resizable),
        setMaximized: (windowId, maximized) => defaultHost.setMaximized(windowId, maximized),
        setMinimized: (windowId, minimized) => defaultHost.setMinimized(windowId, minimized),
        setVisible: (windowId, visible) => defaultHost.setVisible(windowId, visible),
        setDecorations: (windowId, decorated) => defaultHost.setDecorations(windowId, decorated),
        setWindowLevel: (windowId, level) => defaultHost.setWindowLevel(windowId, level),
        setEnabledButtons: (windowId, buttons) => defaultHost.setEnabledButtons(windowId, buttons),
        setMinSurfaceSize: (windowId, hasSize, width, height) => defaultHost.setMinSurfaceSize(windowId, hasSize, width, height),
        setMaxSurfaceSize: (windowId, hasSize, width, height) => defaultHost.setMaxSurfaceSize(windowId, hasSize, width, height),
        enableTextInput: (windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex) =>
            defaultHost.enableTextInput(windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex),
        updateTextInput: (windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex) =>
            defaultHost.updateTextInput(windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex),
        disableTextInput: (windowId) => defaultHost.disableTextInput(windowId),
        readClipboardText: () => readClipboardText(),
        writeClipboardText: (text) => writeClipboardText(text),
        destroyWindow: (windowId) => defaultHost.destroyWindow(windowId),
        stop: () => defaultHost.stop(),
        dispose: () => defaultHost.dispose(),
    };
}

export async function initializeBrowserApplicationImports(canvas, moduleName = "alopex-application.js") {
    const runtime = findDotnetRuntime();
    if (!runtime?.setModuleImports || !runtime?.getAssemblyExports) {
        return false;
    }

    const exportsRef = await runtime.getAssemblyExports("AlopexApplication.WebAssembly");
    const applicationExports = exportsRef?.AlopexApplication?.WebAssembly?.BrowserWebApplicationHost;
    if (!applicationExports) {
        return false;
    }

    runtime.setModuleImports(moduleName, {
        alopexApplication: createBrowserApplicationImports(canvas, () => applicationExports),
    });
    return true;
}

export function createBlazorEventLoop(canvas) {
    if (!(canvas instanceof HTMLElement)) {
        throw new Error("ElementReference must reference an HTMLElement.");
    }

    const host = new AlopexApplicationHost(canvas);
    return {
        createWindow: (options) => host.createWindow(parseOptions(options)),
        createWindowJson: (options) => JSON.stringify(host.createWindow(parseOptions(options))),
        start: (eventTarget) => host.start(eventTarget),
        requestRedraw: (windowId) => host.requestRedraw(windowId),
        setTitle: (windowId, title) => host.setTitle(windowId, title),
        setCursor: (windowId, cursor) => host.setCursor(windowId, cursor),
        setCursorVisible: (windowId, visible) => host.setCursorVisible(windowId, visible),
        setOuterPosition: (windowId, x, y) => host.setOuterPosition(windowId, x, y),
        requestSurfaceSize: (windowId, width, height) => host.requestSurfaceSize(windowId, width, height),
        setResizable: (windowId, resizable) => host.setResizable(windowId, resizable),
        setMaximized: (windowId, maximized) => host.setMaximized(windowId, maximized),
        setMinimized: (windowId, minimized) => host.setMinimized(windowId, minimized),
        setVisible: (windowId, visible) => host.setVisible(windowId, visible),
        setDecorations: (windowId, decorated) => host.setDecorations(windowId, decorated),
        setWindowLevel: (windowId, level) => host.setWindowLevel(windowId, level),
        setEnabledButtons: (windowId, buttons) => host.setEnabledButtons(windowId, buttons),
        setMinSurfaceSize: (windowId, hasSize, width, height) => host.setMinSurfaceSize(windowId, hasSize, width, height),
        setMaxSurfaceSize: (windowId, hasSize, width, height) => host.setMaxSurfaceSize(windowId, hasSize, width, height),
        enableTextInput: (windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex) =>
            host.enableTextInput(windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex),
        updateTextInput: (windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex) =>
            host.updateTextInput(windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex),
        disableTextInput: (windowId) => host.disableTextInput(windowId),
        destroyWindow: (windowId) => host.destroyWindow(windowId),
        stop: () => host.stop(),
        dispose: () => host.dispose(),
    };
}

class AlopexApplicationHost {
    constructor(hostElement, getEventDispatcher = null) {
        this.hostElement = hostElement;
        this.container = hostElement instanceof HTMLCanvasElement
            ? hostElement.parentElement ?? document.body
            : hostElement;
        this.initialCanvas = hostElement instanceof HTMLCanvasElement ? hostElement : null;
        this.getEventDispatcher = getEventDispatcher;
        this.windows = new Map();
        this.nextWindowId = 1n;
        this.eventTarget = null;
        this.started = false;
        this.disposers = [];
        this.pendingRedraws = new Set();
        this.rafScheduled = false;
        this.activePointerCapture = new Map();
        this.zOrderCounter = 0;
        this.ensureContainer();
    }

    createWindow(options = {}) {
        const title = String(options.title ?? options.Title ?? "AlopexApplication");
        const contentCssWidth = normalizeSize(options.width ?? options.Width ?? 1180, "width");
        const contentCssHeight = normalizeSize(options.height ?? options.Height ?? 720, "height");
        const surfaceSizeIsLogical = Boolean(options.surfaceSizeIsLogical ?? options.SurfaceSizeIsLogical ?? true);
        const dpr = window.devicePixelRatio || 1;
        const width = surfaceSizeIsLogical ? Math.max(1, Math.round(contentCssWidth * dpr)) : contentCssWidth;
        const height = surfaceSizeIsLogical ? Math.max(1, Math.round(contentCssHeight * dpr)) : contentCssHeight;
        const id = this.nextWindowId++;
        const index = this.windows.size;
        const x = Number.isFinite(Number(options.positionX ?? options.PositionX))
            ? Math.round(Number(options.positionX ?? options.PositionX))
            : 48 + index * 42;
        const y = clampWindowY(Number.isFinite(Number(options.positionY ?? options.PositionY))
            ? Math.round(Number(options.positionY ?? options.PositionY))
            : 42 + index * 42);
        const minContentCssWidth = surfaceToCssSize(options.minWidth ?? options.MinWidth, dpr, 260);
        const minContentCssHeight = surfaceToCssSize(options.minHeight ?? options.MinHeight, dpr, 160);
        const rawMaxWidth = surfaceToCssSize(options.maxWidth ?? options.MaxWidth, dpr, null);
        const rawMaxHeight = surfaceToCssSize(options.maxHeight ?? options.MaxHeight, dpr, null);
        const maxContentCssWidth = rawMaxWidth === null ? null : Math.max(minContentCssWidth, rawMaxWidth);
        const maxContentCssHeight = rawMaxHeight === null ? null : Math.max(minContentCssHeight, rawMaxHeight);
        const decorated = Boolean(options.decorations ?? options.Decorations ?? true);
        const enabledButtons = Number(options.enabledButtons ?? options.EnabledButtons ?? 7);

        const frame = document.createElement("div");
        frame.className = "alopex-web-window";
        frame.dataset.alopexWindowId = id.toString();
        frame.style.position = "absolute";
        frame.style.left = `${x}px`;
        frame.style.top = `${y}px`;
        frame.style.width = `${contentCssWidth}px`;
        frame.style.height = `${contentCssHeight + (decorated ? titleBarHeight() : 0)}px`;
        frame.style.display = Boolean(options.visible ?? options.Visible ?? true) ? "grid" : "none";
        frame.style.gridTemplateRows = decorated ? `${titleBarHeight()}px 1fr` : "1fr";

        const titlebar = document.createElement("div");
        titlebar.className = "alopex-web-window-titlebar";

        const titleText = document.createElement("span");
        titleText.className = "alopex-web-window-title";
        titleText.textContent = title;
        titlebar.appendChild(titleText);

        const buttons = document.createElement("div");
        buttons.className = "alopex-web-window-buttons";

        const minimizeButton = document.createElement("button");
        minimizeButton.className = "alopex-web-window-minimize";
        minimizeButton.type = "button";
        minimizeButton.setAttribute("aria-label", "Minimize");
        minimizeButton.textContent = "-";

        const maximizeButton = document.createElement("button");
        maximizeButton.className = "alopex-web-window-maximize";
        maximizeButton.type = "button";
        maximizeButton.setAttribute("aria-label", "Maximize");
        maximizeButton.textContent = "[]";

        const closeButton = document.createElement("button");
        closeButton.className = "alopex-web-window-close";
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Close");
        closeButton.textContent = "x";

        buttons.appendChild(minimizeButton);
        buttons.appendChild(maximizeButton);
        buttons.appendChild(closeButton);
        titlebar.appendChild(buttons);

        const content = document.createElement("div");
        content.className = "alopex-web-window-content";

        const canvas = this.takeInitialCanvasOrCreate();
        if (!canvas.id) {
            canvas.id = `alopex-window-${id}`;
        }
        canvas.tabIndex = 0;
        canvas.dataset.alopexWindowId = id.toString();
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        canvas.style.touchAction = "none";

        const textInput = document.createElement("textarea");
        textInput.className = "alopex-web-text-input";
        textInput.setAttribute("autocomplete", "off");
        textInput.setAttribute("autocapitalize", "off");
        textInput.setAttribute("spellcheck", "false");
        textInput.setAttribute("aria-hidden", "true");

        const resizeHandle = document.createElement("div");
        resizeHandle.className = "alopex-web-window-resize";

        content.appendChild(canvas);
        content.appendChild(textInput);
        frame.appendChild(titlebar);
        frame.appendChild(content);
        frame.appendChild(resizeHandle);
        this.container.appendChild(frame);

        const entry = {
            id,
            frame,
            titlebar,
            titleText,
            minimizeButton,
            maximizeButton,
            closeButton,
            content,
            resizeHandle,
            canvas,
            textInput,
            title,
            width,
            height,
            contentCssWidth,
            contentCssHeight,
            x,
            y,
            dpr,
            surfaceSizeIsLogical,
            visibleCursor: true,
            resizable: Boolean(options.resizable ?? options.Resizable ?? true),
            maximized: false,
            minimized: false,
            visible: Boolean(options.visible ?? options.Visible ?? true),
            decorated,
            windowLevel: String(options.windowLevel ?? options.WindowLevel ?? "Normal"),
            enabledButtons,
            minContentCssWidth,
            minContentCssHeight,
            maxContentCssWidth,
            maxContentCssHeight,
            restoreRect: null,
            textInputEnabled: false,
            textInputComposing: false,
            textInputSurroundingText: "",
            textInputCursorByteIndex: 0,
            textInputAnchorByteIndex: 0,
        };
        this.windows.set(id.toString(), entry);
        this.resizeEntry(entry, contentCssWidth, contentCssHeight, false);
        titlebar.style.display = decorated ? "" : "none";
        resizeHandle.style.display = entry.resizable ? "" : "none";
        minimizeButton.style.display = "none";
        minimizeButton.disabled = true;
        maximizeButton.disabled = !entry.resizable;
        this.applyEnabledButtons(entry);
        this.setWindowLevel(entry.id, entry.windowLevel, false);
        this.bringToFront(entry);
        if (Boolean(options.maximized ?? options.Maximized ?? false)) {
            this.setMaximized(entry.id, true);
        }
        this.bindWindowEvents(entry);
        this.bindWindowChrome(entry);
        return {
            windowId: id.toString(),
            canvasId: canvas.id,
            width: entry.width,
            height: entry.height,
            scaleFactor: entry.dpr,
            title,
            x: entry.x,
            y: entry.y,
            resizable: entry.resizable,
            maximized: entry.maximized,
            minimized: entry.minimized,
            visible: entry.visible,
            decorated: entry.decorated,
            windowLevel: entry.windowLevel,
            enabledButtons: entry.enabledButtons,
        };
    }

    ensureContainer() {
        ensureWindowStyles();
        const style = this.container.style;
        const computed = getComputedStyle(this.container);
        if (computed.position === "static") {
            style.position = "relative";
        }
        if (!style.minHeight) {
            style.minHeight = "100vh";
        }
        style.overflow = style.overflow || "auto";
    }

    takeInitialCanvasOrCreate() {
        if (this.initialCanvas) {
            const canvas = this.initialCanvas;
            this.initialCanvas = null;
            canvas.remove();
            return canvas;
        }

        const canvas = document.createElement("canvas");
        canvas.className = "alopex-window-surface";
        return canvas;
    }

    start(eventTarget = null) {
        this.eventTarget = eventTarget;
        this.started = true;
        for (const entry of this.windows.values()) {
            this.dispatchResize(entry);
            this.requestRedraw(entry.id);
        }

        const resize = () => this.handleResize();
        window.addEventListener("resize", resize);
        this.disposers.push(() => window.removeEventListener("resize", resize));
    }

    stop() {
        this.started = false;
        this.pendingRedraws.clear();
    }

    dispose() {
        this.stop();
        for (const dispose of this.disposers.splice(0)) {
            dispose();
        }
        this.windows.clear();
    }

    destroyWindow(windowId) {
        const key = windowId.toString();
        const entry = this.windows.get(key);
        if (!entry) return;

        this.windows.delete(key);
        entry.frame.remove();
        this.dispatchWindowEvent(entry, { kind: "destroyed" });
    }

    requestRedraw(windowId) {
        const key = windowId.toString();
        if (!this.windows.has(key)) return;

        this.pendingRedraws.add(key);
        if (!this.started || this.rafScheduled) return;

        this.rafScheduled = true;
        requestAnimationFrame(async () => {
            this.rafScheduled = false;
            if (!this.started) return;

            await this.dispatchAboutToWait();
            const pending = [...this.pendingRedraws];
            this.pendingRedraws.clear();
            for (const id of pending) {
                const entry = this.windows.get(id);
                if (entry) {
                    await this.dispatchWindowEvent(entry, { kind: "redraw-requested" });
                }
            }
        });
    }

    setTitle(windowId, title) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        entry.title = String(title ?? "");
        entry.titleText.textContent = entry.title;
        if (this.windows.size > 0 && entry.id === 1n) {
            document.title = entry.title;
        }
    }

    setCursor(windowId, cursor) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        entry.canvas.style.cursor = entry.visibleCursor ? cursor : "none";
        entry.cursor = cursor;
    }

    setCursorVisible(windowId, visible) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        entry.visibleCursor = Boolean(visible);
        entry.canvas.style.cursor = entry.visibleCursor ? (entry.cursor || "default") : "none";
    }

    setOuterPosition(windowId, x, y) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        entry.x = Math.round(Number(x) || 0);
        entry.y = clampWindowY(Number(y));
        entry.frame.style.left = `${entry.x}px`;
        entry.frame.style.top = `${entry.y}px`;
        this.dispatchWindowEvent(entry, { kind: "moved", frameX: entry.x, frameY: entry.y });
    }

    requestSurfaceSize(windowId, width, height) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        const dpr = window.devicePixelRatio || 1;
        this.resizeEntry(
            entry,
            Math.max(entry.minContentCssWidth, Math.round(Number(width) / dpr)),
            Math.max(entry.minContentCssHeight, Math.round(Number(height) / dpr)),
            true);
    }

    setResizable(windowId, resizable) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        entry.resizable = Boolean(resizable);
        entry.resizeHandle.style.display = entry.resizable ? "" : "none";
        this.applyEnabledButtons(entry);
        this.dispatchStateChanged(entry);
    }

    applyEnabledButtons(entry) {
        const buttons = Number.isFinite(entry.enabledButtons) ? entry.enabledButtons : 7;
        entry.closeButton.disabled = (buttons & 1) === 0;
        entry.minimizeButton.disabled = true;
        entry.minimizeButton.style.display = "none";
        entry.maximizeButton.disabled = (buttons & 4) === 0 || !entry.resizable;
    }

    setMaximized(windowId, maximized) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;

        const shouldMaximize = Boolean(maximized);
        if (shouldMaximize === entry.maximized) return;

        this.animateWindowStateChange(entry);

        if (shouldMaximize) {
            entry.restoreRect = {
                x: entry.x,
                y: clampWindowY(entry.y),
                width: entry.contentCssWidth,
                height: entry.contentCssHeight,
            };
            entry.maximized = true;
            entry.minimized = false;
            entry.frame.classList.add("alopex-web-window-maximized");
            entry.frame.style.display = "grid";
            this.applyMaximizedRect(entry);
        } else {
            entry.maximized = false;
            entry.frame.classList.remove("alopex-web-window-maximized");
            const rect = entry.restoreRect ?? { x: 48, y: 42, width: entry.contentCssWidth, height: entry.contentCssHeight };
            entry.x = rect.x;
            entry.y = clampWindowY(rect.y);
            entry.frame.style.left = `${entry.x}px`;
            entry.frame.style.top = `${entry.y}px`;
            this.resizeEntry(entry, rect.width, rect.height, true);
        }

        entry.maximizeButton.textContent = entry.maximized ? "[ ]" : "[]";
        this.dispatchWindowEvent(entry, { kind: "moved", frameX: entry.x, frameY: entry.y });
        this.dispatchStateChanged(entry);
    }

    setMinimized(windowId, minimized) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;

        entry.minimizeButton.disabled = true;
        entry.minimizeButton.style.display = "none";

        if (entry.minimized || entry.content.style.display === "none") {
            entry.minimized = false;
            entry.content.style.display = "";
            entry.resizeHandle.style.display = entry.resizable ? "" : "none";
            entry.frame.style.gridTemplateRows = entry.decorated ? `${decoratedTitleBarHeight(entry)}px 1fr` : "1fr";
            entry.frame.style.height = `${entry.contentCssHeight + decoratedTitleBarHeight(entry)}px`;
            this.requestRedraw(entry.id);
        }

        this.dispatchStateChanged(entry);
    }

    animateWindowStateChange(entry) {
        entry.frame.classList.remove("alopex-web-window-animating");
        void entry.frame.offsetWidth;
        entry.frame.classList.add("alopex-web-window-animating");

        window.clearTimeout(entry.animationTimeout);
        entry.animationTimeout = window.setTimeout(() => {
            entry.frame.classList.remove("alopex-web-window-animating");
            entry.animationTimeout = null;
        }, 240);
    }

    setVisible(windowId, visible) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        entry.visible = Boolean(visible);
        entry.frame.style.display = entry.visible ? "grid" : "none";
        if (entry.visible) {
            this.requestRedraw(entry.id);
        }
        this.dispatchStateChanged(entry);
    }

    setDecorations(windowId, decorated) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        entry.decorated = Boolean(decorated);
        entry.titlebar.style.display = entry.decorated ? "" : "none";
        entry.frame.style.gridTemplateRows = entry.decorated ? `${decoratedTitleBarHeight(entry)}px 1fr` : "1fr";
        entry.frame.style.height = `${entry.contentCssHeight + decoratedTitleBarHeight(entry)}px`;
        this.requestRedraw(entry.id);
        this.dispatchStateChanged(entry);
    }

    setWindowLevel(windowId, level, dispatch = true) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        const name = String(level ?? "Normal");
        entry.windowLevel = name;
        this.applyWindowZIndex(entry);
        if (dispatch) {
            this.dispatchStateChanged(entry);
        }
    }

    bringToFront(entry) {
        if (!entry || !entry.visible) return;
        entry.zOrder = ++this.zOrderCounter;
        this.applyWindowZIndex(entry);
    }

    applyWindowZIndex(entry) {
        const level = entry.windowLevel ?? "Normal";
        const base = level === "AlwaysOnTop"
            ? 2000000
            : level === "AlwaysOnBottom"
                ? 0
                : 1000000;
        entry.frame.style.zIndex = String(base + (entry.zOrder ?? 0));
    }

    setEnabledButtons(windowId, buttons) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        entry.enabledButtons = Number(buttons) & 7;
        this.applyEnabledButtons(entry);
        this.dispatchStateChanged(entry);
    }

    setMinSurfaceSize(windowId, hasSize, width, height) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        const dpr = window.devicePixelRatio || 1;
        entry.minContentCssWidth = hasSize ? Math.max(80, Math.round(Number(width) / dpr)) : 260;
        entry.minContentCssHeight = hasSize ? Math.max(60, Math.round(Number(height) / dpr)) : 160;
        this.resizeEntry(entry, entry.contentCssWidth, entry.contentCssHeight, true);
    }

    setMaxSurfaceSize(windowId, hasSize, width, height) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        const dpr = window.devicePixelRatio || 1;
        entry.maxContentCssWidth = hasSize ? Math.max(entry.minContentCssWidth, Math.round(Number(width) / dpr)) : null;
        entry.maxContentCssHeight = hasSize ? Math.max(entry.minContentCssHeight, Math.round(Number(height) / dpr)) : null;
        this.resizeEntry(entry, entry.contentCssWidth, entry.contentCssHeight, true);
    }

    enableTextInput(windowId, caretX, caretY, caretWidth, caretHeight, surroundingText = "", cursorByteIndex = 0, anchorByteIndex = 0) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        entry.textInputEnabled = true;
        this.positionTextInput(entry, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex);
        entry.textInput.value = "";
        entry.textInput.focus({ preventScroll: true });
        this.dispatchWindowEvent(entry, { kind: "ime-enabled" });
    }

    updateTextInput(windowId, caretX, caretY, caretWidth, caretHeight, surroundingText = "", cursorByteIndex = 0, anchorByteIndex = 0) {
        const entry = this.windows.get(windowId.toString());
        if (!entry || !entry.textInputEnabled) return;
        this.positionTextInput(entry, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex);
    }

    disableTextInput(windowId) {
        const entry = this.windows.get(windowId.toString());
        if (!entry || !entry.textInputEnabled) return;
        entry.textInputEnabled = false;
        entry.textInputComposing = false;
        entry.textInput.value = "";
        entry.textInput.blur();
        entry.textInput.style.display = "none";
        this.dispatchWindowEvent(entry, { kind: "ime-disabled" });
    }

    positionTextInput(entry, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex) {
        entry.textInputSurroundingText = String(surroundingText ?? "");
        entry.textInputCursorByteIndex = Number(cursorByteIndex) || 0;
        entry.textInputAnchorByteIndex = Number(anchorByteIndex) || 0;
        const input = entry.textInput;
        input.style.display = "block";
        input.style.left = `${Math.max(0, Number(caretX) || 0)}px`;
        input.style.top = `${Math.max(0, Number(caretY) || 0)}px`;
        input.style.width = `${Math.max(1, Number(caretWidth) || 1)}px`;
        input.style.height = `${Math.max(16, Number(caretHeight) || 16)}px`;
    }

    bindWindowEvents(entry) {
        const canvas = entry.canvas;
        const textInput = entry.textInput;
        const on = (target, name, handler, options) => {
            target.addEventListener(name, handler, options);
            this.disposers.push(() => target.removeEventListener(name, handler, options));
        };

        on(canvas, "pointerenter", event => this.dispatchPointer(entry, event, "pointer-entered"));
        on(canvas, "pointerleave", event => this.dispatchPointer(entry, event, "pointer-left"));
        on(canvas, "pointermove", event => this.dispatchPointer(entry, event, "pointer-moved"));
        on(canvas, "pointerdown", event => {
            canvas.focus();
            this.dispatchPointer(entry, event, "pointer-button", "pressed");
        });
        on(canvas, "pointerup", event => this.dispatchPointer(entry, event, "pointer-button", "released"));
        on(canvas, "wheel", event => {
            event.preventDefault();
            const point = canvasPoint(entry, event);
            this.dispatchWindowEvent(entry, {
                kind: "mouse-wheel",
                x: point.x,
                y: point.y,
                wheelX: event.deltaX,
                wheelY: event.deltaY,
            });
        }, { passive: false });
        on(canvas, "keydown", event => {
            if (shouldPreventBrowserKeyboardDefault(event)) {
                event.preventDefault();
            }
            this.dispatchKeyboard(entry, event, "pressed");
        });
        on(canvas, "keyup", event => this.dispatchKeyboard(entry, event, "released"));
        on(textInput, "keydown", event => {
            if (shouldPreventBrowserKeyboardDefault(event)) {
                event.preventDefault();
            }
            this.dispatchKeyboard(entry, event, "pressed", true);
        });
        on(textInput, "keyup", event => this.dispatchKeyboard(entry, event, "released", true));
        on(textInput, "compositionstart", () => {
            entry.textInputComposing = true;
            this.dispatchWindowEvent(entry, { kind: "ime-preedit", imeText: "" });
        });
        on(textInput, "compositionupdate", event => {
            this.dispatchWindowEvent(entry, {
                kind: "ime-preedit",
                imeText: event.data ?? textInput.value ?? "",
                imeCursorStartByte: -1,
                imeCursorEndByte: -1,
            });
        });
        on(textInput, "compositionend", event => {
            entry.textInputComposing = false;
            this.dispatchWindowEvent(entry, { kind: "ime-preedit", imeText: "" });
            const text = event.data || textInput.value || "";
            if (text) {
                this.dispatchWindowEvent(entry, { kind: "ime-commit", imeText: text });
            }
            textInput.value = "";
        });
        on(textInput, "input", () => {
            if (entry.textInputComposing) return;
            const text = textInput.value || "";
            if (text) {
                this.dispatchWindowEvent(entry, { kind: "ime-commit", imeText: text });
                textInput.value = "";
            }
        });
        on(textInput, "paste", event => {
            const text = event.clipboardData?.getData("text/plain") ?? "";
            if (!text) return;
            event.preventDefault();
            this.dispatchWindowEvent(entry, { kind: "ime-commit", imeText: text });
            textInput.value = "";
        });
    }

    bindWindowChrome(entry) {
        const titlebar = entry.titlebar;
        const resizeHandle = entry.resizeHandle;
        const closeButton = entry.closeButton;
        const minimizeButton = entry.minimizeButton;
        const maximizeButton = entry.maximizeButton;

        entry.frame.addEventListener("pointerdown", () => {
            this.bringToFront(entry);
        });

        minimizeButton.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            if (minimizeButton.disabled) return;
            this.setMinimized(entry.id, !entry.minimized);
        });

        maximizeButton.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            if (maximizeButton.disabled) return;
            this.setMaximized(entry.id, !entry.maximized);
        });

        closeButton.addEventListener("click", async event => {
            event.preventDefault();
            event.stopPropagation();
            if (closeButton.disabled) return;
            await this.dispatchWindowEvent(entry, { kind: "close-requested" });
            this.destroyWindow(entry.id);
        });

        titlebar.addEventListener("dblclick", event => {
            if (event.target === closeButton || event.target === minimizeButton || event.target === maximizeButton) return;
            if (!entry.resizable || entry.minimized) return;
            event.preventDefault();
            this.setMaximized(entry.id, !entry.maximized);
        });

        titlebar.addEventListener("pointerdown", event => {
            if (event.target === closeButton || event.target === minimizeButton || event.target === maximizeButton || entry.maximized || entry.minimized) return;
            event.preventDefault();
            titlebar.setPointerCapture(event.pointerId);
            const startX = event.clientX;
            const startY = event.clientY;
            const originX = entry.x;
            const originY = entry.y;

            const move = moveEvent => {
                entry.x = Math.round(originX + moveEvent.clientX - startX);
                entry.y = clampWindowY(originY + moveEvent.clientY - startY);
                entry.frame.style.left = `${entry.x}px`;
                entry.frame.style.top = `${entry.y}px`;
                this.dispatchWindowEvent(entry, { kind: "moved", frameX: entry.x, frameY: entry.y });
            };
            const up = upEvent => {
                titlebar.releasePointerCapture(upEvent.pointerId);
                titlebar.removeEventListener("pointermove", move);
                titlebar.removeEventListener("pointerup", up);
                titlebar.removeEventListener("pointercancel", up);
            };

            titlebar.addEventListener("pointermove", move);
            titlebar.addEventListener("pointerup", up);
            titlebar.addEventListener("pointercancel", up);
        });

        resizeHandle.addEventListener("pointerdown", event => {
            if (!entry.resizable || entry.maximized || entry.minimized) return;
            event.preventDefault();
            resizeHandle.setPointerCapture(event.pointerId);
            const startX = event.clientX;
            const startY = event.clientY;
            const startWidth = entry.contentCssWidth;
            const startHeight = entry.contentCssHeight;

            const move = moveEvent => {
                const width = Math.round(startWidth + moveEvent.clientX - startX);
                const height = Math.round(startHeight + moveEvent.clientY - startY);
                this.resizeEntry(entry, width, height, true);
            };
            const up = upEvent => {
                resizeHandle.releasePointerCapture(upEvent.pointerId);
                resizeHandle.removeEventListener("pointermove", move);
                resizeHandle.removeEventListener("pointerup", up);
                resizeHandle.removeEventListener("pointercancel", up);
            };

            resizeHandle.addEventListener("pointermove", move);
            resizeHandle.addEventListener("pointerup", up);
            resizeHandle.addEventListener("pointercancel", up);
        });
    }

    async dispatchPointer(entry, event, kind, state = "pressed") {
        const point = canvasPoint(entry, event);
        await this.dispatchWindowEvent(entry, {
            kind,
            x: point.x,
            y: point.y,
            pointerId: event.pointerId ?? -1,
            pointerType: event.pointerType ?? "mouse",
            isPrimary: event.isPrimary ?? true,
            button: pointerButton(event.button),
            state,
            modifiers: modifiers(event),
        });
    }

    async dispatchKeyboard(entry, event, state, suppressText = false) {
        await this.dispatchWindowEvent(entry, {
            kind: "keyboard-input",
            key: event.key || "",
            code: event.code || "",
            text: !suppressText && event.key?.length === 1 ? event.key : "",
            repeat: Boolean(event.repeat),
            state,
            location: keyLocation(event.location),
            modifiers: modifiers(event),
        });
    }

    handleResize() {
        const dpr = window.devicePixelRatio || 1;
        for (const entry of this.windows.values()) {
            if (entry.maximized) {
                this.applyMaximizedRect(entry);
                continue;
            }

            const width = Math.max(1, Math.round(entry.contentCssWidth * dpr));
            const height = Math.max(1, Math.round(entry.contentCssHeight * dpr));
            if (width === entry.width && height === entry.height && dpr === entry.dpr) continue;

            entry.width = width;
            entry.height = height;
            entry.dpr = dpr;
            entry.canvas.width = width;
            entry.canvas.height = height;
            this.dispatchResize(entry);
        }
    }

    resizeEntry(entry, contentCssWidth, contentCssHeight, dispatch) {
        entry.contentCssWidth = clampSize(contentCssWidth, entry.minContentCssWidth, entry.maxContentCssWidth);
        entry.contentCssHeight = clampSize(contentCssHeight, entry.minContentCssHeight, entry.maxContentCssHeight);
        entry.frame.style.gridTemplateRows = entry.decorated ? `${decoratedTitleBarHeight(entry)}px 1fr` : "1fr";
        entry.frame.style.width = `${entry.contentCssWidth}px`;
        entry.frame.style.height = `${entry.contentCssHeight + decoratedTitleBarHeight(entry)}px`;
        const dpr = window.devicePixelRatio || 1;
        entry.dpr = dpr;
        entry.width = Math.max(1, Math.round(entry.contentCssWidth * dpr));
        entry.height = Math.max(1, Math.round(entry.contentCssHeight * dpr));
        entry.canvas.width = entry.width;
        entry.canvas.height = entry.height;
        if (dispatch) {
            this.dispatchResize(entry);
            this.requestRedraw(entry.id);
        }
    }

    applyMaximizedRect(entry) {
        const rect = this.container.getBoundingClientRect();
        entry.x = 0;
        entry.y = 0;
        entry.frame.style.left = "0px";
        entry.frame.style.top = "0px";
        this.resizeEntry(
            entry,
            Math.max(entry.minContentCssWidth, Math.round(rect.width)),
            Math.max(entry.minContentCssHeight, Math.round(rect.height - decoratedTitleBarHeight(entry))),
            true);
    }

    dispatchResize(entry) {
        this.dispatchWindowEvent(entry, { kind: "surface-resized" });
    }

    dispatchStateChanged(entry) {
        this.dispatchWindowEvent(entry, {
            kind: "window-state-changed",
            frameX: entry.x,
            frameY: entry.y,
            resizable: entry.resizable,
            maximized: entry.maximized,
            minimized: entry.minimized,
            visible: entry.visible,
            decorated: entry.decorated,
            windowLevel: entry.windowLevel ?? "Normal",
            enabledButtons: entry.enabledButtons ?? 7,
        });
    }

    async dispatchAboutToWait() {
        const dispatcher = this.eventTarget ?? this.getEventDispatcher?.();
        if (!dispatcher) return;

        if (dispatcher.invokeMethodAsync) {
            await dispatcher.invokeMethodAsync("DispatchAboutToWaitAsync");
        } else if (dispatcher.DispatchAboutToWaitAsync) {
            await dispatcher.DispatchAboutToWaitAsync();
        }
    }

    async dispatchWindowEvent(entry, event) {
        if (!this.started) return;

        const dispatcher = this.eventTarget ?? this.getEventDispatcher?.();
        if (!dispatcher) return;

        const payload = {
            kind: event.kind,
            windowId: Number(entry.id),
            width: entry.width,
            height: entry.height,
            scaleFactor: entry.dpr,
            x: event.x ?? event.frameX ?? entry.x ?? 0,
            y: event.y ?? event.frameY ?? entry.y ?? 0,
            pointerId: event.pointerId ?? -1,
            pointerType: event.pointerType ?? "",
            isPrimary: event.isPrimary ?? true,
            button: event.button ?? "",
            state: event.state ?? "",
            wheelX: event.wheelX ?? 0,
            wheelY: event.wheelY ?? 0,
            key: event.key ?? "",
            code: event.code ?? "",
            text: event.text ?? "",
            repeat: event.repeat ?? false,
            location: event.location ?? "",
            modifiers: event.modifiers ?? 0,
            resizable: event.resizable ?? null,
            maximized: event.maximized ?? null,
            minimized: event.minimized ?? null,
            visible: event.visible ?? null,
            decorated: event.decorated ?? null,
            windowLevel: event.windowLevel ?? null,
            enabledButtons: event.enabledButtons ?? null,
            imeText: event.imeText ?? "",
            imeCursorStartByte: event.imeCursorStartByte ?? -1,
            imeCursorEndByte: event.imeCursorEndByte ?? -1,
            imeDeleteBeforeBytes: event.imeDeleteBeforeBytes ?? 0,
            imeDeleteAfterBytes: event.imeDeleteAfterBytes ?? 0,
        };

        if (dispatcher.invokeMethodAsync) {
            await dispatcher.invokeMethodAsync("DispatchWindowEventJsonAsync", JSON.stringify(payload));
        } else if (dispatcher.DispatchWindowEventAsync) {
            await dispatcher.DispatchWindowEventAsync(JSON.stringify(payload));
        }
    }
}

function resolveHostElement(elementId) {
    if (elementId instanceof HTMLElement) {
        return elementId;
    }

    const element = document.getElementById(elementId);
    if (!(element instanceof HTMLElement)) {
        throw new Error(`Element '${elementId}' was not found or is not an HTMLElement.`);
    }
    return element;
}

function findDotnetRuntime() {
    const getRuntime = globalThis.getDotnetRuntime;
    if (typeof getRuntime !== "function") {
        return null;
    }

    try {
        const runtime = getRuntime(0);
        if (runtime) {
            return runtime;
        }
    } catch {
    }

    const list = getRuntime.__list?.list;
    if (list && typeof list === "object") {
        for (const id of Object.keys(list)) {
            try {
                const runtime = getRuntime(id);
                if (runtime) {
                    return runtime;
                }
            } catch {
            }
        }
    }

    return null;
}

function parseOptions(options) {
    if (typeof options === "string") {
        return JSON.parse(options);
    }

    return options ?? {};
}

function normalizeSize(value, name) {
    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) {
        throw new Error(`Window ${name} must be a positive number.`);
    }
    return Math.floor(size);
}

function pointerButton(button) {
    switch (button) {
        case 0: return "left";
        case 1: return "middle";
        case 2: return "right";
        case 3: return "back";
        case 4: return "forward";
        default: return "other";
    }
}

function keyLocation(location) {
    switch (location) {
        case 1: return "left";
        case 2: return "right";
        case 3: return "numpad";
        default: return "standard";
    }
}

function modifiers(event) {
    return (event.shiftKey ? 1 : 0) |
        (event.ctrlKey ? 2 : 0) |
        (event.altKey ? 4 : 0) |
        (event.metaKey ? 8 : 0);
}

function shouldPreventBrowserKeyboardDefault(event) {
    if (event.defaultPrevented) return false;

    const key = String(event.key || "").toLowerCase();
    const code = String(event.code || "").toLowerCase();
    if (key === "backspace" || key === "delete" || code === "backspace" || code === "delete") {
        return true;
    }

    if (!event.ctrlKey && !event.metaKey) {
        return false;
    }

    const commandKey = key.length === 1 ? key : code.startsWith("key") ? code.slice(3) : code;
    switch (commandKey) {
        case "a":
        case "c":
        case "x":
        case "y":
        case "z":
            return true;
        default:
            return false;
    }
}

async function readClipboardText() {
    if (!navigator.clipboard?.readText) {
        return "";
    }

    try {
        return await navigator.clipboard.readText();
    } catch {
        return "";
    }
}

async function writeClipboardText(text) {
    if (!navigator.clipboard?.writeText) {
        return;
    }

    try {
        await navigator.clipboard.writeText(String(text ?? ""));
    } catch {
    }
}

function clampSize(value, min, max) {
    const number = Math.round(Number(value));
    const lower = Number.isFinite(min) ? min : 1;
    const upper = Number.isFinite(max) ? max : Number.POSITIVE_INFINITY;
    return Math.max(lower, Math.min(upper, Number.isFinite(number) ? number : lower));
}

function clampWindowY(value) {
    const number = Math.round(Number(value));
    return Math.max(0, Number.isFinite(number) ? number : 0);
}

function surfaceToCssSize(value, dpr, fallback) {
    if (value === null || value === undefined) return fallback;
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return fallback;
    return Math.max(1, Math.round(number / dpr));
}

function titleBarHeight() {
    return 28;
}

function collapsedTitleBarHeight() {
    return 4;
}

function decoratedTitleBarHeight(entry) {
    if (!entry.decorated) return 0;
    return entry.maximized ? collapsedTitleBarHeight() : titleBarHeight();
}

function canvasPoint(entry, event) {
    const rect = entry.canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? entry.canvas.width / rect.width : entry.dpr;
    const scaleY = rect.height > 0 ? entry.canvas.height / rect.height : entry.dpr;
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
    };
}

function ensureWindowStyles() {
    if (document.getElementById("alopex-application-webassembly-styles")) return;

    const style = document.createElement("style");
    style.id = "alopex-application-webassembly-styles";
    style.textContent = `
.alopex-web-window {
    box-sizing: border-box;
    background: #11131c;
    border: 1px solid #30364d;
    box-shadow: 0 18px 46px rgba(0, 0, 0, 0.32);
    overflow: hidden;
    transform-origin: top left;
}
.alopex-web-window-animating {
    transition:
        left 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
        top 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
        width 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
        height 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
        box-shadow 220ms ease,
        border-color 220ms ease;
}
.alopex-web-window-animating .alopex-web-window-content {
    transition: opacity 160ms ease;
    opacity: 0.92;
}
.alopex-web-window-titlebar {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    height: ${titleBarHeight()}px;
    padding: 0 6px 0 10px;
    color: #dbe3ff;
    background: #20253a;
    border-bottom: 1px solid #30364d;
    user-select: none;
    touch-action: none;
    cursor: move;
    font: 12px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    transition: height 140ms ease, opacity 120ms ease, transform 140ms ease, background-color 140ms ease;
    z-index: 2;
}
.alopex-web-window-maximized .alopex-web-window-titlebar {
    height: ${collapsedTitleBarHeight()}px;
    padding: 0;
    overflow: hidden;
    opacity: 0.72;
    background: #5d6fa4;
    border-bottom: 0;
    cursor: default;
}
.alopex-web-window-maximized .alopex-web-window-titlebar:hover {
    height: ${titleBarHeight()}px;
    padding: 0 6px 0 10px;
    overflow: visible;
    opacity: 1;
    background: #20253a;
    border-bottom: 1px solid #30364d;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
    cursor: default;
}
.alopex-web-window-maximized .alopex-web-window-titlebar:not(:hover) .alopex-web-window-title,
.alopex-web-window-maximized .alopex-web-window-titlebar:not(:hover) .alopex-web-window-buttons {
    opacity: 0;
    pointer-events: none;
}
.alopex-web-window-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: opacity 100ms ease;
}
.alopex-web-window-buttons {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 0 0 auto;
    transition: opacity 100ms ease;
}
.alopex-web-window-buttons button {
    box-sizing: border-box;
    width: 22px;
    height: 20px;
    border: 1px solid transparent;
    border-radius: 3px;
    color: #dbe3ff;
    background: transparent;
    font: 11px/18px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    padding: 0;
    cursor: default;
}
.alopex-web-window-buttons button:hover {
    background: #343b59;
    border-color: #4e5a82;
}
.alopex-web-window-buttons button:disabled {
    opacity: 0.38;
}
.alopex-web-window-close:hover {
    background: #8b2f3e !important;
    border-color: #c64e61 !important;
}
.alopex-web-window-content {
    position: relative;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
}
.alopex-window-surface,
.alopex-web-window canvas {
    max-width: none;
    max-height: none;
    outline: none;
}
.alopex-web-text-input {
    position: absolute;
    display: none;
    z-index: -1;
    opacity: 0;
    border: 0;
    padding: 0;
    margin: 0;
    resize: none;
    overflow: hidden;
    background: transparent;
    color: transparent;
    caret-color: transparent;
    outline: none;
}
.alopex-web-window-resize {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 18px;
    height: 18px;
    cursor: se-resize;
}
.alopex-web-window-resize::after {
    content: "";
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 8px;
    height: 8px;
    border-right: 2px solid #6f77a8;
    border-bottom: 2px solid #6f77a8;
}
`;
    document.head.appendChild(style);
}
