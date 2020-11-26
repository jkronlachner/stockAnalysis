//@flow
import {BACKEND_URL} from "../../settings";

const REQUEST_URL = BACKEND_URL;

const signUp = (username, password) => {
    let body = `{"username": "${username}", "email": "${username}", "password": "${password}"}`
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: body,
        redirect: 'follow',
    };
    return new Promise<Response>((resolve, reject) => {
        fetch(REQUEST_URL + "/user", requestOptions)
            .then(response => resolve(response))
            .catch(error => reject(error));
    });
}

const signIn = (username, password) => {
    console.log("USING ENV VARIABLE: ", REQUEST_URL)
    let formdata = new FormData();
    formdata.append("email", username);
    formdata.append("password", password);

    var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    };

    return new Promise<Response>((resolve, reject) => {
        fetch(REQUEST_URL + "/user/login", requestOptions)
            .then(response => resolve(response))
            .catch(error => reject(error));
    });
}



export {
   signUp, signIn
}
