// global storage for pending drop positions
window.__cardDropLocations = window.__cardDropLocations || {};

function clamp(v, a, b) {
    return Math.min(Math.max(v, a), b);
}

function dragAndDropBattlefield(className) {
    // global counter to ensure the most-recently-clicked item is on top
    window.__cardDragZIndex = window.__cardDragZIndex || 1000;

    interact(className).draggable({
        listeners: {
            start(event) {
                // Ensure element has a non-static position so z-index works
                const computed = window.getComputedStyle(event.target);
                if (computed.position === 'static') {
                    event.target.style.position = 'relative';
                }

                // Bring this element to front by incrementing the global z-index counter
                window.__cardDragZIndex += 1;
                event.target.style.zIndex = window.__cardDragZIndex;

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

                const battlefield = document.querySelector('.battlefield');
                if (!battlefield || !el) return;

                // current stored translation
                let x = parseFloat(el.dataset.x) || 0;
                let y = parseFloat(el.dataset.y) || 0;

                const elRect = el.getBoundingClientRect();
                const battlefieldRect = battlefield.getBoundingClientRect();

                // compute required deltas to bring the element fully inside main
                let dx = 0;
                let dy = 0;

                if (elRect.left < battlefieldRect.left) {
                    dx = battlefieldRect.left - elRect.left;
                }
                if (elRect.right > battlefieldRect.right) {
                    dx = battlefieldRect.right - elRect.right;
                }
                if (elRect.top < battlefieldRect.top) {
                    dy = battlefieldRect.top - elRect.top;
                }
                if (elRect.bottom > battlefieldRect.bottom) {
                    dy = battlefieldRect.bottom - elRect.bottom;
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

function dragAndDropHand(className) {
    interact(className).draggable({
        listeners: {
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
            }
        }
    });
}

function dropZoneHand(dropTarget) {
    interact(dropTarget)
        .dropzone({
            ondrop: function (event) {
                const relatedEl = event.relatedTarget;
                if (relatedEl.classList.contains("battlefieldCard")) {
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

                    // capture the drop pointer coordinates (try multiple event shapes)
                    const dragEvent = event.dragEvent || {};
                    const client = dragEvent.client || {};
                    const clientX = (client.x !== undefined) ? client.x : (dragEvent.clientX !== undefined ? dragEvent.clientX : (event.clientX || 0));
                    const clientY = (client.y !== undefined) ? client.y : (dragEvent.clientY !== undefined ? dragEvent.clientY : (event.clientY || 0));

                    const relatedId = relatedEl && relatedEl.id;
                    // store coordinates for the card id so newly-rendered component can pick them up
                    if (relatedId) {
                        window.__cardDropLocations = window.__cardDropLocations || {};
                        window.__cardDropLocations[relatedId] = { clientX: clientX, clientY: clientY, time: Date.now() };
                    }

                    // If there's a registered callback for this element, invoke it
                    if (relatedId && window.__cardDropCallbacks && window.__cardDropCallbacks[relatedId]) {
                        try {
                            window.__cardDropCallbacks[relatedId].invokeMethodAsync('NotifyDropped', relatedId);
                        } catch (err) {
                            console.error('Error invoking dotnet callback on drop:', err);
                        }
                    } else if (relatedEl) {
                        alert(relatedEl.id + ' was dropped into ' + event.target.id);
                    }
                }
            }
        })
        .on('dropactivate', function (event) {
            event.target.classList.add('drop-activated')
        })
}
function dropZoneBattlefield(dropTarget) {
    interact(dropTarget)
        .dropzone({
            ondrop: function (event) {
                const relatedEl = event.relatedTarget;
                if (relatedEl.classList.contains("handCard")) {
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

                    // capture the drop pointer coordinates (try multiple event shapes)
                    const dragEvent = event.dragEvent || {};
                    const client = dragEvent.client || {};
                    const clientX = (client.x !== undefined) ? client.x : (dragEvent.clientX !== undefined ? dragEvent.clientX : (event.clientX || 0));
                    const clientY = (client.y !== undefined) ? client.y : (dragEvent.clientY !== undefined ? dragEvent.clientY : (event.clientY || 0));

                    const relatedId = relatedEl && relatedEl.id;
                    // store coordinates for the card id so newly-rendered component can pick them up
                    if (relatedId) {
                        window.__cardDropLocations = window.__cardDropLocations || {};
                        window.__cardDropLocations[relatedId] = { clientX: clientX, clientY: clientY, time: Date.now() };
                    }

                    // If there's a registered callback for this element, invoke it
                    if (relatedId && window.__cardDropCallbacks && window.__cardDropCallbacks[relatedId]) {
                        try {
                            window.__cardDropCallbacks[relatedId].invokeMethodAsync('NotifyDropped', relatedId);
                        } catch (err) {
                            console.error('Error invoking dotnet callback on drop:', err);
                        }
                    } else if (relatedEl) {
                        alert(relatedEl.id + ' was dropped into ' + event.target.id);
                    }
                }
            }
        })
        .on('dropactivate', function (event) {
            event.target.classList.add('drop-activated')
        })
}

// register a DotNet callback for a specific card element
function registerDropHandler(el, dotNetRef) {
    window.__cardDropCallbacks = window.__cardDropCallbacks || {};
    if (!el) return;
    // Ensure element has an id so we can map callbacks by id
    if (!el.id) {
        el.id = 'card-' + Math.random().toString(36).substr(2, 9);
    }
    window.__cardDropCallbacks[el.id] = dotNetRef;
}

// unregister previously-registered callback for an element
function unregisterDropHandler(el) {
    if (!window.__cardDropCallbacks) return;
    if (!el) return;
    const id = el.id;
    if (!id) return;
    delete window.__cardDropCallbacks[id];
}

// Call this from Blazor to put a newly-created element on top
window.bringElementToFront = function (el) {
    if (!el) return;
    window.__cardDragZIndex = window.__cardDragZIndex || 1000;

    const computed = window.getComputedStyle(el);
    if (computed.position === 'static') {
        el.style.position = 'relative';
    }

    window.__cardDragZIndex += 1;
    el.style.zIndex = window.__cardDragZIndex;
};

// Try to apply a previously-stored drop position to a newly-rendered element.
// Returns true if applied, false otherwise.
window.tryApplyDropPosition = function (el, id) {
    if (!el || !id) return false;
    if (!window.__cardDropLocations || !window.__cardDropLocations[id]) return false;

    try {
        const loc = window.__cardDropLocations[id];
        // remove stored location immediately so it doesn't get reused
        delete window.__cardDropLocations[id];

        // discard very stale locations (2s)
        if (Date.now() - loc.time > 2000) {
            return false;
        }

        const clientX = loc.clientX || 0;
        const clientY = loc.clientY || 0;

        // find the element's offset parent / containing dropzone -- usually parentElement
        const container = el.parentElement || document.body;
        const containerRect = container.getBoundingClientRect();

        // center the element under the cursor
        let desiredLeft = clientX - containerRect.left - (el.offsetWidth / 2);
        let desiredTop = clientY - containerRect.top - (el.offsetHeight / 2);

        // clamp to ensure the element fully fits within the container bounds
        const minLeft = 0;
        const maxLeft = Math.max(0, containerRect.width - el.offsetWidth);
        const minTop = 0;
        const maxTop = Math.max(0, containerRect.height - el.offsetHeight);

        desiredLeft = clamp(desiredLeft, minLeft, maxLeft);
        desiredTop = clamp(desiredTop, minTop, maxTop);

        // ensure the element has a dataset for future dragging
        el.dataset.x = desiredLeft;
        el.dataset.y = desiredTop;

        // ensure element is positioned such that transform works predictably
        const computed = window.getComputedStyle(el);
        if (computed.position === 'static') {
            el.style.position = 'relative';
        }

        // apply transform immediately (no animation)
        el.style.transition = 'none';
        el.style.transform = `translate(${desiredLeft}px, ${desiredTop}px)`;

        // make element visible in case it was rendered hidden
        el.style.visibility = 'visible';

        return true;
    } catch (err) {
        console.error('Error applying stored drop position:', err);
        return false;
    }
};