import {BACKEND_URL} from "../../settings";
import Axios from "axios";
import {updateProjectStatus} from "../../redux/actions/project_actions";
import {Project} from "../../objects/project";
import {Status} from "../../objects/enums/status.enum";
import {getStatusFromString} from "./JSONParser";
import {getStatusForProject} from "../../redux/selectors/selectors";
import {store} from "../../redux/reducers";
const _ = require("lodash");


export const startStatusPolling = (projects: Project[]) => {
    _.omitBy(projects, v => v.status === Status.draft);
    projects.forEach(value => pollProjectStatus(value.projectId))
}

export async function pollProjectStatus(projectId){
    const state = store.getState();
    var data = '';
    var config = {
        method: 'get',
        url: BACKEND_URL + `/project/${projectId}/status`,
    };
    Axios.request(config).then(async response => {
        const status = getStatusFromString(response.data.status)
        const prevStatus = state.projects[projectId].project.status;
        if(prevStatus !== status){
            store.dispatch(updateProjectStatus(status, response.data.statusText, projectId));
        }
        await new Promise(resolve => setTimeout(resolve, 10000))
        await pollProjectStatus(projectId);
    }).catch(async error => {
        console.log(error);
        await new Promise(resolve => setTimeout(resolve, 10000))
        await pollProjectStatus(projectId);
    })

}
