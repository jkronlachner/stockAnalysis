import React from "react";
import {makeStyles} from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
    root: {},
}));
export const OtherSettings_Component = () => {
    //mark: hooks
    const classes = useStyles();

    //mark: render
    return <div className={classes.root}/>
}
