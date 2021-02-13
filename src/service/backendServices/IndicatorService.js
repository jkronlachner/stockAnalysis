import {Project} from "../../objects/project";
import {BACKEND_URL} from "../../settings";
import Axios from "axios";


const REQUEST_URL = BACKEND_URL;

const generateIndicator = (project: Project, indicatorString: String, basechartId: String) => {
    console.log("Generating Indicator...")

    var formData = new FormData();
     formData.append("indicatorString", indicatorString);
     formData.append("referenceChartId", basechartId);

    var config = {
        method: 'POST',
        data: formData,
        headers: {
            ...formData.headers
        },
        url: REQUEST_URL + "/indicator/generate/"
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
        Axios.request(config).then(response => resolve(response.data)).catch(error => reject(error))
    )
}

const getIndicatorFile = (filePath) => {
    var config = {
        method: 'get',
        url: REQUEST_URL + `/file/readFileContent?filePath=${encodeURIComponent(filePath)}`,
    }
    return new Promise((resolve, reject) =>
        Axios.request(config).then(response => resolve(response.data)).catch(error => reject(error))
    )
}

export {
    generateIndicator,
    getIndicators,
    getIndicatorFile
}
