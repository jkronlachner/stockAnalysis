import {combineReducers, configureStore, getDefaultMiddleware} from "@reduxjs/toolkit";
import {projectsReducer} from "./projects_reducer";
import {loadState, saveState} from "../localStorage";
import {databaseLoading_reducer} from "./databaseLoading_reducer";
import {user_reducer} from "./user_reducer";
import {indicatorReducer} from "./indicators_reducer";

const persistedStore = loadState();
export const store = configureStore({
    devTools: true,
    reducer: combineReducers({projects: projectsReducer, loading: databaseLoading_reducer, user: user_reducer, indicators: indicatorReducer}),
    middleware: getDefaultMiddleware({
        serializableCheck: {
            ignoredActionPaths: ['payload'],
        }
    }),
    preloadedState: persistedStore
})

store.subscribe(() => {
    saveState({
        projects: store.getState().projects ?? [],
        user: store.getState().user
    })
})

