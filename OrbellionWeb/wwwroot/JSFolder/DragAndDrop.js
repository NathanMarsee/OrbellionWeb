function dragAndDrop(className) {
    interact(className).draggable({
        listeners: {
            start(event) {
                // Initialize per-element position if missing
                if (!event.target.dataset.x) event.target.dataset.x = 0;
                if (!event.target.dataset.y) event.target.dataset.y = 0;
            },
            move(event) {
                let x = (parseFloat(event.target.dataset.x) || 0) + event.dx;
                let y = (parseFloat(event.target.dataset.y) || 0) + event.dy;

                event.target.style.transform = `translate(${x}px, ${y}px)`;
                event.target.style.order = 1; // Bring the dragged element to the front
                // Move the other elements behind the dragged element
                const siblings = event.target.parentElement.children;
                for (let sibling of siblings) {
                    if (sibling !== event.target) {
                        sibling.style.order += 1; // Send siblings back
                    }
                }

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
