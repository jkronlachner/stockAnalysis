const _ = require("lodash")
//Load state from local storage
export const loadState = () => {
    try {
        const serializedState = localStorage.getItem('state');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};
//Save state to local storage
export const saveState = (state) => {
    try {
        let projects = Object.values(state.projects);
        //remove all non-drafts
        _.remove(projects, x => x.project.status !== 2);
        state.projects = _.zipObject(projects.map(x => x.project.projectId), projects);
        const serializedState = JSON.stringify(state);
        localStorage.setItem('state', serializedState);
    } catch(e) {
        // ignore write errors
       console.log("Error while saving state: ", e);
    }
};
