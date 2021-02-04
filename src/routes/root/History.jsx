import React from "react";
import {makeStyles} from "@material-ui/styles";
import {HistoryCell_Component} from "../../components/cells/HistoryCell_Component";
import Typography from "@material-ui/core/Typography";
import {connect} from "react-redux";
import {getAllProjects, getLoadingStatus} from "../../redux/selectors/selectors";
import {LoadingStatus} from "../../objects/enums/loading.enum";
import {Project} from "../../objects/project";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles((theme) => ({
    historyRoot: {padding: "40px"},
    divider: {
        margin: 10,
        marginBottom: 40,
    },
}))


const History = ({projects, loading}) => {
    //mark: hooks
    const classes = useStyles();

    //mark: render
    return <div className={classes.historyRoot}>

        <Typography variant={"h1"}>Letzte Ergebnisse</Typography>
        <Divider className={classes.divider}/>
        {loading.status === LoadingStatus.loading ? [0].map(() => <div>
            <Typography variant={"body1"}>Projects are loading from Database... (Drafts are saved offline)</Typography>
            <HistoryCell_Component project={new Project()}/>
        </div>) : <span/>}
        {projects ? Object.values(projects).map((cell) => {
                return <HistoryCell_Component project={cell.project}
                                              duration={cell.project.runtime}/>
            }) : <span/>}
    </div>
}
const mapStateToProps = state => {
    return {projects: getAllProjects(state), loading: getLoadingStatus(state)};
}
export default connect(mapStateToProps)(History)
