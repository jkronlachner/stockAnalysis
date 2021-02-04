import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography, useTheme
} from "@material-ui/core";
import {getFile} from "../../service/backendServices/ProjectService";
import {ResponsiveLineCanvas} from "@nivo/line";
import {useStore} from "react-redux";

const _ = require("lodash");

const useStyles = makeStyles((theme) => ({
    contentRoot: {
        padding: 40,
    }
}));
const ChartPreviewDialog_Component = ({projectId, basechartId, open, setOpen}) => {
    //MARK: Hooks
    const classes = useStyles();
    const store = useStore().getState();
    const theme = useTheme();

    //MARK: States
    const [data, setData] = useState([]);
    const [fields, setFields] = useState([]);
    const [error, setError] = useState(null);


    //<editor-fold desc="Lifecycle">
    useEffect(() => {
        if(basechartId === null){return;}
        setData([]);
        setFields([]);
        setError(null);
        getFile(basechartId).then(r => transformData(r)).catch(e => {
            console.error(e);
            setError({message: "There was a error while fetching the file!", description: e.response.data.message})
        });
    }, [open])
    //</editor-fold>


    const transformData = (data) => {
        const Papa = require("papaparse");
        const papaConfig = {
            header: true,
            fastMode: true,
            complete: (result) => {
                const basechart = store.projects[projectId].project.basecharts.find(basechart => basechart._id === basechartId)
                const resultData = basechart.columns.map(column => {
                    return {
                        id: column,
                        color: theme.palette.primary.main,
                        data: result.data.map((x, i) => {
                            const dateRow = x[result.meta.fields[0]];
                            const valueRow = parseFloat(x[column])
                            return {
                                x: dateRow,
                                y: valueRow
                            }
                        })
                    }
                })


                setData(resultData)
                setFields(result.meta.fields)
            }
        }
        Papa.parse(data, papaConfig)
    }

    return <Dialog className={classes.dialogRoot} open={open} onClose={setOpen} fullScreen>
        <DialogTitle style={{paddingTop: 40}}>
            <Typography variant={"h1"}>Vorschau</Typography>
        </DialogTitle>
        <DialogContent className={classes.contentRoot}>
            {error ? <div>
                    <Typography>{error.message}</Typography>
                    <Typography>{error.description}</Typography>
                </div> :
                data.length === 0 ? <CircularProgress/> :
                    <ResponsiveLineCanvas
                        data={data}
                        margin={{top: 50, right: 50, bottom: 50, left: 50}}
                        enablePoints={false}
                        lineWidth={2}
                        curve={"linear"}
                        colors={{scheme: "red_blue"}}
                        enableGridX={false}
                        enableGridY={true}
                        useMesh={true}
                        axisBottom={null}

                    />
            }
        </DialogContent>
        <DialogActions>
            <Button variant={"contained"} color={"primary"} onClick={() => setOpen(false)}>Schließen</Button>
        </DialogActions>
    </Dialog>
}
export default ChartPreviewDialog_Component
