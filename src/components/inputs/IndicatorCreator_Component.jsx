import React, {createRef, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {TextField_Component} from "./TextField_Component";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {Basechart} from "../../objects/project";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {IndicatorTemplate} from "../../objects/enums/indicatorTemplate";

const _ = require("lodash");

const useStyles = makeStyles((theme) => ({
    container: {
        backgroundColor: theme.palette.background.default,
        padding: 20,
        borderRadius: 10,
        display: "flex",
        marginBottom: 40,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    indicatorDefinitions: {
        width: "70%",
    },
    descriptions: {
        display: "flex",
        flexDirection: "column",
        width: "30%",
        justifyContent: "center",
        alignItems: "center",
    },
    description: {
        width: "100%",
        overflowX: "scroll",
        textAlign: "center",
    },
    button: {
        marginTop: 20,
        marginLeft: "auto",
        marginRight: "auto",
        height: 50,
        width: 300,
        borderRadius: 10,
        fontSize: 15,
        fontWeight: "bolder",
    },
}));


type IndicatorCreatorProps = {
    indicatorTypes: IndicatorTemplate[],
    createCallback: Function,
    selectedBasechart: Basechart,
    isFirstOne: boolean,
};

export const IndicatorCreator_Component = (props: IndicatorCreatorProps) => {
    //mark: hooks
    const classes = useStyles();
    //mark: states
    const [selectedIndicator, setSelectedIndicator] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState([]);
    const [indicatorReferenceName, setIndicatorReferenceName] = useState("");
    const [error, setError] = useState("");
    //mark: default vars
    let refs: Map<any, any> = {};

    //<editor-fold desc="helpers">
    function onCreate() {
        if (!checkInputs()) {
            setError("Indikator konnte nicht hinzugefügt werden, sind alle Felder ausgefüllt?");
            return
        }
        let indicatorParameters = []
        console.log(refs);
        _.forEach(refs, (value, key) => {
            if(!value.value){return}
            indicatorParameters.push({
                name: key,
                value: value.value === "" ? selectedIndicator.parameters.find(value1 => value1.name === key).value : value.value,
                textfieldType: value.type
            });
        });
        const indicator = {
            building: false,
            indicatorType: {...selectedIndicator},
            parameters: indicatorParameters,
            selectedColumn: selectedColumn,
            selectedBasechart: props.selectedBasechart,
            indicatorReferenceName: indicatorReferenceName,
        }
        props.createCallback(indicator);
    }

    function checkInputs() {
        _.forEach(refs, (v, k) => {
            if (v.value === "") {
                return false;
            }
        })
        if (indicatorReferenceName === "") {
            return false;
        }
        if (!selectedIndicator) {
            return false;
        }
        if (selectedColumn.length === 0) {
            return false;
        }
        return true;
    }

    function onCancel() {
        props.createCallback();
    }

    function handleChange(e) {
        setError("");
        const indicatorId = e.target.value;
        setSelectedIndicator(props.indicatorTypes.find(value => value.name === indicatorId))
    }

    function handleIndicatorNameChange(e) {
        setError("");
        const name = e.target.value;
        setIndicatorReferenceName(name);
    }

    function getAutocompleteName(x) {
        switch (x) {
            case 0:
                return "OPEN";
            case 1:
                return "HIGH";
            case 2:
                return "LOW";
            case 3:
                return "CLOSE";
        }
    }

    function renderAutocomplete(value, onChange, name) {
        return <Grid item xs={3}><Autocomplete
            options={props.selectedBasechart.columns}
            value={value}
            onChange={(event, changeValue, reason) => {
                //TODO: implement remove reason
                onChange(changeValue)
            }}
            multiple={false}
            renderInput={(params) => (
                <TextField_Component other={params} label={name} variant={"outlined"} fullWidth/>
            )}
        /></Grid>;
    }

    function renderGroupedAutocomplete() {
        return <Grid container spacing={2} direction={"row"}>
            {
                [0, 1, 2, 3].map((x) =>
                    renderAutocomplete(selectedColumn[x], (value) => {
                        setError("")
                        const selectedCols = _.cloneDeep(selectedColumn);
                        selectedCols[x] = value;
                        setSelectedColumn(selectedCols);
                    }, getAutocompleteName(x)))
            }
        </Grid>
    }

    //</editor-fold>

    //mark: renders
    return <div className={classes.container}>
        <div className={classes.indicatorDefinitions}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField_Component onChange={handleChange}
                                         selectItems={props.indicatorTypes.map((value: IndicatorTemplate) => {
                                             return <MenuItem key={value.name} value={value.name}>
                                                 {value.name}
                                             </MenuItem>
                                         })} fullWidth label={"Indikator"}/>
                    <TextField_Component onChange={handleIndicatorNameChange}
                                         helperText={"Keine Sonderzeichen! Nur Buchstaben und Zahlen!"} fullWidth
                                         label={"Indikatorname"} value={indicatorReferenceName}/>
                </Grid>
                <Grid item xs={12}>
                    {selectedIndicator ?
                        selectedIndicator.basechart.includes("grouped") ?
                            renderGroupedAutocomplete() :
                            renderAutocomplete(selectedColumn[0], (value) => setSelectedColumn([value]), "Ausgewählte Spalte")
                        : <div/>}
                </Grid>
            </Grid>
            <Grid spacing={2} container className={classes.parameters}>
                {selectedIndicator && selectedIndicator.parameters ? selectedIndicator.parameters.map(value => {
                    //Create Refs for from and for to field!
                    refs[value.name+"-from"] = (createRef())
                    refs[value.name+"-to"] = (createRef())
                    return <><Grid xs={3} item>
                        <TextField_Component ref={element => refs[value.name + "-from"] = element}
                                             placeholder={value.name}
                                             label={"(FROM) " + value.description} type={value.textfieldType}/>
                    </Grid>
                        <Grid xs={3} item>
                            <TextField_Component ref={element => refs[value.name + "-to"] = element}
                                                 placeholder={value.name}
                                                 label={"(TO)" + value.description} type={value.textfieldType}/>
                        </Grid></>
                }) : selectedIndicator ? <p>Mit diesem Indikator stimmt etwas nicht! Es konnten keine Parameter gefunden werden!</p> : <div/>}
            </Grid>

        </div>
        <div className={classes.descriptions}>
            <Typography variant={"body1"} className={classes.description}>
                {selectedIndicator ? selectedIndicator.description : "Wähle zuerst einen Indikator aus den verfügbaren aus. "}
            </Typography>
            <Button className={classes.button} onClick={onCreate} color={"primary"} variant={"contained"}>Indikator
                hinzufügen</Button>
            {!props.isFirstOne ? <Button className={classes.button} onClick={onCancel} color={"primary"}
                                         variant={"text"}>Abbrechen</Button> : <div></div>}
            {error !== "" ? <Typography variant={"caption"}>{error}</Typography> : <div></div>}
        </div>
    </div>
}
