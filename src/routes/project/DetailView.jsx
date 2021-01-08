import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {useHistory, useParams} from "react-router-dom";
import {Project} from "../../objects/project";
import {connect, useSelector} from "react-redux";
import {getProject} from "../../service/backendServices/BackendService";
import {LoadingStatus} from "../../objects/enums/loading.enum";
import LinearProgress from "@material-ui/core/LinearProgress";
import {SettingsCell_Component} from "../../components/cells/SettingsCell_Component";
import BaseSettings_Component from "../../components/settingsCollections/BaseSettings_Component";
import {IndicatorSettings_Component} from "../../components/settingsCollections/IndicatorSettings_Component";
import {getLoadingStatus} from "../../redux/selectors/selectors";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import {ArrowBack} from "@material-ui/icons"

const useStyles = makeStyles((theme) => ({
    root: {padding: 20, overflow: "scroll"},
    bottomButton: {
        margin: 10,
        height: 60
    }
}));

const DetailView = ({loading}) => {
    //mark: hooks
    const classes = useStyles();
    const {id} = useParams();
    const history = useHistory();
    const project: Project = useSelector(state => {
        return (state.projects ?? {})[id] ? (state.projects ?? {})[id].project : null
    })
    //mark: states
    const [expanded, setExpanded] = useState("Basisdaten");


    //<editor-fold desc="lifecycle">
    useEffect(() => {
        console.log("Loading full project:")
        getProject(id);
    }, [])
    //</editor-fold>


    //<editor-fold desc="helpers">
    function getSubtitleForBasedata() {
        if (!project) {
            return "Noch keine Basisdaten importiert. "
        } else {
            if (!project.projectTitle) {
                return "Noch keine Basisdaten importiert. "
            } else {
                return `Projekt ${project.projectTitle} erstellt.`;
            }
        }
    }

    function getSubtitleForIndicators() {
        console.log(project);
        if (!project || !project.indicator) {
            return "Noch keine Indikatoren importiert"
        }
        if (project.indicator.length === 0) {
            return "Noch keine Indikatoren importiert. "
        } else {
            if (project.indicator.length === 1) {
                return "1 Indikator erstellt."
            }
            return `${project.indicator.length} Indikatoren erstellt.`;
        }

    }

    function getSubtitleForOptions() {
        if (!project) {
            return "Standartoptionen werden verwendet."
        } else {
            if (!project.options) {
                return "Standartoptionen werden verwendet."
            } else {
                return "Eigene Optionen werden verwendet."
            }
        }
    }

    function getSubtitleForRules() {
        if (!project) {
            return "Keine Regeln werden verwendet."
        } else {
            if (!project.rules) {
                return "Keine Regeln werden verwendet."
            } else {
                return `${project.rules.length} Regeln werden verwendet.`
            }
        }
    }

    function handleExpandedChange(title) {
        setExpanded(title);
    }

    //</editor-fold>


    //mark: render
    return <>{!project || loading.status === LoadingStatus.loading ?
        <LinearProgress variant={"query"} color={"primary"}/> :
        <div className={classes.root}>

            <Typography variant={"h1"}>Details: {project.projectTitle}</Typography>

            <SettingsCell_Component title={"Basisdaten"} subtitle={getSubtitleForBasedata()} disabled={!project}
                                    expandedView={<BaseSettings_Component detail={true} project={project}/>}
                                    expanded={expanded} handleChange={(title) => handleExpandedChange(title)}
            />
            <SettingsCell_Component title={"Indikatoren"} subtitle={getSubtitleForIndicators()}
                                    disabled={!project || !project.indicator}
                                    expandedView={<IndicatorSettings_Component project={project}/>}
                                    expanded={expanded} handleChange={(title) => handleExpandedChange(title)}
            />
            <SettingsCell_Component title={"Regeln"} subtitle={getSubtitleForRules()}
                                    expandedView={<h1>Es werden die Standartregeln verwendet. (BETA)</h1>}
                                    disabled={!project || (project.indicator ?? []).length === 0}
                                    expanded={expanded} handleChange={(title) => handleExpandedChange(title)}
            />
            <SettingsCell_Component title={"Optionen"} subtitle={getSubtitleForOptions()} disabled={!project}
                                    expandedView={<h1>Es werden die Standartregeln verwendet. (BETA)</h1>}
                                    expanded={expanded} handleChange={(title) => handleExpandedChange(title)}
            />
        </div>}
    </>
}
const mapStateToProps = state => {
    return {loading: getLoadingStatus(state)}
}
export default connect(mapStateToProps)(DetailView)
