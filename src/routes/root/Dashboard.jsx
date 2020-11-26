import React from "react";
import {makeStyles} from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";
import {ProjectTab_Component} from "../../components/cells/ProjectTab_Component";
import {CreateProject_Component} from "../../components/miscellaneous/CreateProject_Component";
import {connect} from "react-redux";
import {getAllProjects, getLoadingStatus} from "../../redux/selectors/selectors";
import {LoadingStatus} from "../../objects/enums/loading.enum";
import Grid from "@material-ui/core/Grid";

/*const chartData = [
    {
        "timestamp": 0,
        "Prediction": 4000,
        "Real": 2400,
    },
    {
        "timestamp": 100,
        "Prediction": 3020,
        "Real": 2200,
    },
    {
        "timestamp": 200,
        "Prediction": 3500,
        "Real": 3400,
    },
    {
        "timestamp": 300,
        "Prediction": 3700,
        "Real": 3600,
    },
    {
        "timestamp": 400,
        "Prediction": 1000,
        "Real": 3500,
    },

]*/
const useStyles = makeStyles((theme) => ({
    root: {padding: "40px"},
    lastStat: {},
    projects: {},
    projectsScrollContainer: {
        display: "flex",
        flexDirection: "row",
        overflowX: "scroll",
        overflowY: "scroll",
    }
}));
const Dashboard = ({projects, loading}) => {
    //mark: hooks
    const classes = useStyles();


    //<editor-fold desc="helpers">
    function createProjectTabs() {
        const projectList = [];
        if (loading.status === LoadingStatus.loading) {
            projectList.push([<Grid item><ProjectTab_Component key={0} isLoading={true}/></Grid>,
                <Grid item><ProjectTab_Component key={1} isLoading={true}/></Grid>]);
        }

        for (const {project} of Object.values(projects)) {
            if (project.projectTitle) {
                projectList.push(<Grid item>
                    <ProjectTab_Component
                        project={project}
                    /></Grid>);
            }

        }

        return projectList;
    }

    //</editor-fold>

    //mark: render
    return <div className={classes.root}>
        {/*<div className={classes.lastStat}>
            <Typography variant={"subtitle2"}>Letztes Ergebnis</Typography>
            <Chart_Component data={chartData} isLoading={loading.status === LoadingStatus.loading}/>
        </div>*/}
        <div className={classes.projects}>
            <Typography variant={"subtitle2"}>Projects</Typography>
            <Grid container spacing={0} direction={"row"} wrap={"wrap"}>
                {createProjectTabs()}
                <Grid item>
                    <CreateProject_Component/>
                </Grid>
            </Grid>
        </div>
    </div>
}
const mapStateToProps = state => {
    return {projects: getAllProjects(state), loading: getLoadingStatus(state)};
}
export default connect(mapStateToProps)(Dashboard)
