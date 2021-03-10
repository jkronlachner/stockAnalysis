import {Route, Redirect, useHistory} from "react-router-dom";
import React from "react";
import {connect} from "react-redux";
import {checkUser} from "./backendServices/UserService";

function PrivateRoute({user, children, ...rest}){
    const history = useHistory();
    return (
        <Route
            {...rest}
            render={({location}) =>
                user.loggedIn ? (children) : (<Redirect to={{pathname: "/login"}}/>)
            }
        />
    )
}

function mapStateToProps(state) {
    const {user} = state;
    return {user};
}
export default connect(mapStateToProps)(PrivateRoute)
