import {LoadingStatus} from "../../objects/enums/loading.enum";
import {Basechart, Project} from "../../objects/project";
import {Status} from "../../objects/enums/status.enum";
const _ = require("lodash")

const getAllProjects = state => _.omitBy(state.projects, (project) => project.project.userId !== state.user.userId) ?? {};
const getLatestProjects = (state, count) => {
    const projects = _.values(getAllProjects(state)).sort((p1, p2) => p1.project.status - p2.project.status)
    return _.slice(projects, 0, count)
}
const getProjectById = (state, id) => {
    console.log("Get projects by id: ", state)
    if (state == null) {
        return;
    }
    return state[id];
}
const getStatusForProject = (state, projectId) => {

    return state.projects[projectId].project.status;
}
const getLoadingStatus = (state) => {
    if(state.loading.error){
        return {status: LoadingStatus.error, error: state.loading.error};
    }else{
        return {status: state.loading.loading ? LoadingStatus.loading : LoadingStatus.loaded, error: ""}
    }
}
const hasIndicator = (project: Project, basechartId: String) => {
    if(!project.indicator){
        return false
    }
    return project.indicator.some(value => {
        return value.basechart._id === basechartId
    });
}
const getUserId = (state) => state.user.userId;
export {getAllProjects, getProjectById, getLoadingStatus, hasIndicator, getLatestProjects, getUserId, getStatusForProject};
