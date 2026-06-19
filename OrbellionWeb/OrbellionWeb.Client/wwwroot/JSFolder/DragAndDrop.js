// global storage for pending drop positions
window.__cardDropLocations = window.__cardDropLocations || {};

function clamp(v, a, b) {
    return Math.min(Math.max(v, a), b);
}

// Find the effective scale for an element by looking for the nearest .scaled-content ancestor.
// Returns 1 if no scale found or on error.
function getEffectiveScale(el) {
    try {
        let ancestor = el;
        while (ancestor) {
            if (ancestor.classList && ancestor.classList.contains('scaled-content')) break;
            ancestor = ancestor.parentElement;
        }
        if (!ancestor) return 1;
        const rect = ancestor.getBoundingClientRect();
        // layout (untransformed) width
        const layoutWidth = ancestor.offsetWidth || rect.width;
        if (!layoutWidth) return 1;
        const scale = rect.width / layoutWidth;
        if (!isFinite(scale) || scale <= 0) return 1;
        return scale;
    } catch (e) {
        console.error('getEffectiveScale error', e);
        return 1;
    }
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
                // compensate for parent scale so visual movement matches cursor
                const scale = getEffectiveScale(event.target) || 1;
                let dx = (parseFloat(event.target.dataset.x) || 0) + (event.dx / scale);
                let dy = (parseFloat(event.target.dataset.y) || 0) + (event.dy / scale);

                event.target.style.transform = `translate(${dx}px, ${dy}px)`;

                event.target.dataset.x = dx;
                event.target.dataset.y = dy;
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

                // current stored translation (in element coordinates)
                let x = parseFloat(el.dataset.x) || 0;
                let y = parseFloat(el.dataset.y) || 0;

                const elRect = el.getBoundingClientRect();
                const battlefieldRect = battlefield.getBoundingClientRect();

                // compute required deltas in client pixels to bring the element fully inside battlefield
                let dxClient = 0;
                let dyClient = 0;

                if (elRect.left < battlefieldRect.left) {
                    dxClient = battlefieldRect.left - elRect.left;
                }
                if (elRect.right > battlefieldRect.right) {
                    dxClient = battlefieldRect.right - elRect.right;
                }
                if (elRect.top < battlefieldRect.top) {
                    dyClient = battlefieldRect.top - elRect.top;
                }
                if (elRect.bottom > battlefieldRect.bottom) {
                    dyClient = battlefieldRect.bottom - elRect.bottom;
                }

                // if any adjustment required, update translation instantly (no animation)
                if (dxClient !== 0 || dyClient !== 0) {
                    const scale = getEffectiveScale(el) || 1;
                    // convert client-pixel correction to element coordinates (divide by scale)
                    const dxElem = dxClient / scale;
                    const dyElem = dyClient / scale;

                    // ensure no transition so the move is immediate
                    el.style.transition = 'none';
                    x += dxElem;
                    y += dyElem;
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

// Single simple dropzone function.
//
// Behavior:
// - Accepts any element that has the "card" class.
// - If the dragged card is being dropped into the same logical zone it came from
//   (determined by matching any dragged-class ending in "Card" to a target class/id/
///  'dropzone' + base), the drop is ignored.
// - Otherwise it marks the element as dropped, stores pointer coords for Blazor,
//   and invokes any registered DotNet callback (NotifyDropped).
function dropZone(dropTarget) {
    interact(dropTarget)
        .dropzone({
            ondrop: function (event) {
                const relatedEl = event.relatedTarget;
                if (!relatedEl) return;

                // only operate on elements that are "cards"
                if (!relatedEl.classList.contains('card')) return;

                const target = event.target;
                const targetClasses = Array.from(target.classList || []);
                const targetId = target.id || '';

                // determine if the card came from the same logical zone:
                // for each class on the dragged element that ends with "Card",
                // remove "Card" and check if the target has that base as a class,
                // has id equal to it, or has a 'dropzone' + base class (e.g. dropzonehand).
                const draggedClasses = Array.from(relatedEl.classList || []);
                for (const dc of draggedClasses) {
                    if (!dc.endsWith('Card')) continue;
                    const base = dc.slice(0, -4); // remove 'Card'
                    if (!base) continue;
                    if (targetClasses.includes(base) || targetId === base || targetClasses.includes('dropzone' + base)) {
                        // same zone -> ignore the drop
                        return;
                    }
                }

                // mark the dragged element as dropped into a dropzone so draggable end listener can skip snap.
                relatedEl.__cardDroppedIntoZone = true;
                // Clear the flag shortly after to avoid stale state if element isn't removed
                setTimeout(() => {
                    if (relatedEl && relatedEl.__cardDroppedIntoZone) {
                        delete relatedEl.__cardDroppedIntoZone;
                    }
                }, 500);

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
                        window.__cardDropCallbacks[relatedId].invokeMethodAsync('NotifyDropped', relatedId, target.id);
                    } catch (err) {
                        console.error('Error invoking dotnet callback on drop:', err);
                    }
                } else if (relatedEl) {
                    alert(relatedEl.id + ' was dropped into ' + target.id);
                }
            }
        })
        .on('dropactivate', function (event) {
            event.target.classList.add('drop-activated');
        });
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

        // center the element under the cursor (client pixels)
        let desiredLeftClient = clientX - containerRect.left - (el.offsetWidth / 2);
        let desiredTopClient = clientY - containerRect.top - (el.offsetHeight / 2);

        // clamp in client pixels
        const minLeftClient = 0;
        const maxLeftClient = Math.max(0, containerRect.width - el.offsetWidth);
        const minTopClient = 0;
        const maxTopClient = Math.max(0, containerRect.height - el.offsetHeight);

        desiredLeftClient = clamp(desiredLeftClient, minLeftClient, maxLeftClient);
        desiredTopClient = clamp(desiredTopClient, minTopClient, maxTopClient);

        // convert client-pixel coords into element coordinates by dividing by effective scale
        const scale = getEffectiveScale(el) || 1;
        const desiredLeft = desiredLeftClient / scale;
        const desiredTop = desiredTopClient / scale;

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