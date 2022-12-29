/**
 * @typedef {Object} PathResultMovement
 * @property {string} methodOfMovement
 * @property {Coordinate} destination
 */

/**
 * @typedef {Object} PathResult
 * @property {boolean} pathFound
 * @property {number} computeTime
 * @property {PathResultMovement[]} path
 */

class Coordinate {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}


class PathFetcher {
    static #API_URL = "http://localhost:8100"

    /**
     * @param {Coordinate} start
     * @param {Coordinate} end
     * @param {string[]} blacklist
     * @returns {Promise<PathResult>} path
     */
    async fetchPath(start, end, blacklist) {
        const response = await fetch(`${PathFetcher.#API_URL}/path.json`, {
            method: 'POST',
            body: JSON.stringify({
                from: start,
                to: end,
                blacklist: blacklist
            })
        });
        return response.json();
    }
}


class MapInteractor {

    /**
     * @param {PathFetcher} pathFetcher 
     * @param {*} map The Leaflet map object
     */
    constructor(pathFetcher, map) {
        /**@type {PathFetcher} */
        this.pathFetcher = pathFetcher;
        this.map = map;
        this.currentlyDrawnPath = null;
        this.currentlyOpenPopups = [];
        this.startMarker = null;
        this.endMarker = null;
        /**@type {string[]} */
        this.blacklist = [];
        this.initMapObjects();
    }

    async fetchAndDrawPath() {
        const startCoordinate = this.getCoordinatesFromMarker(this.startMarker);
        const endCoordinate = this.getCoordinatesFromMarker(this.endMarker);
        const pathResult = await this.pathFetcher.fetchPath(startCoordinate, endCoordinate, this.blacklist);
        if (pathResult.pathFound) {
            this.drawPath(pathResult.path)
        }
    }

    /**
     * @param {string} methodOfMovement 
     */
    addBlacklistItem(methodOfMovement) {
        this.blacklist.push(methodOfMovement);
    }

    /**
     * @param {PathResultMovement[]} path 
     */
    drawPath(path) {
        if (this.currentlyDrawnPath) {
            this.currentlyDrawnPath.remove();
        }
        const pathCoords = path.map(movement => [movement.destination.y + 0.5, movement.destination.x + 0.5]);
        this.currentlyDrawnPath = L.polyline(pathCoords);
        this.currentlyDrawnPath.addTo(this.map);
        this.drawHelperPopupsForPath(path);
    }

    /**
     * @param {PathResultMovement[]} path 
     */
    drawHelperPopupsForPath(path) {
        // Close popups
        this.currentlyOpenPopups.forEach(p => p.remove());

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
            // Let popup show the movement name, on click pan to destination
            const popupDiv = document.createElement("div");
            popupDiv.setAttribute("style", "cursor: alias");
            popupDiv.onclick = (event) => {
                this.map.panTo([destinationCoordinates.y + 0.5, destinationCoordinates.x + 0.5], { animate: true });
            };
            popupDiv.appendChild(document.createTextNode(movement.methodOfMovement));
            const popupBlacklistButton = document.createElement("button");
            popupBlacklistButton.innerText = "⛔";
            popupBlacklistButton.setAttribute("title", "Blacklist this teleport/transport");
            popupBlacklistButton.onclick = (event) => {
                event.stopPropagation(); // Stop the click event from reaching the underlying popup
                this.addBlacklistItem(movement.methodOfMovement);
                this.fetchAndDrawPath();
            };
            popupDiv.appendChild(popupBlacklistButton);

            const popup = L.popup(popupOptions)
                .setContent(popupDiv)
                .setLatLng([sourceCoordinates.y + 0.5, sourceCoordinates.x + 0.5]);
            popup.openOn(this.map);
            this.currentlyOpenPopups.push(popup);
        })
    }

    /**
     * Extracts integer coordinates out of a marker
     * @param {*} marker The Leaflet marker object
     * @returns {Coordinate}
     */
    getCoordinatesFromMarker(marker) {
        let latlng = marker.getLatLng();
        return new Coordinate(
            Math.floor(latlng.lng),
            Math.floor(latlng.lat),
            0
        );
    }

    initMapObjects() {
        // Path from 3221,3220,0 to 3226,3220,0
        const INIT_PATH = JSON.parse(`[{"destination":{"x":3221,"y":3220,"z":0},"methodOfMovement":"start"},{"destination":{"x":3222,"y":3221,"z":0},"methodOfMovement":"walk north east"},{"destination":{"x":3223,"y":3221,"z":0},"methodOfMovement":"walk east"},{"destination":{"x":3224,"y":3221,"z":0},"methodOfMovement":"walk east"},{"destination":{"x":3225,"y":3220,"z":0},"methodOfMovement":"walk south east"},{"destination":{"x":3226,"y":3220,"z":0},"methodOfMovement":"walk east"}]`);

        this.startMarker = L.marker([3220.5, 3221.5], {
            title: 'start point',
            alt: 'start point marker',
            draggable: true
        });
        this.startMarker.on('dragend', this.fetchAndDrawPath.bind(this));
        this.startMarker.addTo(this.map);
        this.endMarker = L.marker([3220.5, 3226.5], {
            title: 'end point',
            alt: 'end point marker',
            draggable: true
        });
        this.endMarker.on('dragend', this.fetchAndDrawPath.bind(this));
        this.endMarker.addTo(this.map);
        this.drawPath(INIT_PATH);
    }

}

const pathFetcher = new PathFetcher();
const mapInteractor = new MapInteractor(pathFetcher, runescape_map)