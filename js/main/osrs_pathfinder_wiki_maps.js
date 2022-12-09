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