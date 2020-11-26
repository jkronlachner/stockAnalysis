// @flow
import {createReducer} from "@reduxjs/toolkit";

export const user_reducer = createReducer({loggedIn: false, timestamp: null, userId: null, mail: null}, {
     ["LOG_IN"]: (state, action) => {
         return {loggedIn: true, timestamp: Date.now(), userId: action.payload.userId, mail: action.payload.mail}
     },
     ["LOG_OUT"]: () => {
         return {loggedIn: false, timestamp: null, userId: null, mail: null};
     }
});


