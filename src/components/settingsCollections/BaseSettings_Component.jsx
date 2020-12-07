//@flow
import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {Fab, useTheme} from "@material-ui/core";
import {TextField_Component} from "../inputs/TextField_Component";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {CloseRounded as CloseIcon, CloudUploadRounded, EditRounded} from "@material-ui/icons"
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
const useStyles = makeStyles((theme) => ({
    root: {padding: 20},
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
    const zieldatensatzPicker = useFilePicker();
    const dispatch = useDispatch();
    const alert = useAlert();
    const {acceptedFiles, getRootProps, getInputProps} = useDropzone({accept: 'text/plain, application/vnd.ms-excel, text/csv, text/x-csv', multiple: true});

    //mark: states
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [loading, setLoading] = useState(null);


    //<editor-fold desc="lifecycle">
    useEffect(() => {
        if (acceptedFiles.length === 0) {
            return;
        }
        setImportDialogOpen(true);
    }, [acceptedFiles])

    useEffect(() => {
        if (zieldatensatzPicker.files.length === 0) {
            return;
        }
        uploadTargetdataFile({
            file: zieldatensatzPicker.files[0],
            setProgress: p => setLoading({...loading, '0': {name: "Zieldatensatz: " + zieldatensatzPicker.files[0].name, error: null, progress: p}})
        })
            .then(r => {
                console.log("Uploaded!:", r)
                handleChange("zieldatensatz", r.id)
                setLoading(_.omit(loading, '0'))
                if (_.values(loading).length === 0) {
                    setLoading(null);
                }
            })
            .catch(e => setLoading({...loading, 0: {name: "Zieldatensatz", error: e, progress: -1}}))
    }, [zieldatensatzPicker.files])
    //</editor-fold>


    //<editor-fold desc="helpers">
    const onDelete = delete_id => {
        alert.show("Bist du sicher das du dieses Basischart löschen willst?", {
            title: "Bestätigen.",
            closeCopy: "Abbrechen",
            actions: [{
                copy: "Löschen",
                onClick: () => dispatch(removeBasechart(delete_id, props.project.projectId)),
            }]
        })
    }
    const handleChange = (caller: string, data) => {
        dispatch(modifyProject(props.project.projectId, caller, data))
    }

    function handleTableChange(newValue: string, row: Basechart, column: string) {
        dispatch(modifyBasechart(props.project, row, column, newValue))
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

    function renderDrop() {
        return <section className="container">
            <div {...getRootProps({className: 'dropzone'})}>
                <input {...getInputProps()} />
                <p>Ziehe deine Files hier hinein oder klicke um sie auszuwählen.</p>
            </div>
        </section>;
    }

    //</editor-fold>



//mark: render
    return <div className={classes.root}>
        <ImportBasechartDialog_Component files={acceptedFiles} setOpen={setImportDialogOpen} open={importDialogOpen}
                                         onDone={handleImportDialogDone}/>
        <Grid container direction="row"
              justify="center"
              alignItems="center"
              spacing={2}
        >
            <Grid item xs={12}>
                {renderUploadProgress()}
            </Grid>
            <Grid item xs={8}>
                <TextField_Component defaultValue={props.project ? props.project.projectTitle : ""}
                                     onDone={(e) => handleChange("projectTitle", e.target.value)}
                                     fullWidth={true}
                                     readOnly={props.detail}
                                     label={"Projektname"}
                                     placeholder={"Projektname..."}
                                     notWhite={true}/>
            </Grid>
            <Grid item xs={4}>
                <div className={classes.zieldatensatzUpload}>
                    <Typography variant={"caption"}
                                style={{marginBottom: 10}}>
                        {props.project?.zieldatensatz ? "Zieldatensatz hochgeladen" : "Zieldatensatz hochladen..."}
                    </Typography>
                    {props.project?.zieldatensatz ?
                        <div style={{display: "flex", flexDirection: "row"}}>
                            <p>{props.project.zieldatensatz}</p>
                            <IconButton disabled={props.detail}
                                        onClick={zieldatensatzPicker.onClick}><EditRounded/></IconButton>
                        </div>
                        :
                        <Fab
                            disabled={props.detail}
                            onClick={zieldatensatzPicker.onClick}
                            color={"primary"}
                            variant={"extended"}
                        >
                            <CloudUploadRounded
                                style={{marginRight: 20}}
                            />
                            Hochladen...
                        </Fab>}
                    <zieldatensatzPicker.HiddenFileInput accept={".csv"} multiple={false}/>
                </div>
            </Grid>

            <Grid item xs={12}>
                <CustomTable_Component
                    onDelete={onDelete}
                    deletable={true}
                    settings={{
                        header: header,
                        data: props.project ? (props.project.basecharts ?? []) : []
                    }}/>
            </Grid>
            <Grid item xs={12}>
                {renderDrop()}
            </Grid>
            <Grid item xs={12}>
                <TimeInput_Component readOnly={props.detail} timeunit={props.project.timeunit}
                                     onChange={(unit) => timeSlotChanged(unit)}/>
            </Grid>
        </Grid>

    </div>
}

export default connect()(BaseSettings_Component);
