import BlacklistManager from "./blacklist-manager.js";
import DataFetcher from "./data-fetcher.js";
import MapInteractor from "./map-interactor.js";
import Coordinate from "./coordinate.js";

if (!L || !runescape_map) {
    throw ("Global variables L or runescape_map are missing");
}


const dataFetcher = new DataFetcher();

const blacklistManager = new BlacklistManager(dataFetcher);
await blacklistManager.initBlacklist();

const mapInteractor = new MapInteractor(dataFetcher, blacklistManager, runescape_map);
mapInteractor.initMapObjects();


window.debug = {
    dataFetcher,
    blacklistManager,
    mapInteractor,
    Coordinate,
    getAndDrawPath: async (start, end) => {
        const result = await dataFetcher.fetchPath(start, end, blacklistManager.getBlacklist());
        if(result.pathFound) {
            mapInteractor._drawPath(result.path);
        }
        console.log(result);
    }
};