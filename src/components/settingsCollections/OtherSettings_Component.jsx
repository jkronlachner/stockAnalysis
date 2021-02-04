import React from "react";
import {makeStyles} from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
    otherSettingsRoot: {},
}));
export const OtherSettings_Component = () => {
    //mark: hooks
    const classes = useStyles();

    //mark: render
    return <div className={classes.otherSettingsRoot}/>
}
