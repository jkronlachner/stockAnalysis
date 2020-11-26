import {createAction} from "@reduxjs/toolkit";
import {Basechart, Indicator, Project} from "../../objects/project";

const createProject = createAction("CREATE", function prepare(projectId: string){
    return {
        payload: {
            projectId: projectId,
        }
    }
});
const modifyProject = createAction("MODIFY", function prepare(projectId: string, caller: string, data: any) {
    return {
        payload: {
            projectId: projectId,
            rowToModify: caller,
            data: data,
        }
    }
});
const deleteProject = createAction("REMOVE", function prepare(projectId: string){
    return {
        payload: {
            projectId: projectId
        }
    }
})
const removeBasechart = createAction("REMOVE_BASECHART", function prepare(basechartId: string, projectId: string) {
    return {
        payload: {
            basechartId: basechartId,
            projectId: projectId
        }
    }
})
const addBasechart = createAction("ADD_BASECHART", function prepare(project: Project, basechart: Basechart){
    return {
        payload: {
            project: project,
            basechart: basechart,
        }
    }
});
const modifyBasechart = createAction("MODIFY_BASECHART", function prepare(project: Project, basechart: Basechart, column: string, newValue: string){
    return {
        payload: {
            project: project,
            basechart: basechart,
            column: column,
            newValue: newValue
        }
    }
});
const addIndicator = createAction("ADD_INDICATOR", function prepare(indicator: Indicator, projectId: string){
    return {
        payload: {
            indicator: indicator,
            projectId: projectId,
        }
    }
})
const removeIndicator = createAction("REMOVE_INDICATOR", function prepare(indicatorId: string, projectId: string){
    return {
        payload: {
            indicatorId: indicatorId,
            projectId: projectId,
        }
    }
})
const addDatabaseProjects = createAction("DATABASE_ADD", function prepare(projects: Object){
    return {
        payload:{
            projects: projects
        }
    }
});
export {createProject, addBasechart, modifyProject, deleteProject, modifyBasechart, addIndicator, addDatabaseProjects, removeIndicator, removeBasechart};
