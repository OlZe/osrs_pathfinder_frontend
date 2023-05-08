import DataFetcher from "./data-fetcher.js";

export default class BlacklistManager {

    /**
     * @param {DataFetcher} dataFetcher 
     */
    constructor(dataFetcher) {
        /** @type {DataFetcher} */
        this.dataFetcher = dataFetcher;
    }

    /**
     * @param {string} blacklistItem 
     * @param {boolean} isBlacklisted 
     */
    setBlacklist(blacklistItem, isBlacklisted) {
        const checkbox = document.getElementById(blacklistItem);
        if (!checkbox) {
            throw `Tried to blacklist an item which doesn't exist: ${blacklistItem}`;
        }
        checkbox.checked = isBlacklisted;
    }

    /**
     * @returns {string[]}
     */
    getBlacklist() {
        const checkboxes = Array.from(document.querySelectorAll("#blacklist input").values());
        return checkboxes
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.id);
    }


    async initBlacklist() {
        this.checkboxes = [];
        const blacklist = await this.dataFetcher.fetchAllTeleportsTransports();
        const htmlContainer = document.getElementById("blacklist");
        blacklist
            .map(this._convertBlacklistItemToCheckbox)
            .forEach(checkbox => htmlContainer.appendChild(checkbox));
    }

    /**
     * @param {string} blacklistItem 
     * @return {HTMLLabelElement}
     */
    _convertBlacklistItemToCheckbox(blacklistItem) {
        const label = document.createElement("label");
        label.innerText = blacklistItem;
        const checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.id = blacklistItem;
        label.appendChild(checkbox);
        return label;
    }

}