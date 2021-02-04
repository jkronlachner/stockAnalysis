import React, {forwardRef} from "react";
import {makeStyles} from "@material-ui/styles";
import {LightTheme} from "../../themes/theme";
import {withStyles} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";


const theme = LightTheme;
const useStyles = makeStyles((/*theme*/) => ({
    textfieldRoot: {
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        "&:hover $label": {
            color: theme.palette.primary.main
        }
    },
    label: {
        marginBottom: 10,
        transition: "all 0.5s ease"
    },
    helper: {
        color: theme.palette.text.secondary,
        fontWeight: "normal",
        marginTop: 5,
    },
    cssOutlinedInput: {
        transition: "all .45s ease",
        borderRadius: "5px !important",
        '&$cssFocused $notchedOutline': {
            borderColor: `transparent !important`,
        },
        "&:hover": {
            boxShadow: "0px 0px 10px 1px #eaeaea",
        }
    },
    focused: {
        boxShadow: "0px 0px 10px 1px #eaeaea",
        "& :label": {
            color: theme.palette.primary.main,
        }
    },
    notchedOutline: {
    },
    disabled: {
        opacity: "0.5",
        borderRadius: "5px !important",
    },
}));
type FieldProps = {
    selectItems? : Array<React.Component>,
    onDone? : Function,
    label : string,
    notWhite?: boolean,
    onChange?: Function,
    error?: boolean,
    disabled?: boolean,
    fullWidth?: boolean,
    defaultValue?: string,
    type?: "text" | "number" | "email" | "tel" | "range" | "file",
    placeholder?: string,
    readOnly?: boolean,
    helperText?: string,
    other?: Array<any>,
    value?: string,
}


/**
 *
 * @param {{selectItems? : Array<React.Component>,
    onDone? : Function,
    label : string,
    notWhite?: boolean,
    onChange?: Function,
    error?: boolean,
    disabled?: boolean,
    fullWidth?: boolean,
    defaultValue?: string,
    type?: "text" | "number" | "email" | "tel" | "range" | "file",
    placeholder?: string,
    readOnly?: boolean,
    helperText?: string,
    other?: Array<any>}} props
 */
export const  TextField_Component = forwardRef((props: FieldProps, ref) => {
    //mark: hooks
    const classes = useStyles();

    //This is used for some functionality that differs from the one that the material ui one has.
    //mark: renders
    return <div className={classes.textfieldRoot}>
        <Typography className={classes.label} variant={"caption"}>{props.label}</Typography>
        <CustomTextField
            value={props.value}
            inputRef={ref}
            variant={"outlined"}
            select={props.selectItems != null}
            onBlur={props.onDone}
            style={props.notWhite ? {backgroundColor: theme.palette.background.default} : {}}
            onChange={props.onChange}
            error={props.error ?? false}
            fullWidth={props.fullWidth}
            defaultValue={props.defaultValue}
            type={props.type}
            color={"primary"}
            placeholder={props.placeholder}
            InputProps={{
                disabled: props.disabled,
                readOnly: props.readOnly,
                classes: {
                    disabled: classes.disabled,
                    root: classes.cssOutlinedInput,
                    focused: classes.focused,
                    notchedOutline: classes.notchedOutline,
                },
            }}

            {...props.other}
        >{props.selectItems}</CustomTextField>
        <Typography className={classes.helper} style={props.error ? {color: "red"} : null}
                    variant={"caption"}>{props.helperText}</Typography>

    </div>
})


//restyling material ui text field to fit our needs
const CustomTextField = withStyles({
    root: {
        backgroundColor: "white",
        borderRadius: "5px !important",
        flexGrow: 1,
        borderInlineWidth: "2px !important",
        transition: "all 0.5s ease",
    },
})(TextField)
