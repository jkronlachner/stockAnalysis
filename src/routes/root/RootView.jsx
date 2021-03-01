import React, {useEffect} from "react";
import SideNavigationBar_Component from "../../components/miscellaneous/SideNavigationBar_Component";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import {useTheme} from "@material-ui/styles"
import {Redirect, Route, Switch, useHistory, useLocation} from "react-router-dom";
import History from "./History";
import ProjectSettings from "../project/ProjectSettings";
import {ArrowBackIosRounded} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import Dashboard from "./Dashboard";
import {getProjects} from "../../service/backendServices/BackendService";
import {Settings} from "./Settings";
import DetailView from "../project/DetailView";
import {startStatusPolling} from "../../service/backendServices/Poller";


const useStyles = makeStyles((theme) => ({
    containerRoot: {
        paddingLeft: 40,
        paddingTop: 40,
        overflow: "hidden",
        width: "calc(100vw - 40px)",
        height: "calc(100vh - 40px)",
        display: "flex",
        flexDirection: "column",
        background: theme.palette.background.default

    }, container: {
        backgroundColor: theme.palette.background.paper,
        borderRadius: "10px 0 0 0",
        flexGrow: 1,
        width: "calc(100% - 40px - 212.8px)",
        height: "100%",
        overflow: "scroll",
    }, navigation: {
        //transition wont work because the whole route changes and redraws everything,
        //could be fixed if the route is moved down the widget tree only rerendering
        //the container; but then the navigation component has to be notified of the change
        //wich is kind of dumb, so we will keep it this way

        //transition: "width 1s ease"
    }, topBar: {
        width: "100%",
        minHeight: 100,
    },
    mainContent: {
        height: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "stretch",
    }
}));
export const RootView = () => {
    //mark: hooks
    const theme = useTheme();
    const classes = useStyles();
    const location = useLocation();
    const history = useHistory();

    //mark: variables
    const _ = require("lodash")
    const hideNav = _.includes(location.pathname, "project") || _.includes(location.pathname, "detail")


    //<editor-fold desc="lifecycle">
    useEffect(() => {
        getProjects().catch((e) => {
            if (e.message.includes("There is no user")) {
                history.replace("/login");
            }
        }).then(projects => {
                if (projects) {
                    startStatusPolling(projects)
                }
            }
        )
    }, [])
    //</editor-fold>

    //mark: render
    return <div className={classes.containerRoot}>
        <div className={classes.topBar}>
            <Typography variant={"h1"}>Stock <span
                style={{color: theme.palette.primary.main}}>Analysis</span></Typography>
        </div>
        <div className={classes.mainContent}>
            <div className={classes.navigation} style={hideNav ? {width: "0px", overflow: "hidden",} : {}}>
                <SideNavigationBar_Component showNavigationBar={hideNav}/>
            </div>
            <div className={classes.container}>
                {hideNav ? <IconButton onClick={() => {
                    if (history.length < 1) {
                        history.goBack()
                    } else {
                        history.replace("/dashboard")
                    }
                }}><ArrowBackIosRounded/></IconButton> : <></>}
                <Switch>
                    <Route path={"/dashboard"}>
                        <Dashboard/>
                    </Route>
                    <Route path={"/history"}>
                        <History/>
                    </Route>
                    <Route path={"/settings"}>
                        <Settings/>
                    </Route>
                    <Route path={"/project/:id"}><ProjectSettings/></Route>
                    <Route path={"/detail/:id"}><DetailView/></Route>
                    <Route path={"/"} exact><Redirect to="/dashboard"/></Route>
                </Switch>
            </div>
        </div>
    </div>
};
