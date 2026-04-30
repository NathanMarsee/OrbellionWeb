// Scales element with given id to fill browser width while preserving 16:9.
// Usage from Blazor: JS.InvokeVoidAsync("scaleTo16by9", elementId, designWidth, designHeight)
window.scaleTo16by9 = (elementId, designWidth, designHeight) => {
    const el = document.getElementById(elementId);
    if (!el) return;

    // remove any previous listener
    if (el._scaleTo16by9Listener) {
        window.removeEventListener('resize', el._scaleTo16by9Listener);
        delete el._scaleTo16by9Listener;
    }

    const apply = () => {
        // scale based on width so content fills the viewport width
        const scale = window.innerWidth / designWidth;
        el.style.transform = `scale(${scale})`;
        el.style.transformOrigin = 'top left';
    };

    // throttle via rAF for smooth resizing
    let rafId = null;
    const listener = () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            apply();
            rafId = null;
        });
    };

    el._scaleTo16by9Listener = listener;
    window.addEventListener('resize', listener);

    // initial apply
    apply();
};

window.scaleTo16by9Dispose = (elementId) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (el._scaleTo16by9Listener) {
        window.removeEventListener('resize', el._scaleTo16by9Listener);
        delete el._scaleTo16by9Listener;
    }
    // clear transform if you want
    el.style.transform = '';
};