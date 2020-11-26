//@flow

import {Basechart, Indicator, Project} from "../../objects/project";
import {store} from "../../redux/reducers";

const _ = require("lodash");
const userId = () => store.getState().user.userId;

function getStatusFromString(status) {
    switch (_.toLower(status)) {
        case "finished":
            return 1;
        case "error":
            return -1;
        case "loading":
            return 0;
        case "processing":
            return -2;
        case "draft":
            return 2;
        default:
            return 2;
    }
}
function statusToString(status){
    switch (status) {
        case 1:
            return "FINISHED";
        case -1:
            return "ERROR";
        case 0:
            return "LOADING";
        case -2:
            return "PROCESSING";
        case 2:
            return "DRAFT";
        default:
            return "DRAFT";
    }
}

export function parseJSONToProject(jsonObject: Object) {
    console.log("Parsing... ", jsonObject);
    let project = new Project();
    project.projectId = jsonObject.id;
    project.projectTitle = jsonObject.name;
    project.status = getStatusFromString(jsonObject.status)
    project.timeunit = jsonObject.timeUnit

    if (jsonObject.referenceCharts) {
        project.basecharts = jsonObject.referenceCharts.map(x => {
            let referenceChart = new Basechart();
            referenceChart.columns = x.columns;
            referenceChart._id = x.id;
            referenceChart.nickname = x.name;
            referenceChart.chartname = x.filePath.split("/")[1];
            return referenceChart;
        });
    }
    if (jsonObject.indicators) {
        project.indicator = jsonObject.indicators.map(x => {
            let basechart: Basechart = _.find(project.basecharts, b => b._id === x.referenceChartId, 0)
            let indicator = new Indicator(
                x.function,
                10,
                basechart,
                ""
            );
            indicator._id = x.id;
            return indicator;
        })
    }
    console.log(project);
    return project;
}


export function parseProjectToProjectDTO(project: Project) {
    console.log("Parsing Project to Project DTO!")
    let formData = new FormData();
    const projectDTO = {
        name: project.projectTitle,
        //Set status to 0 because it is no draft anymore if it has been uploaded.
        status: statusToString(0),
        timeUnit: project.timeunit,
        userId: userId(),
        //TODO: Get real TargetDataSetId
        targetDataSetId: project.zieldatensatz,
    }
    const referenceCharts = project.basecharts.map(x => x._id);
    const indicators = project.indicator.map(x =>{ return {
        indicatorFunction: x.definition,
        timeUnit: project.timeunit,
        referenceChartId: x.basechart._id,
    }})

    //Add correct types. idk why this would be necessary
    formData.append("project", new Blob([JSON.stringify(projectDTO)], {type: "application/json"}));
    formData.append("referenceCharts", new Blob([JSON.stringify(referenceCharts)], {type: "application/json"}));
    formData.append("indicators", new Blob([JSON.stringify(indicators)], {type: "application/json"}));
    return formData;
}
