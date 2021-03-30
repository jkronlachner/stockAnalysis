import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import DialogContent from "@material-ui/core/DialogContent";
import MobileStepper from "@material-ui/core/MobileStepper";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Papa from "papaparse";
import {Basechart} from "../../objects/project";
import Grid from "@material-ui/core/Grid";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Skeleton from "react-loading-skeleton";
import DialogActions from "@material-ui/core/DialogActions";
import Box from "@material-ui/core/Box";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import {TextField_Component} from "../inputs/TextField_Component";
import {useAlert} from "react-alert";

const _ = require('lodash');

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: "40px 20px",
        zIndex: 0,
    },
    doneButton: {
        width: "200px",
        height: "50px",

    }
}));
export const ImportBasechartDialog_Component = ({open, setOpen, onDone, files}) => {
    //mark: hooks
    const classes = useStyles();
    const alert = useAlert();
    const [step, setStep] = useState(0);
    const [basecharts, setBasecharts] = useState([]);
    const [doneButtonEnabled, setDoneButtonEnabled] = useState(false);


    //<editor-fold desc="lifecycle">
    useEffect(() => {
        //Parse new files into basecharts
        setBasecharts([]);
        let tempCharts = [];
        let promises = [];

        files.forEach(file => {
            const filePromise = new Promise(resolve => {
                Papa.parse(file, {
                    worker: true,
                    header: true,
                    fastMode: true,
                    preview: 4,
                    complete: (result) => {
                        if (result.meta.delimiter !== ',' && open) {
                            alert.show("Die Datei muss mit einem Beistrich \",\" getrennt sein!", {
                                title: "",
                                closeCopy: "",
                                actions: [{
                                    copy: "Okay",
                                    onClick: () => setOpen(false)
                                }]
                            })
                            return;
                        }
                        if (!result.meta.fields.toString().toLowerCase().includes("date")) {
                            alert.show("Da die Datei keinen Header mit dem Namen \"Date\" enhält wird angenommen das die erste Spalte die Datumsspalte ist. Falls dies nicht korrekt ist füge bitte den korrekten Header hinzu.", {
                                title: "",
                                closeCopy: "",
                                actions: [{
                                    copy: "Okay",
                                    onClick: () => {
                                        //Add provisional Headers
                                        tempCharts.push({
                                            name: file.name,
                                            grouped: false,
                                            basechart: new Basechart(),
                                            headers: result.meta.fields,
                                            provisionalHeaders: result.meta.fields.map((fieldName, index) => {
                                                if (index === 0) {
                                                    return "Date";
                                                } else {
                                                    return "Column " + index + "/ " + fieldName;
                                                }
                                            }),
                                            preview: result.data,
                                            nickname: file.name,
                                            selectedRows: []
                                        })
                                        resolve();
                                    }
                                }]
                            })
                            return;
                        } else {
                            tempCharts.push({
                                name: file.name,
                                grouped: false,
                                basechart: new Basechart(),
                                headers: result.meta.fields,
                                preview: result.data,
                                nickname: file.name,
                                selectedRows: []
                            })
                            resolve();
                        }

                    }
                })
            })
            promises.push(filePromise);
        })
        Promise.all(promises).then(() => setBasecharts(tempCharts))
    }, [files])
    useEffect(() => isDoneButtonDisabled(), [basecharts])
    useEffect(() => {
        setStep(0);
        setBasecharts([]);
        setDoneButtonEnabled(false);
    }, [open])
    //</editor-fold>


    //<editor-fold desc="helpers">
    const handleNext = () => {
        if (step === basecharts.length - 1) {
            return;
        }
        setStep((prevActiveStep) => prevActiveStep + 1);
    };
    const handleBack = () => {
        if (step === 0) {
            return;
        }
        setStep((prevActiveStep) => prevActiveStep - 1);
    };

    function updateGrouped(event) {
        let copy = _.clone(basecharts);
        copy[step].grouped = event.target.checked;
        copy[step].selectedRows = [];
        setBasecharts(copy);
    }

    function dialogDone() {
        setOpen(false);

        for (let i = 0; i < basecharts.length; i++) {
            basecharts[i].file = files[i];
            basecharts[i].uploadProgress = 0;
        }
        onDone(basecharts);
    }

    function dialogClose() {
        setOpen(false);
    }

    function handleNicknameChange(event) {
        let copy = _.clone(basecharts);
        basecharts[step].nickname = event.target.value;
        setBasecharts(copy);
    }

    function isDoneButtonDisabled() {

        setDoneButtonEnabled(_.every(basecharts, x => {
            if (x.grouped) {
                return x.selectedRows.CLOSE && x.selectedRows.OPEN && x.selectedRows.HIGH && x.selectedRows.LOW;
            }
            return x.selectedRows.length !== 0;
        }));
    }


    //</editor-fold>

    function getTableRow() {
        if (basecharts[step].provisionalHeaders) {
            console.log("b", basecharts[step])
            return basecharts[step].provisionalHeaders.map(header => <TableCell>{header}</TableCell>)
        } else {
            return basecharts[step].headers.map(header => <TableCell>{header}</TableCell>)
        }
    }

//<editor-fold desc="render helpers">
    function buildTable() {
        return <TableContainer>
            <Table style={{height: "200px"}}>
                <TableHead>
                    <TableRow>
                        {getTableRow()}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {basecharts[step].preview.map(row => {
                        return <TableRow>{
                            basecharts[step].headers.map((header, index) => {

                                return <TableCell>{row[header] ?? ""}</TableCell>;
                            })
                        }</TableRow>
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    }

    function renderCellAutocomplete(label: string, multiple: boolean) {
        return <Autocomplete
            options={basecharts[step].headers}
            value={multiple ? basecharts[step].selectedRows : basecharts[step].selectedRows[label]}
            onChange={(event, value, reason) => {
                let basechartsCopy = Array.from(basecharts)
                if (multiple) {
                    basecharts[step].selectedRows = value;
                } else {
                    basecharts[step].selectedRows[label] = value;
                }
                setBasecharts(basechartsCopy);
            }}
            multiple={multiple}
            renderInput={(params) => (
                <TextField_Component other={params} label={label} variant={"outlined"} fullWidth/>
            )}
        />;
    }

    function renderGroupSelector() {
        return <>
            <Grid item xs={3}>
                {renderCellAutocomplete("OPEN", false)}
            </Grid>
            <Grid item xs={3}>
                {renderCellAutocomplete("HIGH", false)}
            </Grid>
            <Grid item xs={3}>
                {renderCellAutocomplete("LOW", false)}
            </Grid>
            <Grid item xs={3}>
                {renderCellAutocomplete("CLOSE", false)}
            </Grid>
        </>
    }

    //</editor-fold>
    //mark: render
    return <Dialog
        BackdropProps={{style: {zIndex: "-3"}}}
        onBackdropClick={() => setOpen(false)}
        classes={{paper: classes.paper, root: {padding: "80px 40px"}}}
        fullWidth
        open={open}
        fullScreen
    >
        <DialogTitle>
            <Box display={"flex"} flexDirection={"row"} style={{justifyContent: "space-between"}} alignItems={"center"}>
                {basecharts.length > 0 ? <Typography variant={"h2"}>{basecharts[step].name}</Typography> :
                    <Skeleton height={80}/>}
                <DialogActions>
                    <Button fullWidth={true} onClick={dialogClose} variant={"text"}
                            color={"primary"}>Abbrechen</Button>
                    <Button className={classes.doneButton} disabled={!doneButtonEnabled} fullWidth={true}
                            onClick={dialogDone} variant={"contained"}
                            color={"primary"}>Fertig</Button>
                </DialogActions>
            </Box>
        </DialogTitle>
        <DialogContent>
            {basecharts.length > 0 ? <Box display={"flex"} flexDirection={"column"}>
                <div style={{marginTop: "2rem"}}>
                    <Typography variant={"subtitle2"}>Vorschau</Typography>
                    <Typography variant={"caption"}>Falls die Datei keinen Header hat können die Spalten nicht mehr
                        eindeutig identifiziert werden. Füge also bitte noch einen hinzu!</Typography>
                    {buildTable()}
                </div>
                <div style={{marginTop: "4rem"}}>
                    <Typography variant={"subtitle2"}>Ausgewähle Reihen</Typography>
                    <FormControlLabel
                        control={<Checkbox checked={basecharts[step].grouped} onChange={updateGrouped} color={"primary"}
                                           name="checkedA"/>}
                        label="Gruppen Basischart"
                    />
                    <Grid container spacing={2}>
                        {basecharts[step].grouped ?? false ? renderGroupSelector() : <Grid item xs={12}>
                            {renderCellAutocomplete("Ausgewähle Felder", true)}
                        </Grid>}
                    </Grid>
                </div>
                <div style={{marginTop: "2rem"}}>
                    <Typography variant={"subtitle2"}>Anderes</Typography>
                    <TextField_Component value={basecharts[step].nickname ?? ""} label={"Spitzname"}
                                         placeholder={basecharts[step].name} onChange={handleNicknameChange}/>
                </div>
            </Box> : <div>
                <Typography variant={"h1"}>Lade Files.</Typography>
                <Typography variant={"body1"}>Falls eines der Dateien über 50MB hat kann das eine Weile
                    dauern.</Typography>
            </div>}
        </DialogContent>
        {basecharts.length > 1 ? <MobileStepper
            activeStep={step}
            backButton={<Button size={"small"} onClick={handleBack}>Back</Button>}
            nextButton={<Button size={"small"} onClick={handleNext}>Next</Button>}
            steps={(files ?? []).length}
            position={"static"}
            variant={"dots"}
        /> : <></>}
    </Dialog>

}
