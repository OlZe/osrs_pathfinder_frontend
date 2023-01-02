import PathFetcher from "./pathfetcher.js";
import MapInteractor from "./mapinteractor.js";


if(!L || !runescape_map) {
    throw("Global variables L or runescape_map are missing");
}
else {
    const pathFetcher = new PathFetcher();
    const mapInteractor = new MapInteractor(pathFetcher, runescape_map);
    mapInteractor.initMapObjects();
}