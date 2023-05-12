import Coordinate from "./coordinate.js";

/**
 * @typedef {Object} PathResultMovement
 * @property {string} methodOfMovement
 * @property {Coordinate} destination
 */

/**
 * @typedef {Object} PathResult
 * @property {boolean} pathFound
 * @property {number} totalCost
 * @property {number} computeTimeMs
 * @property {number} amountExpandedVertices
 * @property {number} amountVerticesLeftInQueue
 * @property {string} reasonForNoPathFound
 * @property {PathResultMovement[]} path
 */

export default class DataFetcher {
    static #API_URL = "http://localhost:8080/api"
    static #HEADERS = new Headers({'Content-Type': 'application/json'});

    /**
     * @param {Coordinate} start
     * @param {Coordinate} end
     * @param {string[]} blacklist
     * @param {string} algorithm
     * @returns {Promise<PathResult>} path
     */
    async fetchPath(start, end, blacklist, algorithm) {
        const response = await fetch(`${DataFetcher.#API_URL}/path.json`, {
            method: 'POST',
            body: JSON.stringify({
                from: start,
                to: end,
                blacklist: blacklist,
                algorithm: algorithm
            }),
            headers: DataFetcher.#HEADERS
        });
        return response.json();
    }

    /**
     * @returns {string[]} A list of all teleports and transports
     */
    async fetchAllTeleportsTransports() {
        const response = await fetch(`${DataFetcher.#API_URL}/transports-teleports.json`, {
            headers: DataFetcher.#HEADERS
        });
        return response.json();
    }

    /**
     * @returns {string[]} A list of all available algorithms
     */
    async fetchAllAlgorithms() {
        const response = await fetch(`${DataFetcher.#API_URL}/algorithms.json`, {
            headers: DataFetcher.#HEADERS
        });
        return response.json();
    }
}