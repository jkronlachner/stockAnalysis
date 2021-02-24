import {store} from "../../redux/reducers";
import {error, loaded} from "../../redux/actions/loading_actions";
import {createNewProject, getAllProjects, getSingleProject} from "./ProjectService";
import {parseJSONToProject} from "./JSONParser";
import {addDatabaseProjects} from "../../redux/actions/project_actions";
import {signIn, signUp} from "./UserService";
import {logIn, logOut} from "../../redux/actions/user_actions";
import {Project} from "../../objects/project";

const _ = require("lodash")
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export const getProjects = () => {
    return getAllProjects().then(contents => {
        let jsonContent = JSON.parse(contents);
        if(jsonContent.status >= 400){
            return Promise.reject(jsonContent);
        }
        let projects = {};
        jsonContent.forEach(x => {
            let project = parseJSONToProject(x);
            projects = {
                ...projects,
                [project.projectId]: {
                    project: project,
                    created: new Date().toISOString(),
                }
            }
        });
        store.dispatch(loaded());
        store.dispatch(addDatabaseProjects(projects))
    }).catch(reason => {
        store.dispatch(error(reason.message));
        return Promise.reject(reason);

    })
}

export const createProject = (project: Project) => {
    return createNewProject(project)
}

export const getProject = (projectId) => {
    return getSingleProject(projectId).then(contents => {
        console.log("Response: ", contents);
        let project = parseJSONToProject(JSON.parse(contents));
        let p = {
            [project.projectId]: {
                project: project,
                created: new Date().toISOString(),
            }
        }
        if(!p[project.projectId].project.projectTitle){
            return;
        }
        store.dispatch(loaded());
        store.dispatch(addDatabaseProjects(p))
    }).catch(e => {
        console.error("Cought error:", e);
        store.dispatch(error(e.message))
    })
}

export const signUpUser = (username, password) => {
    return new Promise((resolve, reject) => {
        signUp(username, password).then((response: Response) => {
            if (response.ok) {
                console.log("Response is ok!")
                response.text().then(content => {
                    store.dispatch(logIn(JSON.parse(content).id), username);
                    resolve();
                }).catch((e) => {
                    console.error(e);
                    reject();
                })
            } else {
                reject();
                console.log("Response is not ok :( ")
            }
        })
    })

}

export const signInUser = (username, password) => {
    return new Promise((resolve, reject) => {
        signIn(username, password).then((response: Response) => {
            if (response.ok) {
                console.log("Response is ok!");
                response.text().then(content => {
                    resolve();
                    console.log("Signing in with: ", username)
                    store.dispatch(logIn(JSON.parse(content).id), username)
                }).catch((e) => {
                    console.error(e);
                    reject(e);
                })
            } else {
                console.log("Response is not ok!");
                response.text().then((e) =>
                    reject(e)
                )
            }
        });
    });
}

export const signOutUser = () => {
    store.dispatch(logOut())
}



function updateProjects(contents) {

}
