// Scales element with given id to fit inside the available space of a viewport element
// Usage from Blazor:
//   JS.InvokeVoidAsync("scaleToFit", "scaled-content", designWidth, designHeight, "scaled-viewport")
window.scaleToFit = (elementId, designWidth, designHeight, viewportId) => {
    const el = document.getElementById(elementId);
    const viewport = viewportId ? document.getElementById(viewportId) : document.documentElement;
    if (!el || !viewport) return;

    // dispose any existing observer/listener attached to this element
    if (el._scaleToFitDispose) {
        el._scaleToFitDispose();
        delete el._scaleToFitDispose;
    }

    const apply = () => {
        // measure the viewport element so sibling elements (sidebar) are excluded
        const rect = viewport.getBoundingClientRect();
        const availableWidth = Math.max(0, rect.width);
        const availableHeight = Math.max(0, rect.height);

        // choose the smaller scale to preserve aspect ratio; allow scale > 1 so content grows on large displays
        const scale = Math.min(availableWidth / designWidth, availableHeight / designHeight);

        el.style.transform = `scale(${scale})`;
        el.style.transformOrigin = 'top left';
    };

    // Try ResizeObserver for element-level observations; fallback to window resize
    let ro = null;
    let resizeHandler = null;

    if (window.ResizeObserver) {
        ro = new ResizeObserver(() => {
            if (el._scaleToFitRaf) cancelAnimationFrame(el._scaleToFitRaf);
            el._scaleToFitRaf = requestAnimationFrame(() => {
                apply();
                el._scaleToFitRaf = null;
            });
        });
        // observe the viewport element (so changes to its size trigger scaling)
        ro.observe(viewport);
    } else {
        resizeHandler = () => {
            if (el._scaleToFitRaf) cancelAnimationFrame(el._scaleToFitRaf);
            el._scaleToFitRaf = requestAnimationFrame(() => {
                apply();
                el._scaleToFitRaf = null;
            });
        };
        window.addEventListener('resize', resizeHandler);
    }

    el._scaleToFitDispose = () => {
        if (ro) ro.disconnect();
        if (resizeHandler) window.removeEventListener('resize', resizeHandler);
        if (el._scaleToFitRaf) {
            cancelAnimationFrame(el._scaleToFitRaf);
            el._scaleToFitRaf = null;
        }
        el.style.transform = '';
    };

    // initial apply
    apply();
};

window.scaleToFitDispose = (elementId) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (el._scaleToFitDispose) {
        el._scaleToFitDispose();
        delete el._scaleToFitDispose;
    }
};