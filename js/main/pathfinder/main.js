import BlacklistManager from "./blacklist-manager.js";
import DataFetcher from "./data-fetcher.js";
import MapInteractor from "./map-interactor.js";


if(!L || !runescape_map) {
    throw("Global variables L or runescape_map are missing");
}
else {
    const dataFetcher = new DataFetcher();
    const mapInteractor = new MapInteractor(dataFetcher, runescape_map);
    mapInteractor.initMapObjects();
    await new BlacklistManager(dataFetcher).fetchAndCreateBlacklist();
}