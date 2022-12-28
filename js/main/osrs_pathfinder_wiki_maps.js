/**
 * @typedef {Object} PathResultMovement
 * @property {String} methodOfMovement
 * @property {Coordinate} destination
 */

/**
 * @typedef {Object} PathResult
 * @property {boolean} pathFound
 * @property {number} computeTime
 * @property {PathResultMovement[]} path
 */


class PathFetcher {
    static #API_URL = "http://localhost:8100"

    /**
     * @param {Coordinate} start
     * @param {Coordinate} end
     * @returns {Promise<PathResult>} path
     */
    async fetchPath(start, end) {
        const response = await fetch(`${PathFetcher.#API_URL}/path.json`, {
            method: 'POST',
            body: JSON.stringify({
                from: start,
                to: end,
                blacklist: window.PathFinder._blacklist
            })
        });
        return response.json();
    }
}

class Coordinate {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}


class MapInteractor {
    // Path from 3221,3220,0 to 3226,3220,0
    static #INIT_PATH = JSON.parse(`[{"destination":{"x":3221,"y":3220,"z":0},"methodOfMovement":"start"},{"destination":{"x":3222,"y":3221,"z":0},"methodOfMovement":"walk north east"},{"destination":{"x":3223,"y":3221,"z":0},"methodOfMovement":"walk east"},{"destination":{"x":3224,"y":3221,"z":0},"methodOfMovement":"walk east"},{"destination":{"x":3225,"y":3220,"z":0},"methodOfMovement":"walk south east"},{"destination":{"x":3226,"y":3220,"z":0},"methodOfMovement":"walk east"}]`);


    constructor(pathFetcher, map) {
        this.pathFetcher = pathFetcher;
        this.map = map;
        this.startMarker = L.marker([3220.5, 3221.5], {
            title: 'start point',
            alt: 'start point marker',
            draggable: true
        });
        this.startMarker.on('dragend', this.markerMoved.bind(this))
        this.startMarker.addTo(this.map);
        this.endMarker = L.marker([3220.5, 3226.5], {
            title: 'end point',
            alt: 'end point marker',
            draggable: true
        });
        this.endMarker.on('dragend', this.markerMoved.bind(this));
        this.endMarker.addTo(map);
        this.currentlyDrawnPath = null;
        this.currentlyOpenPopups = [];
        this.drawPath(MapInteractor.#INIT_PATH);
    }
    
    drawPath(path) {
        if (this.currentlyDrawnPath) {
            this.currentlyDrawnPath.remove();
        }
        const pathCoords = path.map(movement => [movement.destination.y + 0.5, movement.destination.x + 0.5]);
        this.currentlyDrawnPath = L.polyline(pathCoords);
        this.currentlyDrawnPath.addTo(runescape_map);
        this.drawHelperPopupsForPath(path);
    }
    
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
            // Let popup show the teleport name, on click pan to destination
            const popupContent = 
                `<div 
                    onclick="runescape_map.panTo([${destinationCoordinates.y + 0.5},${destinationCoordinates.x + 0.5}], { animate: true })"
                    style="cursor: alias">
                        ${movement.methodOfMovement}
                        <button
                            title="Blacklist this teleport/transport"
                            onclick="window.PathFinder.addToBlacklist('${movement.methodOfMovement}')">
                            &#9940;
                        </button>
                </div>`;
            const popup = L.popup(popupOptions)
                .setContent(popupContent)
                .setLatLng([sourceCoordinates.y + 0.5, sourceCoordinates.x + 0.5]);
            popup.openOn(runescape_map);
            this.currentlyOpenPopups.push(popup);
        })
    }

    async markerMoved() {
        const startCoordinate = this.getCoordinatesFromMarker(this.startMarker);
        const endCoordinate = this.getCoordinatesFromMarker(this.endMarker);
        console.log('Start: ', startCoordinate, 'End: ', endCoordinate);
        const pathResult = await this.pathFetcher.fetchPath(startCoordinate, endCoordinate);
        if(pathResult.pathFound)
        {
            this.drawPath(pathResult.path)
        }
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
    
}




const pathFetcher = new PathFetcher();
const mapInteractor = new MapInteractor(pathFetcher, runescape_map)



window.PathFinder = {
    _blacklist: [],
    addToBlacklist: function(methodOfMovement) {
        window.PathFinder._blacklist.push(methodOfMovement);
        console.log("New Blacklist Entry:", methodOfMovement);
    }
}
