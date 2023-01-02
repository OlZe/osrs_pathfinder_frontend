import Coordinate from "./coordinate.js";

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

export default class DataFetcher {
    static #API_URL = "http://localhost:8100"

    /**
     * @param {Coordinate} start
     * @param {Coordinate} end
     * @param {string[]} blacklist
     * @returns {Promise<PathResult>} path
     */
    async fetchPath(start, end, blacklist) {
        const response = await fetch(`${DataFetcher.#API_URL}/path.json`, {
            method: 'POST',
            body: JSON.stringify({
                from: start,
                to: end,
                blacklist: blacklist
            })
        });
        return response.json();
    }

    /**
     * @returns {string[]} A list of all teleports and transports
     */
    async fetchAllTeleportsTransports() {
        const response = await fetch(`${DataFetcher.#API_URL}/transports-teleports.json`);
        return response.json();
    }
}