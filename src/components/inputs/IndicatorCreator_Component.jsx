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
    root: {
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
    selectedBasechart: Basechart
};

export const IndicatorCreator_Component = (props: IndicatorCreatorProps) => {
    //mark: hooks
    const classes = useStyles();
    //mark: states
    const [selectedIndicator, setSelectedIndicator] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState([]);
    //mark: default vars
    let refs: Map<any, any> = {};

    //<editor-fold desc="helpers">
    function onCreate() {
        let indicatorParameters = []
        _.forEach(refs, (value, key) => {
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
            selectedBasechart: props.selectedBasechart
        }
        props.createCallback(indicator);
    }
    function handleChange(e) {
        const indicatorId = e.target.value;
        setSelectedIndicator(props.indicatorTypes.find(value => value.name === indicatorId))
    }
    function getAutocompleteName(x) {
        switch(x){
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
                        const selectedCols = _.cloneDeep(selectedColumn);
                        selectedCols[x] = value;
                        setSelectedColumn(selectedCols);
                    }, getAutocompleteName(x)))
            }
        </Grid>
    }

    //</editor-fold>

    //mark: renders
    return <div className={classes.root}>
        <div className={classes.indicatorDefinitions}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField_Component onChange={handleChange} selectItems={props.indicatorTypes.map((value: IndicatorTemplate) => {
                        return <MenuItem key={value.name} value={value.name}>
                            {value.name}
                        </MenuItem>
                    })} fullWidth label={"Indikator"}/>
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
                {selectedIndicator ? selectedIndicator.parameters.map(value => {
                    refs[value.name] = (createRef())
                    return <Grid xs={3} item>
                        <TextField_Component ref={element => refs[value.name] = element} placeholder={value.name}
                                             label={value.description} type={value.textfieldType}/>
                    </Grid>
                }) : <div/>}
            </Grid>

        </div>
        <div className={classes.descriptions}>
            <Typography variant={"body1"} className={classes.description}>
                {selectedIndicator ? selectedIndicator.description : "Wähle zuerst einen Indikator aus den verfügbaren aus. "}
            </Typography>
            <Button className={classes.button} onClick={onCreate} color={"primary"} variant={"contained"}>Indikator
                hinzufügen</Button>
        </div>
    </div>
}
