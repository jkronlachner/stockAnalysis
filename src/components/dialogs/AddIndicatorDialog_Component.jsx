import React, {useEffect, useState} from "react";
import {makeStyles, useTheme} from "@material-ui/styles";
import Dialog from "@material-ui/core/Dialog";
import {Basechart, Indicator, Project} from "../../objects/project";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import {TextField_Component} from "../inputs/TextField_Component";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import DialogContent from "@material-ui/core/DialogContent";
import {IndicatorCreator_Component} from "../inputs/IndicatorCreator_Component";
import {Indicator_Component} from "../dataDisplay/Indicator_Component";
import Fab from "@material-ui/core/Fab";
import {AddRounded} from "@material-ui/icons";
import {Status} from "../../objects/enums/status.enum";
import {connect} from "react-redux";
import {IndicatorTemplate} from "../../objects/enums/indicatorTemplate";

//<editor-fold desc="Overhead">
const useStyles = makeStyles((theme) => ({
    paper: {
        padding: "40px 20px",
        zIndex: 0,
        minWidth: "90vw"
    },
    button: {
        marginTop: 20,
        height: 50,
        width: 250,
        borderRadius: 10,
        fontSize: 15,
        fontWeight: "bolder",
    },
    topDialog: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 20,
        paddingBottom: 20,
    },
    line: {
        height: 80,
        marginLeft: 40,
        zIndex: -1,
        width: 5,
        backgroundColor: theme.palette.text.secondary,
        marginBottom: -20
    },
    plus: {
        marginBottom: 0,
        marginTop: -100,
        marginLeft: 22,
        transition: "all .55s ease",
        opacity: 1,
        "&:hover": {
            opacity: 1
        }
    },
    basechart: {
        padding: 20,
        backgroundColor: theme.palette.background.default,
        borderRadius: 10,
    },
    root: {padding: "80px 40px"},
}));
type DialogProps = {
    open: boolean,
    setOpen: Function,
    project: Project,
    onDone: Function,
    indicatorTypes: IndicatorTemplate[],
};
//</editor-fold>
const AddIndicatorDialog_Component = (props: DialogProps) => {
    //MARK: hooks & requires
    const _ = require("lodash");
    const classes = useStyles();
    const theme = useTheme();
    //MARK: states
    const [selectedBasechart, setBasechart] = useState();
    const [indicators, setIndicators] = useState([]);
    const [dropdownError, setDropdownError] = useState();
    const [indicatorError, setIndicatorError] = useState();

    //Not used right now
    //const [indicatorTitleError, setIndicatorTitleError] = useState();
    //const [indicatorTitle, setIndicatorTitle] = useState();

    useEffect(() => {
        setIndicatorError(null);
        setDropdownError(null);
        setIndicators([]);
        setBasechart(null);
    }, [props.open])



    //<editor-fold desc="helpers">
    function handleCreateNew(index) {
        setIndicatorError(null);
        let copyOfIndicators = Array.from(indicators);
        copyOfIndicators = _.remove(copyOfIndicators, (n) => n.building === false);
        copyOfIndicators.splice(index, 0, {building: true,})
        setIndicators(copyOfIndicators);
    }
    function onCreate(indicator) {
        setIndicatorError(null);
        let copyOfIndicators = Array.from(indicators);
        const indexOfBuilder = copyOfIndicators.findIndex(value => value.building === true);
        if(!indicator){
            _.pullAt(copyOfIndicators, [indexOfBuilder])
        }else {
            copyOfIndicators = _.remove(copyOfIndicators, (n) => n.building === false);
            copyOfIndicators.length === 0 ? indicator._id = 1 : indicator._id = (_.last(copyOfIndicators)._id) + 1;
            copyOfIndicators.splice(indexOfBuilder, 0, indicator);
            //Add name of bottom indicator to be referenced.
            setBasechart(Object.assign({}, selectedBasechart, {columns: [...selectedBasechart.columns, indicator.indicatorReferenceName]}))
            console.log(selectedBasechart);
        }
        setIndicators(copyOfIndicators);
    }
    function handleDelete(index) {
        let copyOfIndicators = Array.from(indicators);
        _.pullAt(copyOfIndicators, index);
        setIndicators(copyOfIndicators);
    }
    function handleCreateIndicator() {
        if (!selectedBasechart) {
            setDropdownError("Du hast noch kein Basischart ausgewählt.")
            return;
        }
        if (!indicators || indicators.filter(v => v.building === false).length === 0) {
            setIndicatorError("Noch keine Indikatoren konfiguriert.")
            return;
        }
        if (!indicatorError && !dropdownError) {
            createIndicatorString();
        }
    }
    function createIndicatorString() {
        let indicatorString = "";
        indicators.forEach(value => {
            //TODO: Upgrade backend parser with new string
            indicatorString += `${value.indicatorType.name}(`
            //indicatorString += `${value.indicatorType.name}/${value.indicatorReferenceName}(`
        })
        indicatorString += "$BASECHART$()";
        indicators.reverse();
        indicators.forEach(value => {
            indicatorString += ")[" + value.parameters.map(v => v.value).join(",") + "]"
            if (_.isArrayLike(value.selectedColumn)) {
                indicatorString += "::" + value.selectedColumn.join("::")
            } else {
                indicatorString += "::" + value.selectedColumn
            }
        });
        let indicator = new Indicator(indicatorString, 0, selectedBasechart, Status.waiting);
        props.onDone(indicator);
    }
    function handleDropdownChange(event) {
        setDropdownError(null);
        setBasechart(props.project.basecharts.find(value => value.chartname === event.target.value));
    }
    //</editor-fold>

    //<editor-fold desc="render">
    return <Dialog
        BackdropProps={{style: {zIndex: "-3"}}}
        onBackdropClick={() => props.setOpen(false)}
        classes={{paper: classes.paper, root: classes.root}}
        fullWidth
        open={props.open}
    >
        <DialogTitle>
            <Typography variant={"h2"}>
                Indikatorenkombination
                <span style={{color: theme.palette.primary.main}}> erstellen.</span>
            </Typography>
            <div className={classes.topDialog}>
                <div
                    style={{marginRight: 20, flexGrow: 1}}
                >
                    <TextField_Component
                        onChange={handleDropdownChange}
                        className={classes.field}
                        notWhite
                        error={dropdownError}
                        helperText={dropdownError}
                        fullWidth
                        label={"Basischart"}
                        placeholder={"Basischart auswählen..."}
                        selectItems={props.project.basecharts ? props.project.basecharts.map(value => {
                            return <MenuItem key={value.chartname} value={value.chartname}>
                                {value.nickname}
                            </MenuItem>;
                        }) : null}
                    />
                </div>
                <Button className={classes.button} onClick={handleCreateIndicator} color={"primary"}
                        variant={"contained"}>Erstellen</Button>
            </div>
            <Typography variant={"caption"}>{indicatorError}</Typography>
        </DialogTitle>
        {selectedBasechart ? <DialogContent style={{overflowX: "scroll"}}>
            {indicators.length === 0 ? <span/> : <span><div className={classes.line}/>
                <Fab size={"small"} color={"primary"} onClick={() => handleCreateNew(0)}
                     className={[classes.plus].join(" ")}><AddRounded/></Fab></span>}
            {
                indicators.length === 0 ?
                    <IndicatorCreator_Component selectedBasechart={selectedBasechart}
                                                indicatorTypes={props.indicatorTypes} createCallback={onCreate} isFirstOne={true}/> :
                    indicators.map((value, index) => {
                        if (value.building) {
                            return <IndicatorCreator_Component selectedBasechart={selectedBasechart}
                                                               indicatorTypes={props.indicatorTypes}
                                                               createCallback={onCreate}/>
                        } else {
                            return <Indicator_Component indicator={value} onCreateNew={() => handleCreateNew(index + 1)}
                                                        onDelete={() => handleDelete(index)}/>
                        }
                    })
            }
            <div className={classes.basechart}>
                <Typography variant={"h2"}>Basechart: <span
                    style={{color: theme.palette.primary.main}}>{selectedBasechart?.nickname}</span></Typography>
            </div>
        </DialogContent> : <span/>}
    </Dialog>
    //</editor-fold>
}
const mapStateToProps = (state) => {
    return {
        indicatorTypes: state.indicators.filter((value: IndicatorTemplate) => value.basechart !== null)
    }
}
export default connect(mapStateToProps)(AddIndicatorDialog_Component)
