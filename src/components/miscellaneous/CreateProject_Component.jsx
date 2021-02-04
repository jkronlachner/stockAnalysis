import {makeStyles} from "@material-ui/styles";
import React from "react";
import Typography from "@material-ui/core/Typography";
import {AddRounded} from "@material-ui/icons";
import ButtonBase from "@material-ui/core/ButtonBase";
import {useHistory} from "react-router-dom";
import {createProject as createNewProject} from "../../redux/actions/project_actions";
import {generateUUID} from "../../service/UUIDService";
import {useDispatch} from "react-redux";


const useStyles = makeStyles((theme) => ({
    createProjectCellRoot: {
        margin: 20,
        backgroundColor: "white",
        height: 250,
        width: 250,
        flexShrink: 0,
        transition: "all .15s ease-in",
        boxShadow: "0px 0px 20px 1px " + theme.palette.shadowColor.main,
        borderRadius: "20px",
        "&:hover":{
            boxShadow: "0px 0px 20px 5px " + theme.palette.shadowColor.main,
        }
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
    },
    add: {
        fontSize: 80,
    }
}));

export const CreateProject_Component = () => {
    //mark: hooks
    const classes = useStyles();
    const history = useHistory();
    const dispatch = useDispatch();

    //<editor-fold desc="helpers">
    function createProject() {
        const projectId = generateUUID();
        dispatch(createNewProject(projectId));
        history.push(`/project/${projectId}`);
    }

    //</editor-fold>

    //mark: render
    return <ButtonBase className={classes.createProjectCellRoot} onClick={createProject}>
        <div className={classes.flexBox}>
            <AddRounded className={classes.add}/>
            <Typography className={classes.title} variant={"h2"}>Neues Projekt anlegen</Typography>
        </div>
    </ButtonBase>
}
