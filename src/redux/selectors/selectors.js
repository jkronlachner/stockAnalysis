import {LoadingStatus} from "../../objects/enums/loading.enum";
import {Basechart, Project} from "../../objects/project";
const _ = require("lodash")

const getAllProjects = state => state.projects ?? {};
const getLatestProjects = (state, count) => {
    const projects = _.values(state.projects).sort((p1, p2) => p1.project.status - p2.project.status)
    console.log(projects);
    return _.slice(projects, 0, count)
}
const getProjectById = (state, id) => {
    console.log("Get projects by id: ", state)
    if (state == null) {
        return;
    }
    return state[id];
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

export {getAllProjects, getProjectById, getLoadingStatus, hasIndicator, getLatestProjects};
