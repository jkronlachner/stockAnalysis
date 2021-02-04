import {makeStyles} from "@material-ui/styles";
import React from "react";
import Typography from "@material-ui/core/Typography";
import {getStatusColor} from "../../objects/enums/status.enum";
import ButtonBase from "@material-ui/core/ButtonBase";
import Skeleton from "react-loading-skeleton";
import {useHistory} from "react-router-dom";
import {Project} from "../../objects/project";

const useStyles = makeStyles((theme) => ({
    buttonRoot: {
        backgroundColor: "white",
        height: 250,
        margin: 20,
        width: 250,
        flexShrink: 0,
        transition: "all .15s ease-in",
        boxShadow: "0px 0px 10px 1px " + theme.palette.shadowColor.main,
        borderRadius: "20px",
        "&:hover": {
            boxShadow: "0px 0px 20px 1px " + theme.palette.shadowColor.main,
        }
    },
    status: {
        height: 40,
        width: 40,
        borderRadius: 20,
        position: "absolute",
        zIndex: 2,
        top: -10,
        right: -10,
    },
    flexBox: {
        display: "flex",
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        padding: 10,
        textAlign: "center"
    }
}));


export const ProjectTab_Component = ({project, isLoading = false}) => {
    //MARK: HOOKS
    const classes = useStyles();
    const history = useHistory();


    //<editor-fold desc="Helpers">
    function proceedToProject() {
        console.log("Clicked project was: ")
        if (project.projectId) {
            if (project.status !== 2) {
                history.push(`/detail/${project.projectId}`);
            } else {
                history.push(`/project/${project.projectId}`);
            }
        }
    }

    //</editor-fold>

    //MARK: RENDER
    //TODO: Get status String (eg.: if status == success => Korrelation: {korrelation}%
    if (isLoading) {
        project = new Project();
    }
    return <>
        <ButtonBase className={classes.buttonRoot} onClick={() => proceedToProject()} key={project.projectId}>
            <div className={classes.status} style={{backgroundColor: getStatusColor(project.status)}}/>
            <div className={classes.flexBox}>
                <Typography className={classes.title} variant={"h2"}>{isLoading ?
                    <Skeleton width={120} height={50}/> : project.projectTitle}</Typography>
                <Typography variant={"caption"}>{isLoading ?
                    <Skeleton width={200} height={30}/> : "..."}</Typography>
            </div>
        </ButtonBase>
    </>
}
