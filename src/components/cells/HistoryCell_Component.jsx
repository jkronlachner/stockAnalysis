import {makeStyles} from "@material-ui/styles";
import React from "react";
import Typography from "@material-ui/core/Typography";
import {getStatusColor, Status} from "../../objects/enums/status.enum";
import ButtonBase from "@material-ui/core/ButtonBase";
import Skeleton from "react-loading-skeleton";
import {useTheme} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
import {useDispatch} from "react-redux";
import {deleteProject} from "../../redux/actions/project_actions";
import {useHistory} from "react-router-dom";
import {useAlert} from "react-alert";
import {permaRemoveProject} from "../../service/backendServices/ProjectService";

const useStyles = makeStyles((theme) => ({
    containerRoot: {
        backgroundColor: theme.palette.background.default,
        borderColor: "red",
        width: "calc(100% - 20px)",
        display: "flex",
        height: 90,
        margin: 20,
        borderRadius: 10,
        alignItems: "center",
        paddingLeft: 20,
        transition: "all 0.15s ease-out",
        justifyContent: "space-between",
        "&:hover": {
            marginLeft: 30,
            marginRight: 10,
        }
    },
    status: {
        width: 17,
        height: 90,
        alignItems: "end",
        marginLeft: "10px",
        borderRadius: "10px",
    },
    information: {
        marginLeft: "auto"
    },
    deleteButton: {
        position: "absolute",
        zIndex: 2,
        right: "10%",
        height: 50,
        margin: 20,
    }
}));


export const HistoryCell_Component = ({project, duration}) => {
    //MARK: Hooks
    const classes = useStyles();
    const theme = useTheme();
    const dispatch = useDispatch();
    const history = useHistory();
    const alert = useAlert();

    //<editor-fold desc="Helper Methods">
    function proceedToProject() {
        if (project.projectId) {
            if (project.status !== 2) {
                history.push(`/finished/${project.projectId}`);
            } else {
                history.push(`/project/${project.projectId}`);
            }
        }
    }

    function removeProject() {
        if (project.status !== Status.draft) {
            permaRemoveProject(project.projectId).then(r => {
                dispatch(deleteProject(project.projectId))
                alert.show("Projekt gelöscht", {
                    title: "",
                    closeCopy: "Okay",
                    actions: []
                })
            }).catch(e => alert.show("Projekt konnte nicht gelöscht werden.", {
                title: "Fehler.",
                closeCopy: "Okay",
                actions: [
                    {
                        copy: "Nochmal versuchen.",
                        onClick: () => removeProject(),
                    }
                ]
            }));
        } else {
            dispatch(deleteProject(project.projectId))

        }
    }

    //</editor-fold>

    //MARK: RENDERS
    return (
        <div className={classes.containerRoot}>
            <ButtonBase style={{flexGrow: 1}} onClick={proceedToProject}>
                <Typography variant={"h2"}>{project.projectTitle ||
                <Skeleton width={200} height={50}/>}</Typography>
                <div className={classes.information}>
                    <Typography variant={"h2"} style={{
                        color: theme.palette.primary.main,
                        display: "flex",
                        flexDirection: "row"
                    }}>{project.correlation && project.status !== Status.draft ?
                        <Skeleton width={80} height={30}/> : project.correlation ?? ""}</Typography>
                    <Typography variant={"body1"}>{duration && project.status !== Status.draft ?
                        <Skeleton width={100} height={30}/> : duration ?? ""}</Typography>
                </div>
                <div style={{marginLeft: "auto"}}>

                </div>
                <div className={classes.status} style={{backgroundColor: getStatusColor(project.status)}}/>
            </ButtonBase>
            <IconButton color={"primary"} onClick={() => {
                alert.show("Bist du sicher das du dieses Projekt löschen willst?", {
                    title: "Bestätigen.",
                    closeCopy: "Abbrechen",
                    actions: [{
                        copy: "Löschen",
                        onClick: () => removeProject(),
                    }]
                })
            }}>
                <DeleteIcon fontSize={"large"}/>
            </IconButton>
        </div>)
}
