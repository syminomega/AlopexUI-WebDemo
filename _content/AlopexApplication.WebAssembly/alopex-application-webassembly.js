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
        wakeUp: () => defaultHost.wakeUp(),
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
        setMenuBar: (windowId, menuJson) => defaultHost.setMenuBar(windowId, menuJson),
        showContextMenu: (windowId, menuJson, x, y) => defaultHost.showContextMenu(windowId, menuJson, x, y),
        setMinSurfaceSize: (windowId, hasSize, width, height) => defaultHost.setMinSurfaceSize(windowId, hasSize, width, height),
        setMaxSurfaceSize: (windowId, hasSize, width, height) => defaultHost.setMaxSurfaceSize(windowId, hasSize, width, height),
        enableTextInput: (windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex) =>
            defaultHost.enableTextInput(windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex),
        updateTextInput: (windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex) =>
            defaultHost.updateTextInput(windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex),
        disableTextInput: (windowId) => defaultHost.disableTextInput(windowId),
        readClipboardText: () => readClipboardText(),
        writeClipboardText: (text) => writeClipboardText(text),
        getPreferredLanguage: () => getPreferredLanguage(),
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

    // Prefer source-generated JS imports/exports when they are available. Blazor Server-like
    // paths fall back to DotNetObjectReference below, which still uses JSON for events.
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
        wakeUp: () => host.wakeUp(),
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
        setMenuBar: (windowId, menuJson) => host.setMenuBar(windowId, menuJson),
        showContextMenu: (windowId, menuJson, x, y) => host.showContextMenu(windowId, menuJson, x, y),
        setMinSurfaceSize: (windowId, hasSize, width, height) => host.setMinSurfaceSize(windowId, hasSize, width, height),
        setMaxSurfaceSize: (windowId, hasSize, width, height) => host.setMaxSurfaceSize(windowId, hasSize, width, height),
        enableTextInput: (windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex) =>
            host.enableTextInput(windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex),
        updateTextInput: (windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex) =>
            host.updateTextInput(windowId, caretX, caretY, caretWidth, caretHeight, surroundingText, cursorByteIndex, anchorByteIndex),
        disableTextInput: (windowId) => host.disableTextInput(windowId),
        getPreferredLanguage: () => getPreferredLanguage(),
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
        this.wakeScheduled = false;
        this.pendingPointerMoves = new Map();
        this.pointerMoveFlushScheduled = false;
        this.pointerMoveFlushInProgress = false;
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
        const ownerId = normalizeOwnerWindowId(options.ownerWindowId ?? options.OwnerWindowId);

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

        const menubar = document.createElement("div");
        menubar.className = "alopex-web-window-menubar";
        menubar.style.display = "none";
        titlebar.appendChild(menubar);

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
            menubar,
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
            ownerId,
            hiddenByOwner: false,
            enabledButtons,
            menuBar: null,
            activeMenuPopup: null,
            titlebarExpanded: false,
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
            activeTouches: new Map(),
            lastPinchDistance: 0,
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
        this.observeSurface(entry);
        return {
            windowId: id.toString(),
            canvasId: canvas.id,
            width: entry.width,
            height: entry.height,
            scaleFactor: entry.dpr,
            title,
            x: entry.x,
            y: entry.y,
            surfaceX: entry.x,
            surfaceY: entry.y + decoratedChromeHeight(entry),
            resizable: entry.resizable,
            maximized: entry.maximized,
            minimized: entry.minimized,
            visible: entry.visible,
            decorated: entry.decorated,
            windowLevel: entry.windowLevel,
            ownerWindowId: entry.ownerId ? Number(entry.ownerId) : null,
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
        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", resize);
            this.disposers.push(() => window.visualViewport.removeEventListener("resize", resize));
        }
        this.watchDevicePixelRatio(resize);
    }

    stop() {
        this.started = false;
        this.pendingRedraws.clear();
        this.wakeScheduled = false;
        this.pendingPointerMoves.clear();
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
        if (!entry) {
            const removed = removeWindowFramesById(key);
            this.pendingRedraws.delete(key);
            this.pendingPointerMoves.delete(key);
            this.activePointerCapture.delete(key);
            return removed > 0;
        }

        for (const child of this.getOwnedWindows(entry)) {
            this.destroyWindow(child.id);
        }

        this.closeMenuPopup(entry);
        this.windows.delete(key);
        const removed = removeWindowFramesById(key);
        this.dispatchWindowEvent(entry, { kind: "destroyed" });
        return removed > 0;
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

            const pending = [...this.pendingRedraws];
            this.pendingRedraws.clear();
            await this.dispatchAboutToWait();
            for (const id of pending) {
                const entry = this.windows.get(id);
                if (entry) {
                    await this.dispatchWindowEvent(entry, { kind: "redraw-requested" });
                }
            }
        });
    }

    wakeUp() {
        if (!this.started || this.wakeScheduled) return;

        this.wakeScheduled = true;
        queueMicrotask(async () => {
            this.wakeScheduled = false;
            if (!this.started) return;

            await this.dispatchProxyWakeUp();
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
            this.setTitlebarExpanded(entry, false, false);
            entry.maximized = true;
            entry.minimized = false;
            entry.frame.classList.add("alopex-web-window-maximized");
            entry.frame.style.display = "grid";
            this.applyMaximizedRect(entry);
        } else {
            entry.maximized = false;
            entry.frame.classList.remove("alopex-web-window-maximized");
            this.setTitlebarExpanded(entry, false, false);
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

        entry.minimized = Boolean(minimized);
        entry.content.style.display = entry.minimized ? "none" : "";
        entry.resizeHandle.style.display = entry.minimized || !entry.resizable ? "none" : "";
        applyWindowLayout(entry);
        this.setOwnedWindowsHidden(entry, entry.minimized || !entry.visible);
        if (!entry.minimized) {
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
        this.setOwnedWindowsHidden(entry, !entry.visible || entry.minimized);
        if (entry.visible) {
            this.requestRedraw(entry.id);
        }
        this.dispatchStateChanged(entry);
    }

    setDecorations(windowId, decorated) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        entry.decorated = Boolean(decorated);
        if (!entry.decorated) {
            this.setTitlebarExpanded(entry, false, false);
        }
        entry.titlebar.style.display = entry.decorated ? "" : "none";
        applyWindowLayout(entry);
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
        for (const child of this.getOwnedWindows(entry)) {
            if (!child.visible || child.hiddenByOwner) continue;
            child.zOrder = ++this.zOrderCounter;
            this.applyWindowZIndex(child);
        }
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

    getOwnedWindows(owner) {
        const ownerId = owner.id.toString();
        return [...this.windows.values()].filter(entry => entry.ownerId === ownerId);
    }

    setOwnedWindowsHidden(owner, hidden) {
        for (const child of this.getOwnedWindows(owner)) {
            child.hiddenByOwner = Boolean(hidden);
            child.frame.style.display = hidden || !child.visible ? "none" : "grid";
            if (!hidden && child.visible) {
                this.requestRedraw(child.id);
            }
            this.setOwnedWindowsHidden(child, hidden || child.minimized || !child.visible);
        }
    }

    setEnabledButtons(windowId, buttons) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        entry.enabledButtons = Number(buttons) & 7;
        this.applyEnabledButtons(entry);
        this.dispatchStateChanged(entry);
    }

    setMenuBar(windowId, menuJson) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        entry.menuBar = parseMenu(menuJson);
        this.renderMenuBar(entry);
        entry.frame.classList.toggle("alopex-web-window-has-menu", hasMenuBar(entry));
        applyWindowLayout(entry);
        this.requestRedraw(entry.id);
    }

    showContextMenu(windowId, menuJson, x, y) {
        const entry = this.windows.get(windowId.toString());
        if (!entry) return;
        const menu = parseMenu(menuJson);
        this.closeMenuPopup(entry);
        const point = surfaceToWindowCssPoint(entry, x, y);
        this.openMenuPopup(entry, menu.items, point.x, point.y, true);
    }

    renderMenuBar(entry) {
        entry.menubar.replaceChildren();
        this.closeMenuPopup(entry);
        const items = entry.menuBar?.items ?? [];
        for (const item of items) {
            if (item.kind === "separator") continue;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "alopex-web-menu-root";
            button.textContent = item.text ?? "";
            button.disabled = item.enabled === false;
            button.addEventListener("pointerdown", event => {
                event.preventDefault();
                event.stopPropagation();
            });
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                if (button.disabled) return;
                if (item.kind === "command") {
                    this.dispatchMenuCommand(entry, item.id);
                    return;
                }

                const rect = button.getBoundingClientRect();
                const frameRect = entry.frame.getBoundingClientRect();
                this.openMenuPopup(entry, item.items ?? [], rect.left - frameRect.left, rect.bottom - frameRect.top, false);
            });
            entry.menubar.appendChild(button);
        }
    }

    openMenuPopup(entry, items, x, y, contextMenu) {
        this.closeMenuPopup(entry);
        if (!Array.isArray(items) || items.length === 0) return;

        const popup = document.createElement("div");
        popup.className = "alopex-web-menu-popup";
        if (contextMenu) popup.classList.add("alopex-web-context-menu");
        popup.style.left = `${Math.max(0, Math.round(Number(x) || 0))}px`;
        popup.style.top = `${Math.max(0, Math.round(Number(y) || 0))}px`;

        for (const item of items) {
            popup.appendChild(this.createMenuPopupItem(entry, item));
        }

        entry.frame.appendChild(popup);
        entry.activeMenuPopup = popup;
        requestAnimationFrame(() => clampPopupToFrame(entry, popup));

        const close = event => {
            if (popup.contains(event.target)) return;
            this.closeMenuPopup(entry);
            document.removeEventListener("pointerdown", close, true);
            document.removeEventListener("keydown", keyClose, true);
        };
        const keyClose = event => {
            if (event.key !== "Escape") return;
            this.closeMenuPopup(entry);
            document.removeEventListener("pointerdown", close, true);
            document.removeEventListener("keydown", keyClose, true);
        };
        setTimeout(() => {
            document.addEventListener("pointerdown", close, true);
            document.addEventListener("keydown", keyClose, true);
        }, 0);
    }

    createMenuPopupItem(entry, item) {
        if (item.kind === "separator") {
            const separator = document.createElement("div");
            separator.className = "alopex-web-menu-separator";
            return separator;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "alopex-web-menu-item";
        button.disabled = item.enabled === false;

        const label = document.createElement("span");
        label.className = "alopex-web-menu-label";
        label.textContent = `${item.checked ? "✓ " : ""}${item.text ?? ""}`;
        button.appendChild(label);

        if (item.shortcutText) {
            const shortcut = document.createElement("span");
            shortcut.className = "alopex-web-menu-shortcut";
            shortcut.textContent = item.shortcutText;
            button.appendChild(shortcut);
        }

        if (item.kind === "submenu") {
            const arrow = document.createElement("span");
            arrow.className = "alopex-web-menu-arrow";
            arrow.textContent = ">";
            button.appendChild(arrow);
        }

        button.addEventListener("pointerdown", event => {
            event.preventDefault();
            event.stopPropagation();
        });
        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            if (button.disabled) return;
            if (item.kind === "submenu") {
                const rect = button.getBoundingClientRect();
                const frameRect = entry.frame.getBoundingClientRect();
                this.openMenuPopup(entry, item.items ?? [], rect.right - frameRect.left - 4, rect.top - frameRect.top, false);
                return;
            }

            this.dispatchMenuCommand(entry, item.id);
            this.closeMenuPopup(entry);
        });

        return button;
    }

    closeMenuPopup(entry) {
        if (!entry?.activeMenuPopup) return;
        entry.activeMenuPopup.remove();
        entry.activeMenuPopup = null;
    }

    setTitlebarExpanded(entry, expanded) {
        const shouldExpand = Boolean(expanded && entry.maximized && entry.decorated);
        if (entry.titlebarExpanded === shouldExpand) return;

        entry.titlebarExpanded = shouldExpand;
        entry.frame.classList.toggle("alopex-web-window-titlebar-expanded", shouldExpand);
    }

    async dispatchMenuCommand(entry, commandId) {
        if (!commandId) return;
        const dispatcher = this.eventTarget ?? this.getEventDispatcher?.();
        if (!dispatcher) return;

        const payload = {
            windowId: Number(entry.id),
            commandId: String(commandId),
        };

        if (dispatcher.invokeMethodAsync) {
            await dispatcher.invokeMethodAsync("DispatchMenuCommandJsonAsync", JSON.stringify(payload));
        } else if (dispatcher.DispatchMenuCommandAsync) {
            await dispatcher.DispatchMenuCommandAsync(JSON.stringify(payload));
        }
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
        const point = surfaceToContentCssPoint(entry, caretX, caretY);
        const size = surfaceToWindowCssSize(entry, caretWidth, caretHeight);
        input.style.display = "block";
        input.style.left = `${Math.max(0, point.x)}px`;
        input.style.top = `${Math.max(0, point.y)}px`;
        input.style.width = `${Math.max(1, size.width)}px`;
        input.style.height = `${Math.max(16, size.height)}px`;
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
        on(canvas, "pointermove", event => this.queuePointerMove(entry, event));
        on(canvas, "pointerdown", event => {
            canvas.focus();
            // Browser-level capture keeps drag events flowing after the pointer leaves the
            // canvas; AlopexUI still decides which element owns the captured drag.
            trySetPointerCapture(canvas, event.pointerId);
            this.updateTouchPinch(entry, event, "started");
            this.dispatchPointer(entry, event, "pointer-button", "pressed");
        });
        on(canvas, "pointerup", event => {
            this.dropPendingPointerMove(entry, event.pointerId);
            tryReleasePointerCapture(canvas, event.pointerId);
            this.finishTouchPinch(entry, event);
            this.dispatchPointer(entry, event, "pointer-button", "released");
        });
        on(canvas, "pointercancel", event => {
            this.dropPendingPointerMove(entry, event.pointerId);
            tryReleasePointerCapture(canvas, event.pointerId);
            this.finishTouchPinch(entry, event);
        });
        on(canvas, "contextmenu", event => event.preventDefault());
        on(canvas, "wheel", event => {
            event.preventDefault();
            const point = canvasPoint(entry, event);
            if (event.ctrlKey) {
                this.dispatchWindowEvent(entry, {
                    kind: "pinch-gesture",
                    x: point.x,
                    y: point.y,
                    gestureDelta: -event.deltaY / 100,
                    gesturePhase: 1,
                    modifiers: modifiers(event),
                });
                return;
            }

            this.dispatchWindowEvent(entry, {
                kind: "mouse-wheel",
                x: point.x,
                y: point.y,
                wheelX: -event.deltaX,
                wheelY: -event.deltaY,
                modifiers: modifiers(event),
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

        titlebar.addEventListener("mouseenter", () => {
            this.setTitlebarExpanded(entry, true);
        });

        titlebar.addEventListener("mouseleave", () => {
            this.setTitlebarExpanded(entry, false);
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
        await this.dispatchWindowEvent(entry, this.createPointerPayload(entry, event, kind, state));
    }

    createPointerPayload(entry, event, kind, state = "pressed") {
        const point = canvasPoint(entry, event);
        return {
            kind,
            x: point.x,
            y: point.y,
            pointerId: event.pointerId ?? -1,
            pointerType: event.pointerType ?? "mouse",
            isPrimary: event.isPrimary ?? true,
            button: pointerButton(event.button),
            state,
            modifiers: modifiers(event),
        };
    }

    updateTouchPinch(entry, event, phaseName) {
        if (event.pointerType !== "touch") {
            return;
        }

        const point = canvasPoint(entry, event);
        entry.activeTouches.set(event.pointerId, point);
        if (entry.activeTouches.size !== 2) {
            entry.lastPinchDistance = 0;
            return;
        }

        const touches = [...entry.activeTouches.values()];
        const distance = Math.hypot(touches[0].x - touches[1].x, touches[0].y - touches[1].y);
        const center = {
            x: (touches[0].x + touches[1].x) / 2,
            y: (touches[0].y + touches[1].y) / 2,
        };

        if (entry.lastPinchDistance <= 0 || phaseName === "started") {
            entry.lastPinchDistance = distance;
            this.dispatchWindowEvent(entry, {
                kind: "pinch-gesture",
                x: center.x,
                y: center.y,
                gestureDelta: 0,
                gesturePhase: 0,
                modifiers: modifiers(event),
            });
            return;
        }

        if (distance <= 0) {
            return;
        }

        const delta = Math.log(distance / entry.lastPinchDistance);
        entry.lastPinchDistance = distance;
        if (Math.abs(delta) < 0.0001) {
            return;
        }

        this.dispatchWindowEvent(entry, {
            kind: "pinch-gesture",
            x: center.x,
            y: center.y,
            gestureDelta: delta,
            gesturePhase: 1,
            modifiers: modifiers(event),
        });
    }

    finishTouchPinch(entry, event) {
        if (event.pointerType !== "touch") {
            return;
        }

        const wasPinching = entry.activeTouches.size >= 2;
        const point = canvasPoint(entry, event);
        entry.activeTouches.delete(event.pointerId);
        if (wasPinching) {
            this.dispatchWindowEvent(entry, {
                kind: "pinch-gesture",
                x: point.x,
                y: point.y,
                gestureDelta: 0,
                gesturePhase: 2,
                modifiers: modifiers(event),
            });
        }

        if (entry.activeTouches.size < 2) {
            entry.lastPinchDistance = 0;
        }
    }

    queuePointerMove(entry, event) {
        if (!this.started) return;
        this.updateTouchPinch(entry, event, "moved");

        // Coalesce pointer moves per pointer before crossing into .NET. This reduces bridge
        // pressure during drags while preserving the most recent position for each pointer.
        this.pendingPointerMoves.set(pointerMoveKey(entry, event.pointerId), {
            entry,
            payload: this.createPointerPayload(entry, event, "pointer-moved"),
        });
        this.schedulePointerMoveFlush();
    }

    dropPendingPointerMove(entry, pointerId) {
        this.pendingPointerMoves.delete(pointerMoveKey(entry, pointerId));
    }

    schedulePointerMoveFlush() {
        if (this.pointerMoveFlushScheduled) return;

        this.pointerMoveFlushScheduled = true;
        queueMicrotask(() => {
            this.pointerMoveFlushScheduled = false;
            void this.flushPendingPointerMoves();
        });
    }

    flushPendingPointerMoves() {
        if (this.pointerMoveFlushInProgress || !this.started || this.pendingPointerMoves.size === 0) {
            return;
        }

        this.pointerMoveFlushInProgress = true;
        const pending = [...this.pendingPointerMoves.values()];
        this.pendingPointerMoves.clear();

        const run = async () => {
            try {
                for (const { entry, payload } of pending) {
                    if (this.windows.get(entry.id.toString()) === entry) {
                        await this.dispatchWindowEvent(entry, payload);
                    }
                }
            } finally {
                this.pointerMoveFlushInProgress = false;
                if (this.pendingPointerMoves.size > 0) {
                    this.schedulePointerMoveFlush();
                }
            }
        };

        void run();
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
        for (const entry of this.windows.values()) {
            if (entry.maximized) {
                this.applyMaximizedRect(entry);
                continue;
            }

            if (this.syncSurfaceSize(entry)) {
                this.dispatchResize(entry);
                this.requestRedraw(entry.id);
            }
        }
    }

    resizeEntry(entry, contentCssWidth, contentCssHeight, dispatch) {
        entry.contentCssWidth = clampSize(contentCssWidth, entry.minContentCssWidth, entry.maxContentCssWidth);
        entry.contentCssHeight = clampSize(contentCssHeight, entry.minContentCssHeight, entry.maxContentCssHeight);
        entry.frame.style.width = `${entry.contentCssWidth}px`;
        applyWindowLayout(entry);
        this.syncSurfaceSize(entry);
        if (dispatch) {
            this.dispatchResize(entry);
            this.requestRedraw(entry.id);
        }
    }

    applyMaximizedRect(entry, dispatch = true) {
        const rect = this.container.getBoundingClientRect();
        entry.x = 0;
        entry.y = 0;
        entry.frame.style.left = "0px";
        entry.frame.style.top = "0px";
        this.resizeEntry(
            entry,
            Math.max(entry.minContentCssWidth, Math.round(rect.width)),
            Math.max(entry.minContentCssHeight, Math.round(rect.height - decoratedChromeHeight(entry))),
            dispatch);
    }

    dispatchResize(entry) {
        this.dispatchWindowEvent(entry, { kind: "surface-resized" });
    }

    syncSurfaceSize(entry) {
        const dpr = window.devicePixelRatio || 1;
        const rect = entry.canvas.getBoundingClientRect();
        const cssWidth = rect.width > 0 ? rect.width : entry.contentCssWidth;
        const cssHeight = rect.height > 0 ? rect.height : entry.contentCssHeight;
        const width = Math.max(1, Math.round(cssWidth * dpr));
        const height = Math.max(1, Math.round(cssHeight * dpr));
        const changed = width !== entry.width || height !== entry.height || dpr !== entry.dpr ||
            entry.canvas.width !== width || entry.canvas.height !== height;

        entry.dpr = dpr;
        entry.width = width;
        entry.height = height;
        if (entry.canvas.width !== width) {
            entry.canvas.width = width;
        }
        if (entry.canvas.height !== height) {
            entry.canvas.height = height;
        }

        return changed;
    }

    observeSurface(entry) {
        if (typeof ResizeObserver !== "function") return;

        const windowId = entry.id.toString();
        const observer = new ResizeObserver(() => {
            if (!this.windows.has(windowId)) return;
            if (this.syncSurfaceSize(entry)) {
                this.dispatchResize(entry);
                this.requestRedraw(entry.id);
            }
        });
        observer.observe(entry.canvas);
        this.disposers.push(() => observer.disconnect());
    }

    watchDevicePixelRatio(callback) {
        if (typeof window.matchMedia !== "function") return;

        let disposeCurrent = null;
        const arm = () => {
            disposeCurrent?.();
            const dpr = window.devicePixelRatio || 1;
            const query = window.matchMedia(`(resolution: ${dpr}dppx)`);
            const changed = () => {
                callback();
                arm();
            };

            if (query.addEventListener) {
                query.addEventListener("change", changed);
                disposeCurrent = () => query.removeEventListener("change", changed);
            } else if (query.addListener) {
                query.addListener(changed);
                disposeCurrent = () => query.removeListener(changed);
            } else {
                disposeCurrent = null;
            }
        };

        arm();
        this.disposers.push(() => disposeCurrent?.());
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

    async dispatchProxyWakeUp() {
        const dispatcher = this.eventTarget ?? this.getEventDispatcher?.();
        if (!dispatcher) return;

        if (dispatcher.invokeMethodAsync) {
            await dispatcher.invokeMethodAsync("DispatchProxyWakeUpAsync");
        } else if (dispatcher.DispatchProxyWakeUpAsync) {
            await dispatcher.DispatchProxyWakeUpAsync();
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
            pointerKind: event.pointerKind ?? pointerKindValue(event.pointerType),
            isPrimary: event.isPrimary ?? true,
            button: event.button ?? "",
            state: event.state ?? "",
            wheelX: event.wheelX ?? 0,
            wheelY: event.wheelY ?? 0,
            gestureDelta: event.gestureDelta ?? 0,
            gesturePhase: event.gesturePhase ?? 1,
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

        if (await this.dispatchTypedWindowEvent(dispatcher, payload)) {
            return;
        }

        if (dispatcher.invokeMethodAsync) {
            await dispatcher.invokeMethodAsync("DispatchWindowEventJsonAsync", JSON.stringify(payload));
        } else if (dispatcher.DispatchWindowEventAsync) {
            await dispatcher.DispatchWindowEventAsync(JSON.stringify(payload));
        }
    }

    async dispatchTypedWindowEvent(dispatcher, payload) {
        const kind = windowEventKind(payload.kind);
        if (dispatcher.invokeMethodAsync) {
            return false;
        }

        // The direct JSExport path avoids JSON and uses only primitives that marshal cleanly
        // in WASM. The JSON path remains as a compatibility fallback for Blazor interop.
        const windowId = Number(payload.windowId);
        const width = payload.width | 0;
        const height = payload.height | 0;
        const scaleFactor = Number(payload.scaleFactor) || 1;
        const x = Number(payload.x) || 0;
        const y = Number(payload.y) || 0;
        const invoke = dispatcher.invokeMethodAsync
            ? (method, ...args) => dispatcher.invokeMethodAsync(method, ...args)
            : dispatcher.DispatchBasicWindowEventAsync ? (method, ...args) => dispatcher[method](...args) : null;

        if (!invoke || kind < 0) {
            return false;
        }

        switch (kind) {
            case 0:
            case 1:
            case 2:
            case 4:
            case 5:
                await invoke("DispatchBasicWindowEventAsync", kind, windowId, width, height, scaleFactor, x, y);
                return true;
            case 9:
            case 10:
            case 11:
            case 12:
                await invoke(
                    "DispatchPointerEventAsync",
                    kind,
                    windowId,
                    width,
                    height,
                    scaleFactor,
                    x,
                    y,
                    Number(payload.pointerId ?? -1),
                    payload.pointerKind ?? pointerKindValue(payload.pointerType),
                    Boolean(payload.isPrimary),
                    mouseButtonValue(payload.button),
                    elementStateValue(payload.state),
                    payload.modifiers | 0);
                return true;
            case 13:
                await invoke("DispatchWheelEventAsync", windowId, width, height, scaleFactor, x, y, Number(payload.wheelX) || 0, Number(payload.wheelY) || 0, payload.modifiers | 0);
                return true;
            case 26:
                await invoke("DispatchPinchGestureEventAsync", windowId, width, height, scaleFactor, x, y, Number(payload.gestureDelta) || 0, payload.gesturePhase | 0, payload.modifiers | 0);
                return true;
            case 14:
                await invoke(
                    "DispatchKeyboardEventAsync",
                    windowId,
                    width,
                    height,
                    scaleFactor,
                    String(payload.key ?? ""),
                    String(payload.code ?? ""),
                    String(payload.text ?? ""),
                    Boolean(payload.repeat),
                    elementStateValue(payload.state),
                    keyLocationValue(payload.location),
                    payload.modifiers | 0);
                return true;
            case 20:
                await invoke(
                    "DispatchWindowStateChangedAsync",
                    windowId,
                    width,
                    height,
                    scaleFactor,
                    x,
                    y,
                    Boolean(payload.resizable),
                    Boolean(payload.maximized),
                    Boolean(payload.minimized),
                    Boolean(payload.visible),
                    Boolean(payload.decorated),
                    windowLevel(payload.windowLevel),
                    Number(payload.enabledButtons ?? 7) | 0);
                return true;
            case 21:
            case 22:
            case 23:
            case 24:
            case 25:
                await invoke(
                    "DispatchImeEventAsync",
                    kind,
                    windowId,
                    width,
                    height,
                    scaleFactor,
                    String(payload.imeText ?? ""),
                    payload.imeCursorStartByte | 0,
                    payload.imeCursorEndByte | 0,
                    payload.imeDeleteBeforeBytes | 0,
                    payload.imeDeleteAfterBytes | 0);
                return true;
            default:
                return false;
        }
    }
}

function trySetPointerCapture(element, pointerId) {
    if (pointerId === undefined || typeof element.setPointerCapture !== "function") return;
    try {
        element.setPointerCapture(pointerId);
    } catch {
    }
}

function tryReleasePointerCapture(element, pointerId) {
    if (pointerId === undefined || typeof element.releasePointerCapture !== "function") return;
    try {
        element.releasePointerCapture(pointerId);
    } catch {
    }
}

function pointerMoveKey(entry, pointerId) {
    return `${entry.id}:${pointerId ?? -1}`;
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

function cssEscape(value) {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(value);
    }

    return String(value).replace(/["\\]/g, "\\$&");
}

function removeWindowFramesById(windowId) {
    const selector = `[data-alopex-window-id="${cssEscape(windowId)}"]`;
    let removed = 0;
    for (const frame of document.querySelectorAll(selector)) {
        frame.remove();
        removed++;
    }

    return removed;
}

function parseOptions(options) {
    if (typeof options === "string") {
        return JSON.parse(options);
    }

    return options ?? {};
}

function parseMenu(menu) {
    const value = typeof menu === "string" ? JSON.parse(menu || "{\"items\":[]}") : menu;
    return {
        items: Array.isArray(value?.items) ? value.items : [],
    };
}

function normalizeSize(value, name) {
    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) {
        throw new Error(`Window ${name} must be a positive number.`);
    }
    return Math.floor(size);
}

function normalizeOwnerWindowId(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const text = String(value);
    return text === "0" ? null : text;
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

function elementStateValue(state) {
    return state === "released" ? 1 : 0;
}

function pointerKindValue(type) {
    switch (type) {
        case "mouse": return 0;
        case "touch": return 1;
        case "pen": return 2;
        default: return 3;
    }
}

function mouseButtonValue(button) {
    switch (button) {
        case "left": return 0;
        case "right": return 1;
        case "middle": return 2;
        case "back": return 3;
        case "forward": return 4;
        default: return 255;
    }
}

function keyLocationValue(location) {
    switch (location) {
        case "left": return 1;
        case "right": return 2;
        case "numpad": return 3;
        default: return 0;
    }
}

function windowEventKind(kind) {
    switch (kind) {
        case "surface-resized": return 0;
        case "close-requested": return 1;
        case "destroyed": return 2;
        case "redraw-requested": return 4;
        case "moved": return 5;
        case "pointer-entered": return 9;
        case "pointer-left": return 10;
        case "pointer-moved": return 11;
        case "pointer-button": return 12;
        case "mouse-wheel": return 13;
        case "keyboard-input": return 14;
        case "window-state-changed": return 20;
        case "ime-enabled": return 21;
        case "ime-preedit": return 22;
        case "ime-commit": return 23;
        case "ime-delete-surrounding": return 24;
        case "ime-disabled": return 25;
        case "pinch-gesture": return 26;
        default: return -1;
    }
}

function windowLevel(level) {
    switch (level) {
        case "AlwaysOnBottom": return 0;
        case "AlwaysOnTop": return 2;
        default: return 1;
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

function getPreferredLanguage() {
    const htmlLanguage = document?.documentElement?.lang;
    if (typeof htmlLanguage === "string" && htmlLanguage.trim()) {
        return htmlLanguage.trim();
    }

    const navigatorLanguage = navigator?.language;
    if (typeof navigatorLanguage === "string" && navigatorLanguage.trim()) {
        return navigatorLanguage.trim();
    }

    const firstNavigatorLanguage = Array.isArray(navigator?.languages) ? navigator.languages[0] : null;
    return typeof firstNavigatorLanguage === "string" ? firstNavigatorLanguage : "";
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

function hasMenuBar(entry) {
    return entry.menuBar && Array.isArray(entry.menuBar.items) && entry.menuBar.items.length > 0;
}

function decoratedTitleBarHeight(entry) {
    if (!entry.decorated) return 0;
    return entry.maximized && !hasMenuBar(entry) ? collapsedTitleBarHeight() : titleBarHeight();
}

function decoratedChromeHeight(entry) {
    return decoratedTitleBarHeight(entry);
}

function applyWindowLayout(entry) {
    const titleHeight = decoratedTitleBarHeight(entry);
    const rows = [];
    if (titleHeight > 0) rows.push(`${titleHeight}px`);
    rows.push("1fr");
    entry.frame.style.gridTemplateRows = rows.join(" ");
    entry.frame.style.height = `${entry.contentCssHeight + titleHeight}px`;
    entry.menubar.style.display = hasMenuBar(entry) ? "" : "none";
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

function surfaceToWindowCssPoint(entry, x, y) {
    const point = surfaceToContentCssPoint(entry, x, y);
    return {
        x: point.x,
        y: Math.round(decoratedChromeHeight(entry) + point.y),
    };
}

function surfaceToContentCssPoint(entry, x, y) {
    const rect = entry.canvas.getBoundingClientRect();
    const cssWidth = rect.width > 0 ? rect.width : entry.contentCssWidth;
    const cssHeight = rect.height > 0 ? rect.height : entry.contentCssHeight;
    const scaleX = entry.width > 0 ? cssWidth / entry.width : 1 / entry.dpr;
    const scaleY = entry.height > 0 ? cssHeight / entry.height : 1 / entry.dpr;
    return {
        x: Math.round((Number(x) || 0) * scaleX),
        y: Math.round((Number(y) || 0) * scaleY),
    };
}

function surfaceToWindowCssSize(entry, width, height) {
    const rect = entry.canvas.getBoundingClientRect();
    const cssWidth = rect.width > 0 ? rect.width : entry.contentCssWidth;
    const cssHeight = rect.height > 0 ? rect.height : entry.contentCssHeight;
    const scaleX = entry.width > 0 ? cssWidth / entry.width : 1 / entry.dpr;
    const scaleY = entry.height > 0 ? cssHeight / entry.height : 1 / entry.dpr;
    return {
        width: Math.round((Number(width) || 0) * scaleX),
        height: Math.round((Number(height) || 0) * scaleY),
    };
}

function clampPopupToFrame(entry, popup) {
    const frameRect = entry.frame.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const currentLeft = parseFloat(popup.style.left) || 0;
    const currentTop = parseFloat(popup.style.top) || 0;
    const maxLeft = Math.max(0, frameRect.width - popupRect.width - 4);
    const maxTop = Math.max(0, frameRect.height - popupRect.height - 4);
    popup.style.left = `${Math.min(currentLeft, maxLeft)}px`;
    popup.style.top = `${Math.min(currentTop, maxTop)}px`;
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
.alopex-web-window-has-menu.alopex-web-window-maximized .alopex-web-window-titlebar,
.alopex-web-window-maximized .alopex-web-window-titlebar {
    height: ${collapsedTitleBarHeight()}px;
    padding: 0;
    overflow: hidden;
    opacity: 0.72;
    background: #5d6fa4;
    border-bottom: 0;
    cursor: default;
}
.alopex-web-window-has-menu.alopex-web-window-maximized .alopex-web-window-titlebar {
    height: ${titleBarHeight()}px;
    padding: 0 6px 0 10px;
    overflow: visible;
    opacity: 1;
    background: #20253a;
    border-bottom: 1px solid #30364d;
}
.alopex-web-window-maximized.alopex-web-window-titlebar-expanded .alopex-web-window-titlebar {
    height: ${titleBarHeight()}px;
    padding: 0 6px 0 10px;
    overflow: visible;
    opacity: 1;
    background: #20253a;
    border-bottom: 1px solid #30364d;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
    cursor: default;
    z-index: 5;
}
.alopex-web-window-maximized:not(.alopex-web-window-titlebar-expanded) .alopex-web-window-title,
.alopex-web-window-maximized:not(.alopex-web-window-titlebar-expanded) .alopex-web-window-buttons {
    opacity: 0;
    pointer-events: none;
}
.alopex-web-window-has-menu.alopex-web-window-maximized:not(.alopex-web-window-titlebar-expanded) .alopex-web-window-title {
    opacity: 1;
    pointer-events: auto;
}
.alopex-web-window-has-menu.alopex-web-window-maximized:not(.alopex-web-window-titlebar-expanded) .alopex-web-window-buttons {
    opacity: 0;
    pointer-events: none;
}
.alopex-web-window-has-menu.alopex-web-window-maximized.alopex-web-window-titlebar-expanded .alopex-web-window-buttons {
    opacity: 1;
    pointer-events: auto;
}
.alopex-web-window-title {
    flex: 0 1 auto;
    min-width: 80px;
    max-width: 34%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: opacity 100ms ease;
}
.alopex-web-window-menubar {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 2px;
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;
    padding: 1px 0;
    color: inherit;
    background: transparent;
    border-bottom: 0;
    font: 12px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    user-select: none;
    z-index: 2;
}
.alopex-web-menu-root {
    box-sizing: border-box;
    height: 22px;
    min-width: 44px;
    padding: 0 10px;
    border: 1px solid transparent;
    border-radius: 4px;
    color: inherit;
    background: transparent;
    font: inherit;
    text-align: center;
}
.alopex-web-menu-root:hover,
.alopex-web-menu-root:focus-visible {
    background: #28304a;
    border-color: #435078;
    outline: none;
}
.alopex-web-menu-root:disabled {
    opacity: 0.42;
}
.alopex-web-menu-popup {
    position: absolute;
    box-sizing: border-box;
    z-index: 20;
    min-width: 176px;
    max-width: 280px;
    padding: 5px;
    color: #edf2ff;
    background: #1b2032;
    border: 1px solid #3a4568;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.36);
    font: 12px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.alopex-web-context-menu {
    z-index: 25;
}
.alopex-web-menu-item {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 26px;
    padding: 0 8px;
    border: 0;
    border-radius: 4px;
    color: inherit;
    background: transparent;
    font: inherit;
    text-align: left;
}
.alopex-web-menu-item:hover,
.alopex-web-menu-item:focus-visible {
    background: #2b3656;
    outline: none;
}
.alopex-web-menu-item:disabled {
    opacity: 0.42;
}
.alopex-web-menu-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.alopex-web-menu-shortcut,
.alopex-web-menu-arrow {
    color: #aeb9dc;
    white-space: nowrap;
}
.alopex-web-menu-separator {
    height: 1px;
    margin: 5px 4px;
    background: #313a59;
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
