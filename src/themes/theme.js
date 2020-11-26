import {createMuiTheme} from "@material-ui/core";

const PRIMARY = "#E63946";
const FONT_DARK = "#1f1f1f";
const FONT_LIGHT = "#434343";
export const LightTheme = createMuiTheme({
    palette: {
        primary: {
            main: PRIMARY
        },
        shadowColor: {main: "#e2e2e2", dark: "#d7d7d7"},
        secondary: {
            main: "#3791CB",
            dark: "#1D3557",
        },
        background: {
            paper: "#f5f4f4",
            default: "#eeeeee",
        },
        text: {
            primary: FONT_DARK,
            secondary: FONT_LIGHT
        },

    },
    typography: {
        fontFamily: 'Biko, sans-serif',
        h1:{
            fontSize: 35,
            fontWeight: "bold",
            color: FONT_DARK,
        },
        h2: {
            fontSize: 20,
            fontWeight: "bold",
            color: FONT_DARK,
        },
        h3: {
            fontSize: 73,
            fontWeight: "bold",
            color: PRIMARY
        },
        body1: {
            fontSize: 18,
            fontWeight: "normal",
            color: FONT_LIGHT,
        },
        body2: {
            fontSize: 13,
            fontWeight: "normal",
            color: FONT_LIGHT,
        },
        caption: {
            fontWeight: "bold",
            fontSize: 12,
            color: PRIMARY,
        },
        button: {
            textTransform: 'none'
        },
        subtitle1: {
            fontSize: 30,
            fontWeight: "bold",
            color: PRIMARY
        },
        subtitle2: {
            fontSize: 20,
            fontWeight: "bold",
            color: PRIMARY
        }
    },
    shape: {
        borderRadius: 10,
        padding: 20,
    },
})
export const DarkTheme = createMuiTheme({});
