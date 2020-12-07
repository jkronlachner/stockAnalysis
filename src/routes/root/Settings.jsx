import React from "react";
import {makeStyles} from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import {useDispatch, useSelector} from "react-redux";
import Button from "@material-ui/core/Button";
import {logOut} from "../../redux/actions/user_actions";
import {useHistory} from 'react-router-dom'
const electron = window.require("electron");

const useStyles = makeStyles((theme) => ({
    root: {padding: 40},
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


    //<editor-fold desc="helpers">
    function logoutUser() {
        dispatch(logOut());
        history.go(0);
    }

    //</editor-fold>

    //mark: render
    console.log(electron);
    return <div className={classes.root}>
        <Typography variant={"h1"}>Globale Einstellungen</Typography>
        <p>App Version: {electron.remote.app.getVersion()}</p>
        <Divider className={classes.divider}/>
        <Typography className={classes.subtitle} variant={"subtitle2"}>Indikatoren</Typography>
        <Typography variant={"body1"}>Indikatoren-Files werden lokal abgespeichert, hier kannst du sie löschen wenn du
            mehr Speicherplatz brauchst.</Typography>

        <Button className={classes.deleteButton}>Indikatoren löschen.</Button>

        <Divider className={classes.divider}/>
        <Typography variant={"subtitle2"} className={classes.subtitle}>Benutzer</Typography>
        <Typography variant={"body1"}>Eingeloggter Nutzer: {user.mail ?? "..."}</Typography>
        <Typography variant={"body2"}>Nutzer-Id: {user.userId}</Typography>
        <Button onClick={logoutUser} className={classes.deleteButton}>Nutzer ausloggen.</Button>
    </div>
}
