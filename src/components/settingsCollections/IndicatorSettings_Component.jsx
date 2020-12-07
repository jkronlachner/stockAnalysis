import React, {useState} from "react";
import {makeStyles} from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import {TextField_Component} from "../inputs/TextField_Component";
import Fab from "@material-ui/core/Fab";
import {AddRounded} from "@material-ui/icons";
import {CustomTable_Component} from "../dataDisplay/Table_Component";
import {AddIndicatorDialog_Component} from "../dialogs/AddIndicatorDialog_Component";
import {useDispatch} from "react-redux";
import {addIndicator, removeBasechart, removeIndicator} from "../../redux/actions/project_actions";
import {useAlert} from "react-alert";

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

    function handleDone(indicator) {
        setDialogOpen(false);
        dispatch(addIndicator(indicator, project.projectId));
    }

    //</editor-fold>

    //mark: render
    return <><AddIndicatorDialog_Component open={dialogOpen} project={project} setOpen={setDialogOpen}
                                           onDone={handleDone}/>
        <Grid direction="row"
              justify="center"
              alignItems="center"
              container
              spacing={2}>
            <Grid item xs={8}>
                <TextField_Component fullWidth
                                     disabled
                                     notWhite={true}
                                     label={"Bereits erstellten Indikator hinzufügen"}
                                     placeholder={"Indikatorenkombinationsname …"}
                />

            </Grid>
            <Grid item xs={4} display={"flex"} flexdirection={"row"}>
                <div className={classes.createButton}>
                    <Fab style={{marginRight: 20}} color={"primary"} onClick={() => setDialogOpen(!dialogOpen)}>
                        <AddRounded fontSize={"large"}/>
                    </Fab>
                    <h1 className={classes.buttonTitle}>Neuen Indikator erstellen.</h1>
                </div>
            </Grid>
            <Grid item xs={12}>
                <CustomTable_Component deletable={true} settings={{header: header, data: project.indicator ?? []}} onDelete={onDelete}/>
            </Grid>
        </Grid></>
}
