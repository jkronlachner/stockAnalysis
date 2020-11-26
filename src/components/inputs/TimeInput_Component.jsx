import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {LightTheme} from "../../themes/theme";
import Typography from "@material-ui/core/Typography";

const theme = LightTheme;
const useStyles = makeStyles((/*theme*/) => ({
    root: {
        display: "flex",
        flexDirection: "column",
    },
    timeUnits: {
        display: "flex",
        flexDirection: "row",
    },
    timeSlot: {
        borderColor: theme.palette.text.secondary,
        borderStyle: "solid",
        width: 50,
        height: 50,
        borderRadius: 5,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "all 0.5s ease",
        margin: 10,
        "&:hover": {
            boxShadow: "0 0 10px 1px " + theme.palette.shadowColor.main,
        }
    }
}));

export const TimeInput_Component = ({timeunit, onChange, readOnly}) => {
    //mark: hooks
    const classes = useStyles();
    //mark: states
    const [selected, setselected] = useState(timeunit ?? "M");
    //mark: default vars
    //TODO: Put somewhere else - should not be hidden in this component!
    const timeFormats = ["M", "W", "D", "h", "m", "s", "ms"];

    //<editor-fold desc="lifecycle">
    useEffect(() => {
        onChange(selected)
    }, [selected])
    //</editor-fold>

    //mark: render
    return <div className={classes.root}>
        <Typography variant={"caption"}>Masterzeiteinheit auswählen</Typography>
        <div className={classes.timeUnits}>
            {
                timeFormats.map(value => {
                    return <div onClick={readOnly ? null : () => setselected(value)} style={selected === value ? {
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main
                    } : {}}
                                className={classes.timeSlot}><Typography style={selected === value ? {
                        fontWeight: "bold",
                        color: theme.palette.primary.main
                    } : {}}>{value}</Typography></div>
                })
            }
        </div>
    </div>
}



