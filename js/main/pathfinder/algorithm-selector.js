import DataFetcher from "./data-fetcher.js";

export default class AlgorithmSelector {

    /**
     * @param {DataFetcher} dataFetcher 
     */
    constructor(dataFetcher) {
        /** @type {DataFetcher} */
        this.dataFetcher = dataFetcher;
    }

    /**
     * @returns {string}
     */
    getAlgorithm() {
        return document.querySelector("#algorithm-selector input:checked").value;
    }


    async initAlgorithmSelector() {
        const algorithms = await this.dataFetcher.fetchAllAlgorithms();

        if(!algorithms) {
            throw "Could not fetch algorithms";
        }

        algorithms.sort();

        const htmlContainer = document.getElementById("algorithm-selector")
        algorithms.forEach((algorithm, index) => {
            const inputElement = document.createElement("input");
            inputElement.setAttribute("type", "radio");
            inputElement.setAttribute("name", "algorithm");
            inputElement.setAttribute("id", algorithm);
            inputElement.setAttribute("value", algorithm);
            if(index == 0) {
                inputElement.setAttribute("checked", true);
            }
            const inputLabelElement = document.createElement("label");
            
            inputLabelElement.appendChild(inputElement);
            inputLabelElement.appendChild(document.createTextNode(algorithm));
            htmlContainer.appendChild(inputLabelElement);
        })
    }
}