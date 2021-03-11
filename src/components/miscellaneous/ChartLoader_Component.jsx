import React from "react";
import {makeStyles} from "@material-ui/styles";
import image from "../../../assets/LogoAnimationStockAnalysis.gif";

const useStyles = makeStyles((theme) => ({
    root: {
        width: 250,
        height: 250,
    },
}));
export const ChartLoader_Component = () => {
    //mark: hooks
    const classes = useStyles();

    //mark: render
    return <div className={classes.root}><img height={250} width={250} src={image} alt={"Loader"}/></div>
}
