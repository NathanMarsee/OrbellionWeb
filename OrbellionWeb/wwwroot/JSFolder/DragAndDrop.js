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

                // clear any previous dropped flag
                if (event.target.__cardDroppedIntoZone) {
                    delete event.target.__cardDroppedIntoZone;
                }
            },
            move(event) {
                let x = (parseFloat(event.target.dataset.x) || 0) + event.dx;
                let y = (parseFloat(event.target.dataset.y) || 0) + event.dy;

                event.target.style.transform = `translate(${x}px, ${y}px)`;

                event.target.dataset.x = x;
                event.target.dataset.y = y;
            },
            // snap back into the .main area on drag end if any edge is hanging outside,
            // but skip snapping if the element was dropped into a dropzone (to avoid flicker)
            end(event) {
                const el = event.target;
                // If the element was dropped into a dropzone, avoid snapping back (prevents flicker)
                if (el && el.__cardDroppedIntoZone) {
                    // clear the flag so it doesn't affect future drags
                    delete el.__cardDroppedIntoZone;
                    return;
                }

                const main = document.querySelector('.main');
                if (!main || !el) return;

                // current stored translation
                let x = parseFloat(el.dataset.x) || 0;
                let y = parseFloat(el.dataset.y) || 0;

                const elRect = el.getBoundingClientRect();
                const mainRect = main.getBoundingClientRect();

                // compute required deltas to bring the element fully inside main
                let dx = 0;
                let dy = 0;

                if (elRect.left < mainRect.left) {
                    dx = mainRect.left - elRect.left;
                }
                if (elRect.right > mainRect.right) {
                    dx = mainRect.right - elRect.right;
                }
                if (elRect.top < mainRect.top) {
                    dy = mainRect.top - elRect.top;
                }
                if (elRect.bottom > mainRect.bottom) {
                    dy = mainRect.bottom - elRect.bottom;
                }

                // if any adjustment required, update translation instantly (no animation)
                if (dx !== 0 || dy !== 0) {
                    // ensure no transition so the move is immediate
                    el.style.transition = 'none';
                    x += dx;
                    y += dy;
                    el.style.transform = `translate(${x}px, ${y}px)`;
                    el.dataset.x = x;
                    el.dataset.y = y;
                }
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
                const relatedEl = event.relatedTarget;

                // Mark the dragged element as dropped into a dropzone so draggable end listener can skip snap.
                // Use a short-lived flag; Blazor/DOTNET removal will happen immediately in many cases.
                if (relatedEl) {
                    relatedEl.__cardDroppedIntoZone = true;
                    // Clear the flag shortly after to avoid stale state if element isn't removed
                    setTimeout(() => {
                        if (relatedEl && relatedEl.__cardDroppedIntoZone) {
                            delete relatedEl.__cardDroppedIntoZone;
                        }
                    }, 500);
                }

                const relatedId = relatedEl && relatedEl.id;
                // If there's a registered callback for this element, invoke it
                if (relatedId && window.__orbellionDropCallbacks && window.__orbellionDropCallbacks[relatedId]) {
                    try {
                        window.__orbellionDropCallbacks[relatedId].invokeMethodAsync('NotifyDropped', relatedId);
                    } catch (err) {
                        console.error('Error invoking dotnet callback on drop:', err);
                    }
                } else if (relatedEl) {
                    alert(relatedEl.id + ' was dropped into ' + event.target.id);
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