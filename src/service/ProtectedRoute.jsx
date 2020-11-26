import {Route, Redirect} from "react-router-dom";
import React from "react";
import {connect} from "react-redux";

function PrivateRoute({user, children, ...rest}){
    console.log(user);
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