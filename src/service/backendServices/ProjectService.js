import {store} from "../../redux/reducers";
import Axios from "axios";
import {Project} from "../../objects/project";
import {parseProjectToProjectDTO} from "./JSONParser";
import {BACKEND_URL} from "../../settings";

const REQUEST_URL = BACKEND_URL;

const userId = () => store.getState().user.userId;

const getAllProjects = () => {
    let requestOptions = {
        method: 'GET',
        redirect: 'follow',
    };
    console.log("Getting Projects for: " + userId())

    return fetch( REQUEST_URL + "/user/" + userId(), requestOptions)
        .then(response => response.text())
        .then(contents => Promise.resolve(contents))
        .catch(error => Promise.reject(error));
}

const getSingleProject = (projectId) => {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };
    return fetch( REQUEST_URL + "/project/" + projectId, requestOptions)
            .then(response => response.text())
            .then(result => Promise.resolve(result))
            .catch(error => Promise.reject(error));

}

const uploadFile = ({file, nickname, columns, setProgress}) => {
    let formData = new FormData();
    let jsonObject = {
        name: nickname,
        columns: columns,
    }
    let jsonData = JSON.stringify(jsonObject);

    formData.append("referenceChart", new Blob([jsonData], {type: "application/json"}));
    formData.append("file", file);

    var config = {
        method: 'post',
        url: REQUEST_URL + "/file",
        data : formData,
        onUploadProgress : (progress: ProgressEvent) => {
            setProgress((progress.loaded / progress.total * 100).toFixed(0))
        }
    };

    return new Promise((resolve, reject) =>
        Axios.request(config).then(response => resolve(response.data)).catch(e => reject(e))
    )
}

const uploadTargetdataFile = ({file, setProgress}) => {
    let formData = new FormData();
    formData.append("file", file);

    var config = {
        method: 'post',
        url: REQUEST_URL + "/file/targetDataSet",
        data: formData,
        onUploadProgress: (progress: ProgressEvent) => {
            console.log(progress)
            setProgress((progress.loaded / progress.total * 100).toFixed(0))
        }
    };

    return new Promise((resolve, reject) =>
        Axios.request(config).then(response => resolve(response.data)).catch(e => reject(e))
    )
}

const createNewProject = (project: Project) => {
    console.log("Creating project!... ", project);
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "multipart/form-data");

    var formData = parseProjectToProjectDTO(project);

    var config = {
        url: REQUEST_URL + "/project",
        method: 'post',
        data: formData,
    };

    return new Promise((resolve, reject) =>
        Axios.request(config).then(response => resolve(response.data)).catch(e => reject(e))
    )
}

export {
    uploadTargetdataFile,
    getAllProjects,
    getSingleProject,
    uploadFile,
    createNewProject
}