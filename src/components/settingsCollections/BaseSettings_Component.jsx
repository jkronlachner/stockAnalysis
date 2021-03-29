//@flow
import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {Button, Divider, Fab, useTheme} from "@material-ui/core";
import {TextField_Component} from "../inputs/TextField_Component";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {
    CloseRounded as CloseIcon,
    CloudUploadRounded,
    DeleteRounded, EditAttributesRounded,
    EditRounded,
    MultilineChartRounded, NoteAddRounded
} from "@material-ui/icons"
import {CustomTable_Component} from "../dataDisplay/Table_Component";
import {connect, useDispatch} from "react-redux";
import {Basechart, Project} from "../../objects/project";
import {addBasechart, modifyBasechart, modifyProject, removeBasechart} from "../../redux/actions/project_actions";
import {useFilePicker} from 'react-sage';
import IconButton from "@material-ui/core/IconButton";
import {TimeInput_Component} from "../inputs/TimeInput_Component";
import {ImportBasechartDialog_Component} from "../dialogs/ImportBasechartDialog_Component";
import {uploadFile, uploadTargetdataFile} from "../../service/backendServices/ProjectService";
import {Alert} from '@material-ui/lab';
import LinearProgress from "@material-ui/core/LinearProgress";
import {useDropzone} from "react-dropzone";
import {useAlert} from "react-alert";
import {hasIndicator} from "../../redux/selectors/selectors";
import ChartPreviewDialog_Component from "../dialogs/ChartPreviewDialog_Component";
import {TargetDataEditor} from "../dialogs/TargetDataEditor";
import {convertToFileAndUploadToServer} from "../../service/backendServices/TargetDataEditorService";

const _ = require('lodash');


const header = [
    {
        name: "Name",
        id: "chartname"
    },
    {
        name: "Spitzname",
        id: "nickname"
    },
    {
        name: "Spaltenname",
        id: "columns"
    }
];
const targetDataHeader = [
    {
        name: "Name",
        id: "filename",
    }
]
const useStyles = makeStyles((theme) => ({
    baseSettingsRoot: {padding: 20},
    zieldatensatzUpload: {
        display: "flex",
        flexDirection: "column",
    },
    uploadButton: {
        textDecorationLine: "underline",
        fontWeight: "bold",
        cursor: "pointer"

    },
    uploadAlert: {
        width: 250,
    },
    progress: {
        position: "absolute",
        left: 15,
        top: 0,
    },
    dropContainer: {
        padding: 0,
    }
}));
type Props = {
    project: Project,
    detail: boolean
}

function BaseSettings_Component(props: Props) {
    //mark: hooks
    const classes = useStyles();
    const theme = useTheme();
    const dispatch = useDispatch();
    const alert = useAlert();
    const {
        acceptedFiles,
        getRootProps,
        getInputProps
    } = useDropzone({accept: ['application/vnd.ms-excel, text/csv, text/x-csv', '.csv'], multiple: true});
    const targetDataDropzone = useDropzone({accept: ['application/vnd.ms-excel, text/csv, text/x-csv','.csv'], multiple: false})

    //mark: states
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [loading, setLoading] = useState(null);
    const [targetDataOpen, setTargetDataOpen] = useState(false);
    const [chartPreviewDialog, setChartPreviewDialog] = useState({
        basechartId: null, open: false
    })


    //<editor-fold desc="lifecycle">
    useEffect(() => {
        console.log("Acccepted Files are: ", acceptedFiles)
        if (acceptedFiles.length === 0) {
            return;
        }
        setImportDialogOpen(true);
    }, [acceptedFiles])

    useEffect(() => {
        if (targetDataDropzone.acceptedFiles.length === 0) {
            return;
        }
        uploadTargetdataFile({
            file: targetDataDropzone.acceptedFiles[0],
            setProgress: p => setLoading({
                ...loading,
                '0': {name: "Zieldatensatz: " + targetDataDropzone.acceptedFiles[0].name, error: null, progress: p}
            })
        })
            .then(r => {
                console.log("Uploaded!:", r)
                handleChange("zieldatensatz", {id: r, filename: targetDataDropzone.acceptedFiles[0].name})
                setLoading(_.omit(loading, '0'))
                if (_.values(loading).length === 0) {
                    setLoading(null);
                }
            })
            .catch(e => setLoading({...loading, 0: {name: "Zieldatensatz", error: e, progress: -1}}))
    }, [targetDataDropzone.acceptedFiles])

    //</editor-fold>


    //<editor-fold desc="helpers">
    const onDelete = delete_id => {
        if (hasIndicator(props.project, delete_id)) {
            alert.show("Du hast mit diesem Basischart bereits einen Indikator angelegt. Bitte entferne diesen zuerst.", {
                title: "Achtung.",
                closeCopy: "Okay",
                actions: []
            })
        } else {
            alert.show("Bist du sicher das du dieses Basischart löschen willst?", {
                title: "Bestätigen.",
                closeCopy: "Abbrechen",
                actions: [{
                    copy: "Löschen",
                    onClick: () => dispatch(removeBasechart(delete_id, props.project.projectId)),
                }]
            })
        }

    }
    const handleChange = (caller: string, data) => {
        dispatch(modifyProject(props.project.projectId, caller, data))
    }

    function timeSlotChanged(unit) {
        handleChange("timeunit", unit)
    }

    function handleImportDialogDone(args) {

        let index: number = 0;
        if (props.project.basecharts) {
            index = _.last(props.project.basecharts) == null ? 0 : _.last(props.project.basecharts)._id;
            index++;
        }
        for (let row of args) {
            let basechart = new Basechart();
            console.log("row " + row.name);
            basechart.grouped = row.grouped;
            basechart.chartname = row.name;
            basechart.columns = row.grouped ? _.values(row.selectedRows) : row.selectedRows;
            basechart.editable = true;
            basechart.nickname = row.nickname;
            basechart.uploadProgress = 0;
            //Upload Basechart in each Project.
            uploadFile(
                {
                    file: row.file,
                    nickname: row.nickname,
                    columns: row.selectedRows,
                    setProgress: p => setLoading({...loading, [index]: {name: row.name, error: null, progress: p}})
                }
            )
                .then(x => {
                        basechart._id = x;
                        console.log("Adding basechart with id: ", basechart, x)

                        dispatch(addBasechart(props.project, basechart))
                        setLoading(_.omit(loading, index + ''));
                        if (_.values(loading).length === 0) {
                            setLoading(null);
                        }
                    }
                )
                .catch(e => {
                    console.log("promise in upload failed with: " + e);
                    console.error(e);
                    setLoading({...loading, [row._id]: {name: row.name, error: e, progress: -1}})
                })
        }
    }

    function showAlert() {
        alert.show("0: Nichts tun. 1: Kaufen. 0.5: Verkaufen", {
            title: "Der Zieldatensatz soll eine Datumsspalte enthalten und einen zusätzlichen Wert der entweder 0, 0.5 oder 1 sein kann.",
            closeCopy: "Okay",
            actions: []
        });
    }

    function fileGeneratedCallback(fileContents: String) {
        convertToFileAndUploadToServer(fileContents, p => setLoading({
            ...loading,
            '0': {name: "Generating Zieldatensatz...", error: null, progress: p}
        })).then(response => {
            handleChange("zieldatensatz", {id: response.id, filename: response.filename})
        }).catch(e => setLoading({...loading, 0: {name: "Zieldatensatz", error: e, progress: -1}}))
    }


    //</editor-fold>

    //<editor-fold desc="render helpers">
    function renderUploadProgress() {
        if (loading) {
            const alerts = [];
            _.mapValues(loading, (v) => {
                console.log("Upload progress for: ", v);
                if (v) {
                    if (v.error) {
                        alerts.push(
                            <div>
                                {v.name} failed to upload!
                                <hr/>
                            </div>
                        );
                    } else {
                        alerts.push(
                            <div>
                                Uploading: {v.name}
                                <LinearProgress value={v.progress} variant={"determinate"} style={{width: "50vw"}}/>
                                <hr/>
                            </div>
                        )
                    }
                }
            })
            return <Alert action={
                <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setLoading(null)}
                >
                    <CloseIcon fontSize="inherit"/>
                </IconButton>
            } severity="info">
                {alerts}
            </Alert>
        }

    }

    function renderDrop(basedata: boolean) {
        var rootProps;
        var inputProps;
        if (basedata) {
            rootProps = getRootProps({className: 'dropzone'});
            inputProps = getInputProps();
        } else {
            rootProps = targetDataDropzone.getRootProps({className: 'dropzone'});
            inputProps = targetDataDropzone.getInputProps();
        }
        return <section className={classes.dropContainer}>
            <div {...rootProps}>
                <input {...inputProps} style={{margin: 20}} />
                {basedata ? <Typography variant={"body2"}>Ziehe deine Basisdaten hier hinein oder klicke um sie
                        auszuwählen.</Typography> :
                    <Typography variant={"body2"}>Ziehe deinen Zieldatensatz hier hinein oder klicke um ihn
                        auszuwählen.</Typography>}
            </div>
        </section>;
    }


    //</editor-fold>


//mark: render
    return <div className={classes.baseSettingsRoot}>
        <ChartPreviewDialog_Component projectId={props.project.projectId} basechartId={chartPreviewDialog.basechartId}
                                      open={chartPreviewDialog.open}
                                      setOpen={(open) => setChartPreviewDialog(Object.assign({}, chartPreviewDialog, {open: open}))}/>
        <ImportBasechartDialog_Component files={acceptedFiles} setOpen={setImportDialogOpen} open={importDialogOpen}
                                         onDone={handleImportDialogDone}/>
        <TargetDataEditor project={props.project} setOpen={setTargetDataOpen} open={targetDataOpen}
                          fileGeneratedCallback={fileGeneratedCallback}/>

        <Grid container direction="row"
              justify="center"
              alignItems="center"
              spacing={4}
        >
            <Grid item xs={12}>
                {renderUploadProgress()}
            </Grid>
            <Grid item xs={12}>
                <TextField_Component defaultValue={props.project ? props.project.projectTitle : ""}
                                     onDone={(e) => handleChange("projectTitle", e.target.value)}
                                     fullWidth={true}
                                     readOnly={props.detail}
                                     label={"Projektname"}
                                     placeholder={"Projektname..."}
                                     notWhite={true}/>
            </Grid>

            <Grid item xs={12} spacing={2}>
                <Typography variant={"h2"}
                            style={{marginBottom: 10}}>
                    Basisdaten hochladen.
                </Typography>
                <CustomTable_Component
                    actions={[
                        {
                            icon: () => <MultilineChartRounded
                                fontSize={"large"}
                                color={"primary"}
                            />,
                            onClick: (id) => {
                                setChartPreviewDialog({
                                    open: true,
                                    basechartId: id
                                })
                            }
                        },
                        !props.detail ? {
                            icon:
                                () => <DeleteRounded
                                    fontSize={"large"}
                                    color={"primary"}
                                />,
                            onClick: (id) => onDelete(id)
                        } : {icon: () => null}

                    ]}
                    deletable={true}
                    settings={{
                        header: header,
                        data: props.project ? (props.project.basecharts ?? []) : []
                    }}/>
            </Grid>
            <Grid item xs={12}>
                {renderDrop(true)}
            </Grid>
            <Grid item xs={12}>
                <Divider variant={"middle"}/>
            </Grid>
            <Grid item xs={12}>
                <Typography variant={"h2"}
                            style={{marginBottom: 10}}>
                    {"Zieldatensatz hochladen."}
                </Typography>
                <Typography variant={"body2"}>Zieldatensatz generieren: </Typography>

                <Button variant={"outlined"} onClick={() => setTargetDataOpen(true)}
                        style={{marginBottom: 20}}
                        disabled={!props.project.basecharts || props.project.basecharts.length === 0 || props.detail}>Zieldatensatz
                    generieren</Button>
                <Typography variant={"body2"}>oder bestehenden Zieldatesatz hochladen:</Typography>
                {props.project.zieldatensatz ? <CustomTable_Component
                    actions={[
                        {
                            icon: () => <DeleteRounded
                                fontSize={"large"}
                                color={"primary"}
                            />,
                            onClick: (id) => {
                                handleChange("zieldatensatz", null)
                            }
                        }
                    ]}
                    settings={{
                        header: targetDataHeader,
                        data: [{
                            _id: props.project.zieldatensatz.filename,
                            filename: props.project.zieldatensatz.filename
                        }]
                    }}
                /> : <></>}
                {renderDrop(false)}
                <Typography variant={"body2"} style={{textDecoration: "underline", cursor: "pointer", paddingTop: 20}}
                            onClick={showAlert}>Wie soll so ein Zieldatensatz aussehen?</Typography>
            </Grid>
            <Grid item xs={12}>
                <TimeInput_Component readOnly={props.detail} timeunit={props.project.timeunit}
                                     onChange={(unit) => timeSlotChanged(unit)}/>
            </Grid>
        </Grid>

    </div>
}

export default connect()(BaseSettings_Component);
