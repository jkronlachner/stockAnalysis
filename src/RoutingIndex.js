import React from "react";
import {BrowserRouter as Router, Route,} from "react-router-dom";
import {RootView} from "./routes/root/RootView";
import PrivateRoute from "./service/ProtectedRoute";
import {LogIn} from "./routes/user/LogIn";
import {getIndicators} from "./service/backendServices/IndicatorService";
import {IndicatorTemplate} from "./objects/enums/indicatorTemplate";
import {useDispatch} from "react-redux";
import {replaceIndicators} from "./redux/actions/indicator_actions";

export default function RoutingIndex() {
    require("dotenv").config()
    const dispatch = useDispatch();

    //GET INDICATORS FROM SERVER
    getIndicators().then((indicators: IndicatorTemplate[]) => {
        dispatch(replaceIndicators(indicators))
    })
    
    return <>
        <Router>
            <Route path={"/login"}><LogIn/></Route>
            <PrivateRoute path={"/"}><RootView/></PrivateRoute>
        </Router>
    </>
}
