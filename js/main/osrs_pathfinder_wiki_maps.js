const API_URL = "http://localhost:8100"

async function findPath(start, end) {
    return fetch(`${API_URL}/path.json` + 
        `?from=${start.x},${start.y},${start.z}` +
        `&to=${end.x},${end.y},${end.z}`);
}

function Coordinate(x, y, z) {
    return {x, y, z};
}

window.PF = { findPath, Coordinate }


let startMarker = L.marker([3220.5,3221.5], {
    title: 'start point',
    alt: 'start point marker',
    draggable: true
});
startMarker.on('dragend', startMarkerMoved)
startMarker.addTo(runescape_map);


let endMarker = L.marker([3220.5,3226.5], {
    title: 'end point',
    alt: 'end point marker',
    draggable: true
});

endMarker.on('dragend', endMarkerMoved);
endMarker.addTo(runescape_map);




function startMarkerMoved(event) {
    let coordinates = getCoordinatesFromMarker(event.target);
    console.log('Start marker coordinates: ', coordinates);
}

function endMarkerMoved(event) {
    let coordinates = getCoordinatesFromMarker(event.target);
    console.log('End marker coordinates: ', coordinates);
}

/**
 * Extracts int {x,y,z=0} coordinates out of a marker
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



/*
Path from 3221,3220,0 to 3226,3220,0
{
	"path": [
		{
			"destination": {
				"x": 3221,
				"y": 3220,
				"z": 0
			},
			"methodOfMovement": "start"
		},
		{
			"destination": {
				"x": 3222,
				"y": 3221,
				"z": 0
			},
			"methodOfMovement": "walk north east"
		},
		{
			"destination": {
				"x": 3223,
				"y": 3221,
				"z": 0
			},
			"methodOfMovement": "walk east"
		},
		{
			"destination": {
				"x": 3224,
				"y": 3221,
				"z": 0
			},
			"methodOfMovement": "walk east"
		},
		{
			"destination": {
				"x": 3225,
				"y": 3220,
				"z": 0
			},
			"methodOfMovement": "walk south east"
		},
		{
			"destination": {
				"x": 3226,
				"y": 3220,
				"z": 0
			},
			"methodOfMovement": "walk east"
		}
	]
}
*/