import React, {useState} from "react";
import {makeStyles} from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import {TextField_Component} from "../inputs/TextField_Component";
import Fab from "@material-ui/core/Fab";
import {AddRounded, DeleteRounded, InsertChart, InsertChartRounded} from "@material-ui/icons";
import {CustomTable_Component} from "../dataDisplay/Table_Component";
import AddIndicatorDialog_Component from "../dialogs/AddIndicatorDialog_Component";
import {useDispatch} from "react-redux";
import {addIndicator, modifyIndicator, removeBasechart, removeIndicator} from "../../redux/actions/project_actions";
import {useAlert} from "react-alert";
import {Indicator} from "../../objects/project";
import {generateIndicator} from "../../service/backendServices/IndicatorService";
import {CircularProgress} from "@material-ui/core";
import {Status} from "../../objects/enums/status.enum";
import ChartPreviewDialog_Component from "../dialogs/ChartPreviewDialog_Component";

const useStyles = makeStyles((theme) => ({
    root: {
        padding: 20,
    },
    buttonTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: theme.palette.primary.main
    },
    createButton: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    }
}));
const header = [
    {name: "Indikatoren", id: "definition"},
    {name: "Kombinationen", id: "combinations"},
    {name: "Basischart", id: "basechart.nickname"}
];

export const IndicatorSettings_Component = ({project}) => {
    //mark: hooks
    const classes = useStyles();
    const dispatch = useDispatch();
    const alert = useAlert();
    //mark: state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedIndicatorId, setSelectedIndicatorId] = useState("1");

    //<editor-fold desc="helpers">
    const onDelete = delete_id => {
        alert.show("Bist du sicher das du diesen Indikator löschen willst?", {
            title: "Bestätigen.",
            closeCopy: "Abbrechen",
            actions: [{
                copy: "Löschen",
                onClick: () => dispatch(removeIndicator(delete_id, project.projectId)),
            }]
        })

    }

    function handleDone(indicator: Indicator) {
        setDialogOpen(false);
        indicator.status = Status.processing;
        dispatch(addIndicator(indicator, project.projectId));
        generateIndicator(project, indicator.definition, indicator.basechart._id).then(r => {
                indicator = {...indicator};
                indicator.status = Status.passed;
                indicator.paths = r.data;
                dispatch(modifyIndicator(indicator, project.projectId));
                console.log("FINISHED PROCESSING INDICAOTR: " + r);
            }
        ).catch(e => {
            indicator = {...indicator};
            indicator.status = Status.error;
            dispatch(modifyIndicator(indicator, project.projectId));
            console.error(e);
        })
    }

    //</editor-fold>

    //mark: render
    return <><AddIndicatorDialog_Component open={dialogOpen} project={project} setOpen={setDialogOpen}
                                           onDone={handleDone}/>
           <ChartPreviewDialog_Component open={selectedIndicatorId !== null} setOpen={() => setSelectedIndicatorId(null)} projectId={project.projectId} indicatorId={selectedIndicatorId}/>
        <Grid direction="row"
              justify="center"
              alignItems="center"
              container
              spacing={2}>
            <Grid item xs={12} display={"flex"} flexdirection={"row"}>
                <div className={classes.createButton}>
                    <Fab style={{marginRight: 20}} color={"primary"} onClick={() => setDialogOpen(!dialogOpen)}>
                        <AddRounded fontSize={"large"}/>
                    </Fab>
                    <h1 className={classes.buttonTitle}>Neuen Indikator erstellen.</h1>
                </div>
            </Grid>
            <Grid item xs={12}>
                <CustomTable_Component actions={[
                    {
                        icon: () =>
                             <DeleteRounded
                                fontSize={"large"}
                                color={"primary"}
                            />,
                        onClick: (id) => onDelete(id)
                    },
                    {
                        icon: (indicator) => indicator.status === Status.passed ? <InsertChartRounded fontSize={"large"}
                                                                                                      color={"primary"}/> : <CircularProgress/>,
                        onClick: (id) => {
                            setSelectedIndicatorId(id)
                        }
                    }
                ]} settings={{header: header, data: project.indicator ?? []}} onDelete={onDelete}/>
            </Grid>
        </Grid></>
}
