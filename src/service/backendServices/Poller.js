import {BACKEND_URL} from "../../settings";

export const pollProjectStatus = (projectId) => {
    var axios = require('axios');
    var data = '';

    var config = {
        method: 'get',
        url: BACKEND_URL +  `/project/${projectId}/status`,
    };

    axios.request(config).then()
}
