export default class AlgorithmSelector {

    /**
     * @returns {string}
     */
    getAlgorithm() {
        return document.querySelector("#algorithm-selector input:checked").value;
    }


    initAlgorithmSelector() {
        const htmlContainer = document.getElementById("algorithm-selector")

        const algorithms = {
            'dijkstra': 'Dijkstra',
            'dijkstra-reverse': 'Dijkstra Reverse'
        }

        Object.entries(algorithms).forEach(([algoId,algoName], index) => {
            const inputElement = document.createElement("input");
            inputElement.setAttribute("type", "radio");
            inputElement.setAttribute("name", "algorithm");
            inputElement.setAttribute("id", algoId);
            inputElement.setAttribute("value", algoId);
            if(index == 0) {
                inputElement.setAttribute("checked", true);
            }
            const inputLabelElement = document.createElement("label");
            
            inputLabelElement.appendChild(inputElement);
            inputLabelElement.appendChild(document.createTextNode(algoName));
            htmlContainer.appendChild(inputLabelElement);
        })
    }
}