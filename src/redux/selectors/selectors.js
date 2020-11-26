import {LoadingStatus} from "../../objects/enums/loading.enum";

const getAllProjects = state => state.projects ?? {};
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

export {getAllProjects, getProjectById, getLoadingStatus};
