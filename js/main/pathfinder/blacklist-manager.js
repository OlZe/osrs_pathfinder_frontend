import DataFetcher from "./data-fetcher.js";

export default class BlacklistManager {

    /**
     * @param {DataFetcher} dataFetcher 
     */
    constructor(dataFetcher) {
        /** @type {DataFetcher} */
        this.dataFetcher = dataFetcher;
    }


    async fetchAndCreateBlacklist() {
        const blacklist = await this.dataFetcher.fetchAllTeleportsTransports();
        const form = document.createElement("form");
        blacklist
            .map(this.convertBlacklistItemToCheckbox)
            .forEach(checkbox => form.appendChild(checkbox));
        document.body.appendChild(form);
    }

    /**
     * @param {string} blacklistItem 
     * @return {HTMLLabelElement}
     */
    convertBlacklistItemToCheckbox(blacklistItem) {
        const label = document.createElement("label");
        label.innerText = blacklistItem;
        const checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.id = blacklistItem;
        label.appendChild(checkbox);
        return label;
    }

}