// Path from 3221,3220,0 to 3226,3220,0
const initPath = JSON.parse(`[{"destination":{"x":3221,"y":3220,"z":0},"methodOfMovement":"start"},{"destination":{"x":3222,"y":3221,"z":0},"methodOfMovement":"walk north east"},{"destination":{"x":3223,"y":3221,"z":0},"methodOfMovement":"walk east"},{"destination":{"x":3224,"y":3221,"z":0},"methodOfMovement":"walk east"},{"destination":{"x":3225,"y":3220,"z":0},"methodOfMovement":"walk south east"},{"destination":{"x":3226,"y":3220,"z":0},"methodOfMovement":"walk east"}]`);
const API_URL = "http://localhost:8100"


let startMarker = L.marker([3220.5, 3221.5], {
    title: 'start point',
    alt: 'start point marker',
    draggable: true
});
startMarker.on('dragend', markerMoved)
startMarker.addTo(runescape_map);


let endMarker = L.marker([3220.5, 3226.5], {
    title: 'end point',
    alt: 'end point marker',
    draggable: true
});
endMarker.on('dragend', markerMoved);
endMarker.addTo(runescape_map);

let currentlyDrawnPath = null;
let currentlyOpenPopups = [];
drawPath(initPath);



async function findPath(start, end) {
    const response = await fetch(`${API_URL}/path.json` +
        `?from=${start.x},${start.y},${start.z}` +
        `&to=${end.x},${end.y},${end.z}`);

    const responseBody = await response.json();
    console.log(responseBody);
    if (responseBody.pathFound) {
        drawPath(responseBody.path);
    }
}

function Coordinate(x, y, z) {
    return { x, y, z };
}

function markerMoved() {
    const startCoordinate = getCoordinatesFromMarker(startMarker);
    const endCoordinate = getCoordinatesFromMarker(endMarker);
    console.log('Start: ', startCoordinate, 'End: ', endCoordinate);
    findPath(startCoordinate, endCoordinate);
}

/**
 * Extracts integer values {x,y,z=0} coordinates out of a marker
 * @param {*} marker The Leaflet marker object
 * @returns {x,y,z=0}
 */
function getCoordinatesFromMarker(marker) {
    let latlng = marker.getLatLng();
    return Coordinate(
        Math.floor(latlng.lng),
        Math.floor(latlng.lat),
        0
    );
}

function removeCurrentPath() {
    if (currentlyDrawnPath) {
        currentlyDrawnPath.remove();
    }
}

function drawPath(path) {
    removeCurrentPath();

    let pathCoords = path.map(movement => [movement.destination.y + 0.5, movement.destination.x + 0.5]);
    currentlyDrawnPath = L.polyline(pathCoords);
    currentlyDrawnPath.addTo(runescape_map);

    drawHelperPopupsForPath(path);
}

function drawHelperPopupsForPath(path) {
    // Close popups
    currentlyOpenPopups.forEach(p => p.remove());

    // Draw popups
    path.forEach((movement, index) => {
        // Don't draw popup "to" starting tile or on walking paths
        if (index == 0 || movement.methodOfMovement.includes('walk')) {
            return;
        }

        const destinationCoordinates = movement.destination;
        const sourceCoordinates = path[index - 1].destination;

        // If the popup is going from the starting tile, it could hide the start marker, move it up a little
        if (index == 1) {
            sourceCoordinates.y += 1;
        }


        const popupOptions = { closeButton: false, closeOnEscapeKey: false, autoClose: false, closeOnClick: false, maxWidth: 150, autoPan: false };
        // Let popup show the teleport name, on click pan to destination
        const popupContent = `<div 
                onclick="runescape_map.panTo([${destinationCoordinates.y + 0.5},${destinationCoordinates.x + 0.5}], { animate: true })"
                style="cursor: alias">
                    ${movement.methodOfMovement}
                </div>`;
        const popup = L.popup(popupOptions)
            .setContent(popupContent)
            .setLatLng([sourceCoordinates.y + 0.5, sourceCoordinates.x + 0.5]);
        currentlyOpenPopups.push(popup);
        popup.openOn(runescape_map);
    })
}