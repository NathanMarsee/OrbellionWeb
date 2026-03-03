function dragAndDrop(className) {
    // global counter to ensure the most-recently-clicked item is on top
    window.__orbellionDragZIndex = window.__orbellionDragZIndex || 1000;

    interact(className).draggable({
        listeners: {
            start(event) {
                // Ensure element has a non-static position so z-index works
                const computed = window.getComputedStyle(event.target);
                if (computed.position === 'static') {
                    event.target.style.position = 'relative';
                }

                // Bring this element to front by incrementing the global z-index counter
                window.__orbellionDragZIndex += 1;
                event.target.style.zIndex = window.__orbellionDragZIndex;

                // Initialize per-element position if missing
                if (!event.target.dataset.x) event.target.dataset.x = 0;
                if (!event.target.dataset.y) event.target.dataset.y = 0;
            },
            move(event) {
                let x = (parseFloat(event.target.dataset.x) || 0) + event.dx;
                let y = (parseFloat(event.target.dataset.y) || 0) + event.dy;

                event.target.style.transform = `translate(${x}px, ${y}px)`;

                event.target.dataset.x = x;
                event.target.dataset.y = y;
            }
        },
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: '.main',
                endOnly: true
            })
        ]
    });
}

// Call this from Blazor to put a newly-created element on top
window.bringElementToFront = function (el) {
    if (!el) return;
    window.__orbellionDragZIndex = window.__orbellionDragZIndex || 1000;

    const computed = window.getComputedStyle(el);
    if (computed.position === 'static') {
        el.style.position = 'relative';
    }

    window.__orbellionDragZIndex += 1;
    el.style.zIndex = window.__orbellionDragZIndex;
};
