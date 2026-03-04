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
                if (event.target.dataset.x === undefined) event.target.dataset.x = 0;
                if (event.target.dataset.y === undefined) event.target.dataset.y = 0;
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
                elementRect: { left: 0, right: 1, top: 0, bottom: 0 },
                endOnly: true
            })
        ]
    });
}

function dropZone(dropTarget) {
    interact(dropTarget)
        .dropzone({
            ondrop: function (event) {
                const relatedId = event.relatedTarget.id;
                // If there's a registered callback for this element, invoke it
                if (window.__orbellionDropCallbacks && window.__orbellionDropCallbacks[relatedId]) {
                    try {
                        window.__orbellionDropCallbacks[relatedId].invokeMethodAsync('NotifyDropped', relatedId);
                    } catch (err) {
                        console.error('Error invoking dotnet callback on drop:', err);
                    }
                } else {
                    alert(event.relatedTarget.id + ' was dropped into ' + event.target.id)
                }
            }
        })
        .on('dropactivate', function (event) {
            event.target.classList.add('drop-activated')
        })
}

// register a DotNet callback for a specific card element
function registerDropHandler(el, dotNetRef) {
    window.__orbellionDropCallbacks = window.__orbellionDropCallbacks || {};
    if (!el) return;
    // Ensure element has an id so we can map callbacks by id
    if (!el.id) {
        el.id = 'card-' + Math.random().toString(36).substr(2, 9);
    }
    window.__orbellionDropCallbacks[el.id] = dotNetRef;
}

// unregister previously-registered callback for an element
function unregisterDropHandler(el) {
    if (!window.__orbellionDropCallbacks) return;
    if (!el) return;
    const id = el.id;
    if (!id) return;
    delete window.__orbellionDropCallbacks[id];
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