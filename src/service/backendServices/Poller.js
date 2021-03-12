import {BACKEND_URL} from "../../settings";
import Axios from "axios";
import {updateProjectStatus} from "../../redux/actions/project_actions";
import {Project} from "../../objects/project";
import {Status} from "../../objects/enums/status.enum";
import {getStatusFromString} from "./JSONParser";
import {store} from "../../redux/reducers";
const _ = require("lodash");

var interval;
export const startStatusPolling = (projects: Project[]) => {
    console.log("Start polling with projects: ", projects);
    _.omitBy(projects, v => v.status === Status.draft);
    projects.forEach(value => pollProjectStatus(value.projectId))
    if(interval) clearInterval(interval);
    interval = setInterval(() => projects.filter(v => v.status === Status.processing).forEach(value => pollProjectStatus(value.projectId)), 3000)

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
        const statusString = response.data.statusText;
        const prevProject = state.projects[projectId]

        if(!prevProject){
            store.dispatch(updateProjectStatus(status, response.data.statusText, projectId));
            return;
        }
        if(prevProject.project.status !== status || prevProject.project.statusText !== statusString){
            store.dispatch(updateProjectStatus(status, response.data.statusText, projectId));
        }
    }).catch(async error => {
        console.log(error);
    })

}
