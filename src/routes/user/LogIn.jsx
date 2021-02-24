import React, {useRef, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {Button, Typography} from "@material-ui/core";
import {TextField_Component} from "../../components/inputs/TextField_Component";
import {signInUser, signUpUser} from "../../service/backendServices/BackendService";
import {useHistory} from "react-router-dom";
import image from "../../assets/LogInSplash.svg";
const useStyles = makeStyles((theme) => ({
    loginRoot: {
        display: "flex",
        flexDirection: "row",
        backgroundColor: theme.palette.background.default
    },
    splash: {
        width: "60%",
        height: "100vh",
        overflow: "hidden",
        flexShrink: 1,
        backgroundColor: theme.palette.primary.main
    },
    leftSideContainer: {
        marginTop: "auto",
        flexGrow: 1,
        padding: 80,
        marginBottom: "auto",
    },
    signInButton: {
        height: 50,
        marginTop: 60,
    },
    bottomText: {
        paddingTop: 20,
        color: theme.palette.text.hint,
        textAlign: "center",
        width: "100%"
    }
}));
export const LogIn = () => {
    //mark: hooks
    const classes = useStyles();
    const usernameReference = useRef();
    const passwordReference = useRef();
    const confirmReference = useRef();
    const history = useHistory();

    //mark: states
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    //<editor-fold desc="helpers">
    function mainButtonAction() {
        setLoading(true)
        setError("");
        if (!isLogin) {
            if (passwordReference.current.value !== confirmReference.current.value) {
                setError("Passwörter stimmen nicht überein!")
                setLoading(false);
                return;
            }
            signUpUser(usernameReference.current.value, passwordReference.current.value).then(() => {
                setLoading(false)
                console.log("Sucessfully created user! Redirecting...")
                history.push("/dashboard")
            }).catch((e) => {
                setLoading(false);
                setError(JSON.parse(e).message)
            })
        } else {
            signInUser(usernameReference.current.value, passwordReference.current.value).then(() => {
                console.log("Successfully logged in!");
                history.push("/dashboard");
            }).catch((e) => {
                setLoading(false);
                setError(JSON.parse(e).message)
            })
        }
    }

    function bottomTextAction() {
        setIsLogin(!isLogin)
    }

    //</editor-fold>

    //mark: render
    return <div className={classes.loginRoot}>
        <div className={classes.leftSideContainer}>
            <Typography variant={"h1"}>{isLogin ? "Sign in." : "Sign up."}</Typography>
            <Typography variant={"caption"}>Wir brauchen ein paar Daten von dir um einen Account erstellen zu
                können. </Typography>
            <div style={{marginTop: "80px"}}/>
            <TextField_Component ref={usernameReference} disabled={loading} placeholder={"max.mustermann@gmail.com"}
                                 type={"text"}/>
            <TextField_Component ref={passwordReference} disabled={loading} placeholder={"Passwort..."}
                                 type={"password"}/>
            {!isLogin ?
                <TextField_Component ref={confirmReference} disabled={loading} placeholder={"Passwort bestätigen..."}
                                     type={"password"}/> : <div/>}
            <Typography variant={"body1"} color={"error"}>{error}</Typography>
            <Button onClick={mainButtonAction} fullWidth className={classes.signInButton} disabled={loading}
                    variant={"contained"}
                    color={"primary"}>{loading ? "Loading..." : isLogin ? "Anmelden" : "Account erstellen"}</Button>
            <div className={classes.bottomText}>
                {isLogin ?
                    <div>Du hast noch keinen Account? <a style={{cursor: "pointer", textDecoration: "underline"}}
                                                         onClick={bottomTextAction}>Hier erstellen.</a></div>
                    :
                    <div>Du hast schon einen Account? <a style={{cursor: "pointer", textDecoration: "underline"}}
                                                         onClick={bottomTextAction}>Hier anmelden.</a></div>
                }

            </div>
        </div>
        <div className={classes.splash}>
            <img style={{objectFit: "scale-down", width: "100%", height: "100%"}} src={image}
                 alt={"Splash Image"}/>
        </div>
    </div>
}
