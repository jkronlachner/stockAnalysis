import React from "react";
import {makeStyles} from "@material-ui/styles";
import {TextField_Component} from "../inputs/TextField_Component";
import {AddRounded, CloseRounded} from "@material-ui/icons";
import Fab from "@material-ui/core/Fab";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        borderRadius: 10,
        padding: "20px",
        marginTop: -20,
        zIndex: 2,
    },
    line: {
        height: 80,
        marginLeft: 40,
        zIndex: -1,
        width: 5,
        backgroundColor: theme.palette.text.secondary,
        marginBottom: -20
    },
    plus: {
        marginBottom: 0,
        marginTop: -60,
        marginLeft: 22,
        transition: "all .55s ease",
        opacity: 0,
        "&:hover": {
            opacity: 1
        }
    },
    content: {
        overflowY: "scroll",
        height: 100,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "normal",
    }
}));

type Indicator_ComponentProps = {
    indicator: any,
    onCreateNew: Function,
    onDelete: Function,
}
export const Indicator_Component = (props: Indicator_ComponentProps) => {
    //mark: hooks
    const classes = useStyles();

    //mark: render
    return <div>
        <div className={classes.root} style={{zIndex: "1"}}>
            <Grid container spacing={1} direction="row">
                <Grid item>
                    <TextField_Component readOnly defaultValue={props.indicator.indicatorType.name} label={"Indikatorname"}/>
                </Grid>
                <Grid item>
                    <TextField_Component readOnly defaultValue={props.indicator.selectedColumn} label={"Spalte"}/>
                </Grid>
                {props.indicator.parameters.map(value => {
                    return <Grid item>
                        <TextField_Component readOnly defaultValue={value.value} label={value.name}/>
                    </Grid>
                })}
                <Grid item style={{marginLeft: "auto"}}>
                    <IconButton onClick={props.onDelete}><CloseRounded/></IconButton>
                </Grid>
            </Grid>
        </div>
        <div className={classes.line}/>
        <Fab size={"small"} onClick={props.onCreateNew} color={"primary"} className={[classes.plus].join(" ")}><AddRounded/></Fab>
    </div>
}
