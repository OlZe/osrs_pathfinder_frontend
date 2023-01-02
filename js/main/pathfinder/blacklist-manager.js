import DataFetcher from "./data-fetcher.js";

export default class BlacklistManager {

    /**
     * @param {DataFetcher} dataFetcher 
     */
    constructor(dataFetcher) {
        /** @type {DataFetcher} */
        this.dataFetcher = dataFetcher;
        /** @type {HTMLFormElement} */
        this.form = null;
    }

    /**
     * @param {string} blacklistItem 
     * @param {boolean} isBlacklisted 
     */
    setBlacklist(blacklistItem, isBlacklisted) {
        const checkbox = document.getElementById(blacklistItem);
        if(!checkbox) {
            throw `Tried to blacklist an item which doesn't exist: ${blacklistItem}`;
        }
        checkbox.checked = isBlacklisted;
    }

    /**
     * @returns {string[]}
     */
    getBlacklist() {
        if(!this.form) {
            return [];
        }

        const checkboxes = Array.from(this.form.querySelectorAll("input").values());
        return checkboxes
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.id);
    }


    async initBlacklist() {
        this.checkboxes = [];
        const blacklist = await this.dataFetcher.fetchAllTeleportsTransports();
        const form = document.createElement("form");
        blacklist
            .map(this._convertBlacklistItemToCheckbox)
            .forEach(checkbox => form.appendChild(checkbox));
        document.body.appendChild(form);
        this.form = form;
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