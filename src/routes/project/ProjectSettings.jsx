import React, {useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {SettingsCell_Component} from "../../components/cells/SettingsCell_Component";
import {useHistory, useParams} from "react-router-dom";
import LinearProgress from "@material-ui/core/LinearProgress";
import BaseSettings_Component from "../../components/settingsCollections/BaseSettings_Component";
import {IndicatorSettings_Component} from "../../components/settingsCollections/IndicatorSettings_Component";
import {getLoadingStatus} from "../../redux/selectors/selectors";
import {connect, useDispatch, useSelector} from "react-redux";
import {Project} from "../../objects/project";
import Button from "@material-ui/core/Button";
import {LoadingStatus} from "../../objects/enums/loading.enum";
import {createProject, getProjects} from "../../service/backendServices/BackendService";
import {Transition} from "react-transition-group";
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import {deleteProject} from "../../redux/actions/project_actions";

const _ = require("lodash");

const useStyles = makeStyles((theme) => ({
    projectSettingsRoot: {padding: 20},
    bottomButton: {
        margin: 10,
        height: 60
    }
}));

const ProjectSettings = ({loading}) => {
    //MARK: hooks
    const classes = useStyles();
    const {id} = useParams();
    const dispatch = useDispatch();
    const project: Project = useSelector(state => {
        return (state.projects ?? {})[id] ? (state.projects ?? {})[id].project : null
    })
    const history = useHistory();
    //MARK: states
    const [uploading, isUploading] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [expanded, setExpanded] = useState("Basisdaten");
    const [errors, setErrors] = useState([]);

    //<editor-fold desc="Helpers">
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
        if(!project.basecharts){
            return "Zuerst Basisdaten importieren!"
        }
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

    function drawError() {
        if(loading.status === LoadingStatus.error){
            return <h1>Fehler</h1>
        }else{
            return <></>
        }
    }

    function handleExpandedChange(title) {
        setExpanded(title);
    }

    function createProj(){
        isUploading(LoadingStatus.loading);
        //Create a new Project
        createProject(project).then(() => {
            //Delete Draft from local save
            dispatch(deleteProject(project.projectId));
            //Load Project into Store
            getProjects().then(() => {
                //Go to Dashboard with newly loaded Project
                history.push('/dashboard')
            })
        }).catch(() => isUploading(LoadingStatus.error));
    }

    //Returns true if there are no errors
    function checkForProjectErrors() {
        const errorMessages = [];
        console.log("Project check!: ", project)
        if (!project.zieldatensatz || project.zieldatensatz === "" || project.zieldatensatz === null) {
            errorMessages.push("Du hast noch keinen Zieldatensatz hochgeladen. Bitte tu dies unter: \"Basisdaten\" \n")
        }
        if (!project.basecharts || project.basecharts.length === 0) {
            errorMessages.push("Du hast noch keine Basisdaten hochgeladen. Bitte tu dies unter: \"Basisdaten\" \n")
        }
        if (!project.indicator || project.indicator.length === 0) {
            //Should indicators be optional?
            errorMessages.push("Du hast noch keine Indikatoren erstellt. Bitte tu dies unter: \"Indikatoren\" \n")
        }
        setErrors(errorMessages);
        return errorMessages.length === 0
    }

    //</editor-fold>


    //<editor-fold desc="render helpers">
    function renderErrorDialog() {
        return <Dialog open={errors.length !== 0}><DialogTitle
            id="alert-dialog-slide-title">{"Dein Projekt hat folgende Fehler:"}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <ul>
                        {errors.map(x => <li>{x}</li>)}
                    </ul>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setErrors([])} color="primary">
                    Ups...
                </Button>
            </DialogActions></Dialog>
    }

    function renderDialog() {
        function renderConfirmation() {
            return <div><DialogTitle id="alert-dialog-slide-title">{"Projekt hochladen?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Wenn du das Projekt hochlädst wird versucht ein Neurales Netz mit deinen Daten zu trainieren. Du
                        kannst also dein Projekt nicht mehr bearbeiten.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={createProj} color="primary">
                        Los gehts!
                    </Button>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="secondary">
                        Noch nicht.
                    </Button>
                </DialogActions></div>
        }

        function renderUploading(){
            return <div><DialogTitle id="alert-dialog-slide-title">{uploading === LoadingStatus.loading ? "Projekt wird hochgeladen..." : "Projekt konnte nicht hochgeladen werden..."}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {uploading === LoadingStatus.loading ? "Dein Projekt wird gerade hochgeladen. Du wirst danach zurück aufs Dashboard gelangen." : "Projekt konnte nicht hochgeladen werden..."}
                    </DialogContentText>
                </DialogContent>
                {uploading === LoadingStatus.error ? <DialogActions>
                    <Button onClick={() => {
                        isUploading(null);
                        setConfirmDialogOpen(false);
                    }} color="secondary">
                        Abbrechen
                    </Button>
                    <Button onClick={() => {
                        createProj();
                        isUploading(LoadingStatus.loading)
                    }} color="primary">
                        Versuchs noch einmal!
                    </Button>
                </DialogActions>: null}</div>
        }


        return <Dialog
            open={confirmDialogOpen || uploading}
            TransitionComponent={Transition}
            keepMounted
        >
            {uploading ? renderUploading() : renderConfirmation()}
        </Dialog>;
    }

    //</editor-fold>

    //mark: render
    return <>{drawError()}{!project ? <LinearProgress color={"primary"}/> :
        <div className={classes.projectSettingsRoot}>
            {renderDialog()}
            {renderErrorDialog()}
            <SettingsCell_Component title={"Basisdaten"} subtitle={getSubtitleForBasedata()} disabled={!project}
                                    expandedView={<BaseSettings_Component project={project}/>}
                                    expanded={expanded} handleChange={(title) => handleExpandedChange(title)}
            />
            <SettingsCell_Component title={"Indikatoren"} subtitle={getSubtitleForIndicators()}
                                    disabled={!project || !project.basecharts}
                                    expandedView={<IndicatorSettings_Component project={project}/>}
                                    expanded={expanded} handleChange={(title) => handleExpandedChange(title)}
            />
            {/**<SettingsCell_Component title={"Optionen"} subtitle={getSubtitleForOptions()} disabled={!project}
                                    expandedView={<h1>Es werden die Standartregeln verwendet. (BETA)</h1>}
                                    expanded={expanded} handleChange={(title) => handleExpandedChange(title)}
            />**/}
            <hr/>
            <Button onClick={() => {
                if (checkForProjectErrors()) {
                    setConfirmDialogOpen(true)
                }
            }} color={"primary"} className={classes.bottomButton} variant={"contained"}
                    fullWidth>Projekt
                erstellen</Button>
        </div>}
    </>
}

const mapStateToProps = state => {
    return {loading: getLoadingStatus(state)}
}
export default connect(mapStateToProps)(ProjectSettings)
