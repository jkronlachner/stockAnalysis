//@flow
import {BACKEND_URL} from "../../settings";
import {store} from "../../redux/reducers";
import Axios from "axios";

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

const checkUser = () => {
    const userId = () => store.getState().user.userId;
    var config = {
        method: 'get',
        url: REQUEST_URL + "/user/hasUser/" + userId(),
    };
    return new Promise((resolve, reject) =>
        Axios.request(config).then(response => resolve(response.data)).catch(e => reject(e))
    )
}

const changeStorageLocation = (storageLocation) => {
    var FormData = require('form-data');
    var data = new FormData();
    data.append('newPath', storageLocation);


    var config = {
        method: 'put',
        url: REQUEST_URL + '/file/changeStorageLocation',
        headers: {
            ...data.headers
        },
        data : data
    }
    return new Promise(((resolve, reject) =>
        Axios.request(config).then(response => resolve(response.data)).catch(e => reject(e))
    ))
}

export {
   signUp, signIn, checkUser, changeStorageLocation
}
