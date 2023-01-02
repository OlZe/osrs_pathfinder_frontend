import BlacklistManager from "./blacklist-manager.js";
import Coordinate from "./coordinate.js";
import DataFetcher from "./data-fetcher.js";

export default class MapInteractor {

    /**
     * @param {DataFetcher} dataFetcher
     * @param {BlacklistManager} blacklistManager
     * @param {*} map The Leaflet map object
     */
    constructor(dataFetcher, blacklistManager, map) {
        /**@type {DataFetcher} */
        this.dataFetcher = dataFetcher;
        /**@type {BlacklistManager} */
        this.blacklistManager = blacklistManager;
        this.map = map;
        this.currentlyDrawnLines = [];
        this.currentlyOpenPopups = [];
        this.startMarker = null;
        this.endMarker = null;
    }

    async _fetchAndDrawPath() {
        const startCoordinate = this._getCoordinatesFromMarker(this.startMarker);
        const endCoordinate = this._getCoordinatesFromMarker(this.endMarker);
        const blacklist = this.blacklistManager.getBlacklist();
        const pathResult = await this.dataFetcher.fetchPath(startCoordinate, endCoordinate, blacklist);
        if (pathResult.pathFound) {
            this._drawPath(pathResult.path);
        }
    }

    /**
     * @param {PathResultMovement[]} path
     */
    _drawPath(path) {
        this._clearPath();

        const walkingPathColor = "#1100ff";
        const transportPathColor = "#00aeff";

        if (path.length == 0) {
            return;
        }

        let previousCoordinate = path[0].destination;
        path.slice(1).forEach(movement => {
            const isWalking = movement.methodOfMovement.includes("walk");
            const lineColor = isWalking ? walkingPathColor : transportPathColor;
            const lineLatLngs = [previousCoordinate, movement.destination].map(this._convertCoordinateToLatLng);
            const line = L.polyline(lineLatLngs, { color: lineColor });
            this.currentlyDrawnLines.push(line);
            line.addTo(this.map);

            if (!isWalking) {
                this._openMovementPopup(previousCoordinate, movement.destination, movement.methodOfMovement);
            }
            previousCoordinate = movement.destination;
        });

    }

    /**
     * @param {Coordinate} from
     * @param {Coordinate} to
     * @param {string} methodOfMovement
     */
    _openMovementPopup(from, to, methodOfMovement) {
        // <div onclick=panMap> methodOfMovement <button onclick=blacklist></button></div>
        const popupDiv = document.createElement("div");
        popupDiv.setAttribute("style", "cursor: alias");
        popupDiv.onclick = (event) => {
            this.map.panTo(this._convertCoordinateToLatLng(to), { animate: true });
        };
        popupDiv.appendChild(document.createTextNode(methodOfMovement));
        const popupBlacklistButton = document.createElement("button");
        popupBlacklistButton.innerText = "⛔";
        popupBlacklistButton.setAttribute("title", "Blacklist this teleport/transport");
        popupBlacklistButton.onclick = (event) => {
            event.stopPropagation(); // Stop the click event from reaching the underlying popup
            this.blacklistManager.setBlacklist(methodOfMovement, true);
            this._fetchAndDrawPath();
        };
        popupDiv.appendChild(popupBlacklistButton);

        const popupOptions = { closeButton: false, closeOnEscapeKey: false, autoClose: false, closeOnClick: false, maxWidth: 150, autoPan: false };
        const popup = L.popup(popupOptions)
            .setContent(popupDiv)
            .setLatLng(this._convertCoordinateToLatLng(from));
        popup.openOn(this.map);
        this.currentlyOpenPopups.push(popup);
    }

    _clearPath() {
        // Remove old drawn path
        this.currentlyDrawnLines.forEach(l => l.remove());
        this.currentlyDrawnLines = [];
        // Remove open popups
        this.currentlyOpenPopups.forEach(p => p.remove());
        this.currentlyOpenPopups = [];
    }

    /**
     * @param {Coordinate} coord
     * @returns Leaflet LatLng
     */
    _convertCoordinateToLatLng(coord) {
        return [coord.y + 0.5, coord.x + 0.5];
    }

    /**
     * Extracts integer coordinates out of a marker
     * @param {*} marker The Leaflet marker object
     * @returns {Coordinate}
     */
    _getCoordinatesFromMarker(marker) {
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
        this.startMarker.on('dragend', this._fetchAndDrawPath.bind(this));
        this.startMarker.addTo(this.map);
        this.endMarker = L.marker([3220.5, 3226.5], {
            title: 'end point',
            alt: 'end point marker',
            draggable: true
        });
        this.endMarker.on('dragend', this._fetchAndDrawPath.bind(this));
        this.endMarker.addTo(this.map);
        this._drawPath(INIT_PATH);
    }
}
