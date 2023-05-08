export default class AlgorithmSelector {

    /**
     * @returns {string}
     */
    getAlgorithm() {
        return document.querySelector("#algorithm-selector input:checked").value;
    }


    initAlgorithmSelector() {
        window["algoSelect"] = this;
        const form = document.createElement("form");
        const fieldset = document.createElement("fieldset");
        const fieldsetLegend = document.createElement("legend");
        fieldsetLegend.innerText = "Select algorithm";
        fieldset.appendChild(fieldsetLegend);
        form.appendChild(fieldset);

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
            inputLabelElement.innerText = algoName;

            inputLabelElement.appendChild(inputElement);
            fieldset.appendChild(inputLabelElement);
        })

        document.getElementById("algorithm-selector").appendChild(form);
    }
}