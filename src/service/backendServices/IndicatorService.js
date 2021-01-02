import {Project} from "../../objects/project";
import {BACKEND_URL} from "../../settings";
import Axios from "axios";


const REQUEST_URL = BACKEND_URL;

const generateIndicator = (project: Project, indicatorString: String, basechartId: String) => {
    console.log("Generating Indicator...")

    var raw = JSON.stringify({indicatorString: indicatorString, baseChart: basechartId})

    var config = {
        method: 'POST',
        data: raw,
        url: REQUEST_URL + "/indicator/generate/" + project.projectId
    };

    return new Promise((resolve, reject) =>
        Axios.request(config).then(response => resolve(response)).catch(error => reject(error))
    )
}

const getIndicators = () => {
    console.log("getting indicators");

    var config = {
        url: REQUEST_URL + "/indicator/all",
        method: 'get',
    }

    return new Promise((resolve, reject) =>
        Axios.request(config).then(response => resolve(response)).catch(error => reject(error))
    )
}

export {
    generateIndicator,
    getIndicators
}
