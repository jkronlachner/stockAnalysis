import {Typography} from "@material-ui/core";
import {LightTheme} from "../themes/theme";
import React from "react";

export default {
    title: "Typography",
    parameters: {
        backgrounds: [
            {name: 'white', value: '#ffffff', default: true},
            {name: 'not white', value: '#F7F7F7'},
        ],
    }
}

const theme = LightTheme;

export const title = () => {
    return <><Typography variant={"h1"}>Stock</Typography><Typography variant={"h1"} style={{color: theme.palette.primary.main}}>Analysis.</Typography></>
}
export const subtitle1= () => {
    return <Typography variant={"subtitle1"}>Letztes Ergebnis</Typography>
}
export const subtitle2= () => {
    return <Typography variant={"subtitle2"}>Letztes Ergebnis</Typography>
}
