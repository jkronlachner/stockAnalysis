import {createAction} from "@reduxjs/toolkit";

const logIn = createAction("LOG_IN", function prepare(userId: string, mail: string){
    return {
        payload: {
            userId: userId,
            mail: mail,
        }
    }
});
const logOut = createAction("LOG_OUT");

export {logIn, logOut};
