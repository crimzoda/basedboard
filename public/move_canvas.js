var mousePosition;
var offset = [0, 0];
var div;
var isDown = false;
var tile_size = 300;

div = document.getElementById("canvas");

const startX = Math.floor(Math.random() * (0 - -4000 + 1) + -4000) + "px";
const startY = Math.floor(Math.random() * (0 - -4000 + 1) + -4000) + "px";

div.style.left = startX;
div.style.top = startY;

div.addEventListener('mousedown', handleMouseDown, true);
div.addEventListener('touchstart', handleTouchStart, true);

document.addEventListener('mouseup', handleMouseUp, true);
document.addEventListener('touchend', handleTouchEnd, true);

div.addEventListener('mouseup', handleMouseUpOnDiv, true);
div.addEventListener('touchend', handleTouchEndOnDiv, true);

document.addEventListener('mousemove', handleMouseMove, true);
document.addEventListener('touchmove', handleTouchMove, true);

function handleMouseDown(e) {
    isDown = true;
    offset = [
        div.offsetLeft - e.clientX,
        div.offsetTop - e.clientY
    ];
}

function handleTouchStart(e) {
    isDown = true;
    const touch = e.touches[0];
    offset = [
        div.offsetLeft - touch.clientX,
        div.offsetTop - touch.clientY
    ];
}

function handleMouseUp() {
    isDown = false;
    div.style.cursor = 'default';
}

function handleTouchEnd() {
    isDown = false;
    //div.style.cursor = 'default';
}

function handleMouseUpOnDiv(e) {
    handleElementInteraction(e.clientX, e.clientY);
}

function handleTouchEndOnDiv(e) {
    const touch = e.changedTouches[0];
    handleElementInteraction(touch.clientX, touch.clientY);
}

function handleMouseMove(event) {
    event.preventDefault();
    if (isDown) {
        div.style.cursor = 'grabbing';
        mousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        updateDivPosition();
    }
}

function handleTouchMove(event) {
    event.preventDefault();
    if (isDown) {
        const touch = event.touches[0];
        mousePosition = {
            x: touch.clientX,
            y: touch.clientY
        };
        updateDivPosition();
    }
}

function updateDivPosition() {
    div.style.left = (mousePosition.x + offset[0]) + 'px';
    div.style.top = (mousePosition.y + offset[1]) + 'px';
}

function handleElementInteraction(clientX, clientY) {
    document.getElementById('xCoord').innerText = String(Math.floor((clientX - div.offsetLeft) / tile_size) * tile_size);
    document.getElementById('yCoord').innerText = String(Math.floor((clientY - div.offsetTop) / tile_size) * tile_size);
    
    document.getElementById("hover_tile").style.left = (Math.floor((clientX - div.offsetLeft) / tile_size) * tile_size) + 'px';
    document.getElementById("hover_tile").style.top = (Math.floor((clientY - div.offsetTop) / tile_size) * tile_size) + 'px';

    document.getElementById("hover_tile").style.visibility = "visible";
    console.log(Math.floor((clientX - div.offsetLeft) / tile_size) * tile_size + ', ' + Math.floor((clientY - div.offsetTop) / tile_size) * tile_size);
}

