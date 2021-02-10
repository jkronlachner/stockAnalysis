import React, {useState} from "react";
import {makeStyles} from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import {useDispatch, useSelector} from "react-redux";
import Button from "@material-ui/core/Button";
import {logOut} from "../../redux/actions/user_actions";
import {useHistory} from 'react-router-dom'
import {removeAllDrafts, removeBasechart} from "../../redux/actions/project_actions";
import {deleteTempFiles} from "../../service/backendServices/ProjectService";
import {useAlert} from "react-alert";
import {changeStorageLocation} from "../../service/backendServices/UserService";
const electron = window.require("electron");

const useStyles = makeStyles((theme) => ({
    settingsRoot: {padding: 40},
    divider: {
        margin: 10,
        marginBottom: 40,
    },
    subtitle: {
        color: theme.palette.text.primary,
        marginBottom: 20,
    },
    deleteButton: {
        marginTop: 40,
        borderColor: theme.palette.error.main,
        backgroundColor: theme.palette.error.main,
        opacity: 1.0,
        color: "white",
        borderRadius: 10,
        borderWidth: 2,
        borderStyle: "solid",
        fontFamily: "Biko, sans-serif",
        outline: "none",
        height: 40,
        width: 200,
        background: "transparent",
        display: "flex",
        justifyContent: "center",
        transition: "all 0.2s ease",
        alignItems: "center",
        "&:hover": {
            opacity: 1,
            backgroundColor: theme.palette.error.main,
            boxShadow: "0 0 10px 2px " + theme.palette.error.main,
            color: "white",
        }
    }
}));




export const Settings = () => {
    //mark: hooks
    const classes = useStyles();
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    const history = useHistory();
    const alert = useAlert();

    //states
    const [speicherOrt, setSpeicherOrt] = useState("");



    //<editor-fold desc="helpers">
    function logoutUser() {
        dispatch(logOut());
        history.go(0);
    }

    function openDirectoryChooser() {
        let dialog = electron.remote.dialog;
        let path = dialog.showOpenDialogSync({
            properties: ['openDirectory']
        })
        changeStorageLocation(path).then(x => {
            setSpeicherOrt(path)
        }).catch((e) => {
            alert.show("Fehler beim ändern des Speicherorts. " + e, {
                title: "Fehler!",
                closeCopy: "Okay :(",
                actions: []
            })
        })
    }

    function deleteTempFolder(){
        alert.show("Bist du sicher das du alle deine Drafts löschen möchtest?", {
            title: "Temporäre Files löschen!",
            closeCopy: "Abbrechen",
            actions: [{
                copy: "Löschen",
                onClick: () => {
                    dispatch(removeAllDrafts())
                    deleteTempFiles().then(r => alert.show("Temporäre Files gelöscht!"));
                }
            }]
        });
    }

    //</editor-fold>

    //mark: render
    return <div className={classes.settingsRoot}>
        <Typography variant={"h1"}>Globale Einstellungen</Typography>
        {<p>App Version: {electron.remote.app.getVersion()}</p>}
        <Divider className={classes.divider}/>
        <Typography className={classes.subtitle} variant={"subtitle2"}>Temporäre Files</Typography>
        <Typography variant={"body1"}>Lösche alle deine Temporäre Files. Deine Draft-Projekte werden dadurch auch gelöscht.</Typography>
        <Button onClick={deleteTempFolder}  className={classes.deleteButton}>Indikatoren löschen.</Button>
        <Divider className={classes.divider}/>
        <Typography variant={"subtitle2"} className={classes.subtitle}>Benutzer</Typography>
        <Typography variant={"body1"}>Eingeloggter Nutzer: {user.mail ?? "..."}</Typography>
        <Typography variant={"body2"}>Nutzer-Id: {user.userId}</Typography>
        <Button onClick={logoutUser} className={classes.deleteButton}>Nutzer ausloggen.</Button>
        <Divider className={classes.divider}/>
        <Typography variant={"subtitle2"} className={classes.subtitle}>Speicherort</Typography>
        <Typography variant={"body1"}>Speicherort: {speicherOrt}</Typography>
        <Typography variant={"body2"}>Wähle bitte einen leeren Ordner aus!</Typography>
        <Button className={classes.deleteButton} onClick={openDirectoryChooser}>Ordner auswählen</Button>
    </div>
}
