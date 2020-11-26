// @flow
import {createReducer} from "@reduxjs/toolkit";

export const databaseLoading_reducer = createReducer({loading: true}, {
    ["LOADING"]: () => {
        return {loading: true}
    },
    ["LOADED"]: () => {
        return {loading: false}
    },
    ["ERROR"]: (state, action) => {
        return {
            loading: false,
            error: action.payload.reason
        }
    }
});

