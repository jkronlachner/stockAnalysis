import {makeStyles} from "@material-ui/styles";
import React from "react";
import {LightTheme} from "../../themes/theme";
import Typography from "@material-ui/core/Typography";
import {KeyboardArrowDownRounded} from "@material-ui/icons";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Accordion from "@material-ui/core/Accordion";

const theme = LightTheme;
const useStyles = makeStyles((/*theme*/) => ({
    accorionRoot: {
        borderRadius: 10,
        backgroundColor: theme.palette.background.default,
        boxShadow: "none",
        "&:hover $title": {
            color: theme.palette.primary.main,
        },
        height: 100,
    },
    root_expanded: {
        boxShadow: "0 0 10px 1px " + theme.palette.shadowColor.main,
        height: "auto"
    },
    title: {
        transition: "all 0.55s ease-out",
    },
    information: {
        margin: 20,
        display: "flex",
        flexDirection: "column",
    },
}))

export const SettingsCell_Component = ({title, subtitle, expandedView, disabled = false, expanded, handleChange}) => {
    //MARK: Hooks
    const classes = useStyles();

    //MARK: Render
    return <>
        <Accordion expanded={expanded === title} onChange={() => handleChange(title)}  variant={"outlined"} disabled={disabled} style={{borderRadius: 10}} square={false} classes={{expanded: classes.root_expanded, root: classes.accorionRoot}}>
        <AccordionSummary className={classes.accorionRoot} expandIcon={<div className={classes.icon}>
            <KeyboardArrowDownRounded
                style={{fontSize: 50}}
                color={"primary"}/>
        </div>}>
            <div className={classes.information} style={{backgroundColor: theme.palette.background.default}}>
                <Typography className={classes.title} variant={"h2"}>{title}</Typography>
                <Typography variant={"body1"}>{subtitle}</Typography>
            </div>
        </AccordionSummary>
        <AccordionDetails style={{backgroundColor: theme.palette.background.default}}>
            {expandedView}
        </AccordionDetails>
        </Accordion>
    </>
}
