import React from "react";
import {BrowserRouter as Router, Route,} from "react-router-dom";
import {RootView} from "./routes/root/RootView";
import PrivateRoute from "./service/ProtectedRoute";
import {LogIn} from "./routes/user/LogIn";

export default function RoutingIndex() {
    require("dotenv").config()

    return <>
        <Router>
            <Route path={"/login"}><LogIn/></Route>
            <PrivateRoute path={"/"}><RootView/></PrivateRoute>
        </Router>
    </>
}
