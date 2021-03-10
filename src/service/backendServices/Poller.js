import {BACKEND_URL} from "../../settings";
import Axios from "axios";
import {updateProjectStatus} from "../../redux/actions/project_actions";
import {Project} from "../../objects/project";
import {Status} from "../../objects/enums/status.enum";
import {getStatusFromString} from "./JSONParser";
import {getStatusForProject} from "../../redux/selectors/selectors";
import {store} from "../../redux/reducers";
const _ = require("lodash");

var interval;
export const startStatusPolling = (projects: Project[]) => {
    console.log("Start polling with projects: ", projects);
    _.omitBy(projects, v => v.status === Status.draft);
    projects.forEach(value => pollProjectStatus(value.projectId))
    if(interval) clearInterval(interval);
    interval = setInterval(() => projects.forEach(value => pollProjectStatus(value.projectId)), 3000)

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
        const prevStatus = state.projects[projectId]
        if(!prevStatus){
            store.dispatch(updateProjectStatus(status, response.data.statusText, projectId));
        }
        if(prevStatus.project.status !== status){
            store.dispatch(updateProjectStatus(status, response.data.statusText, projectId));
        }
        await new Promise(resolve => setTimeout(resolve, 10000))
    }).catch(async error => {
        console.log(error);
        await new Promise(resolve => setTimeout(resolve, 10000))
    })

}
