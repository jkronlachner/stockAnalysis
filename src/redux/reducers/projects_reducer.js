import {createReducer} from "@reduxjs/toolkit";
import {Basechart, Indicator, Project} from "../../objects/project";
import {Status} from "../../objects/enums/status.enum";

const _ = require("lodash");

export const projectsReducer = createReducer(null, {
    ["CREATE"]: (state, action) => {
        const projectId: string = action.payload.projectId;
        const userId: string = action.payload.userId;

        let project = new Project();
        project.creationTimestamp = new Date();
        project.status = Status.draft;
        project.projectId = projectId;
        project.userId = userId; 
        const draftNumber = Object.values(state ?? []).filter((p) => p.projectTitle !== "New Draft").length + 1
        project.projectTitle = "New Draft " + draftNumber;
        return {
            ...state,
            [projectId]: {
                project: project,
                created: new Date().toISOString(),
            }
        }
    },
    ["MODIFY"]: (state, action) => {
        const projectId: string = action.payload.projectId;
        const rowToModify: string = action.payload.rowToModify;
        const data: any = action.payload.data;
        if (rowToModify == null || projectId == null || data == null) {
            return state;
        }
        return {
            ...state,
            [projectId]: {
                project: Object.assign({}, state[projectId].project, {[rowToModify]: data}),
                modified: new Date().toISOString()
            }
        };
    },
    ["REMOVE"]: (state, action) => {
        const {projectId} = action.payload;
        let projects = _.cloneDeep(state);
        projects = _.omit(projects, [projectId]);
        return {
            ...projects
        }
    },
    ["DATABASE_ADD"]: (state, action) => {
        const projects = {
            ...state,
            ...action.payload.projects
        }
        return _.omitBy(projects, (v, k) => v.projectTitle)
    },
    ["REMOVE_BASECHART"]: (state, action) => {
        const {projectId, basechartId} = action.payload;
        const project = _.cloneDeep(state[projectId].project);
        const basecharts = project.basecharts;
        _.remove(basecharts, (basechart: Basechart) => basechart._id === basechartId);
        return {
            ...state,
            [projectId]: {
                project: project,
                modified: new Date().toISOString()
            }
        }

    },
    ["ADD_BASECHART"]: (state, action) => {
        let {project, basechart} = action.payload;
        project = _.cloneDeep(state[project.projectId].project);
        return {
            ...state,
            [project.projectId]: {
                project: Object.assign({}, project, {"basecharts": [...project.basecharts ?? [], basechart]}),
                modified: new Date().toISOString()
            }
        }
    },
    ["MODIFY_BASECHART"]: (state, action) => {
        let {project, basechart, column, newValue} = action.payload;
        basechart = Object.assign({}, basechart);
        let basecharts = Array.from(project.basecharts);
        if (column === "chartname") {
            basechart.chartname = newValue;
        } else if (column === "columns") {
            basechart.columns = newValue;
        } else if (column === "nickname") {
            basechart.nickname = newValue;
        }
        const basechartIndex = project.basecharts.findIndex(value => value._id === basechart._id);
        basecharts[basechartIndex] = basechart;
        return {
            ...state,
            [project.projectId]: {
                project: Object.assign({}, project, {"basecharts": basecharts}),
                modified: new Date().toISOString()
            }
        }
    },
    ["ADD_INDICATOR"]: (state, action) => {
        const {indicator, projectId} = action.payload;

        const projectContainer = Object.assign({}, state[projectId].project);
        const indicators = Array.from(projectContainer.indicator ?? []);
        indicators.length === 0 ? indicator._id = 1 : indicator._id = (_.last(indicators)._id) + 1;
        indicators.push(indicator);
        projectContainer.indicator = indicators;
        return {
            ...state,
            [projectId]: {project: projectContainer, modified: new Date().toISOString()}
        }
    },
    ["REMOVE_INDICATOR"]: (state, action) => {
        const {indicatorId, projectId} = action.payload;
        const projectContainer = Object.assign({}, state[projectId].project);
        const indicators = Array.from(projectContainer.indicator ?? []);
        _.remove(indicators, (i: Indicator) => i._id === indicatorId)
        projectContainer.indicator = indicators;
        return {
            ...state,
            [projectId]: {project: projectContainer, modified: new Date().toISOString()}
        }
    },
    ["MODIFY_INDICATOR"]: (state, action) => {
        const {indicator, projectId} = action.payload;
        const projectContainer = {...state[projectId].project};
        const indicators = Array.from(projectContainer.indicator ?? []);
        const indicatorIndex = _.findIndex(indicators, (i: Indicator) => i._id === indicator._id);
        indicators[indicatorIndex] = indicator;
        projectContainer.indicator = indicators;
        return {
            ...state,
            [projectId]: {project: projectContainer, modified: new Date().toISOString()}
        };
    },
    ["REMOVE_DRAFTS"]: (state, action) => {
        var stateCopy = Object.assign({}, state);
        _.omitBy(stateCopy, ((project: Project, key: String) => project.state = Status.draft))
        const newState = Object.assign({}, stateCopy);
        return {
            ...newState
        }
    },
    ["UPDATE_STATUS"]: (state, action) => {
        const {projectId, status, statusText} = action.payload;
        return {
            ...state,
            [projectId]: {
                project: Object.assign({}, state[projectId].project, {status: status, statusText: statusText}),
                modified: new Date().toISOString()
            },

        }
    }
});

