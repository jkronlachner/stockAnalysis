import {createAction} from "@reduxjs/toolkit";

const loaded = createAction("LOADED");
const loading = createAction("LOADING");
const error = createAction("ERROR",  function prepare(reason: string){
    return {
        payload: {
            reason: reason,
        }
    }
})

export {loaded, loading, error};
