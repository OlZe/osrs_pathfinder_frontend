import BlacklistManager from "./blacklist-manager.js";
import DataFetcher from "./data-fetcher.js";
import MapInteractor from "./map-interactor.js";
import Coordinate from "./coordinate.js";
import AlgorithmSelector from "./algorithm-selector.js";

if (!L || !runescape_map) {
    throw ("Global variables L or runescape_map are missing");
}


const algorithmSelector = new AlgorithmSelector();
algorithmSelector.initAlgorithmSelector();

const dataFetcher = new DataFetcher();

const blacklistManager = new BlacklistManager(dataFetcher);
await blacklistManager.initBlacklist();

const mapInteractor = new MapInteractor(dataFetcher, blacklistManager, algorithmSelector, runescape_map);
mapInteractor.initMapObjects();

document.getElementById("button-fetch-draw-path").onclick = () => { mapInteractor._fetchAndDrawPath(); }