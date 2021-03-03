import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, MenuItem, TextField,
    Typography, useTheme
} from "@material-ui/core";
import {getFile} from "../../service/backendServices/ProjectService";
import {ResponsiveLineCanvas} from "@nivo/line";
import {useStore} from "react-redux";
import {Indicator} from "../../objects/project";
import {getIndicatorFile} from "../../service/backendServices/IndicatorService";

const _ = require("lodash");

const useStyles = makeStyles((theme) => ({
    contentRoot: {
        padding: 40, overflowY: "scroll"
    }
}));
const ChartPreviewDialog_Component = ({projectId, basechartId, open, setOpen, indicatorId}) => {
    //MARK: Hooks
    const classes = useStyles();
    const store = useStore().getState();
    const theme = useTheme();

    //MARK: States
    const [data, setData] = useState([]);
    const [fields, setFields] = useState([]);
    const [error, setError] = useState(null);
    const [selectedIndicatorFile, setSelectedIndicatorFile] = useState(null);

    //Selectors
    let indicator: Indicator;
    if (indicatorId && projectId) indicator = store.projects[projectId].project.indicator?.find(i => i._id === parseInt(indicatorId));


    //<editor-fold desc="Lifecycle">
    useEffect(() => {
        if (basechartId) {
            setData([]);
            setFields([]);
            setError(null);
            getFile(basechartId).then(r => transformData(r)).catch(e => {
                console.error(e);
                setError({message: "There was a error while fetching the file!", description: e.response.data.message})
            });
        }
        if (indicatorId) {
            setData([]);
            setFields([]);
            setError(null);
            setSelectedIndicatorFile(null)
        }

    }, [open])

    useEffect(() => {
        setData([]);
        setFields([]);
        setError(null);
        if (!indicator) {
            return;
        }
        const basechartId = indicator.basechart._id;
        if (basechartId && selectedIndicatorFile) {
            getFile(basechartId).then(fileResponse => {
                getIndicatorFile(selectedIndicatorFile).then(indicatorResponse => transformData(fileResponse, basechartId, indicatorResponse)).catch(e => {
                    console.error(e);
                    setError({
                        message: "There was a error while fetching the file!",
                        description: e.response?.data.message
                    })
                })
            }).catch(e => {
                console.error(e);
                setError({message: "There was a error while fetching the file!", description: e.response?.data.message})
            });

        }

    }, [selectedIndicatorFile])
    //</editor-fold>

    const transformData = (data, bcId, indicatorData) => {
        const Papa = require("papaparse");
        const papaConfig = {
            header: true,
            fastMode: true,
            complete: (result) => {
                const basechart = store.projects[projectId].project.basecharts.find(basechart => basechart._id === bcId ? bcId : basechartId)
                let resultData = [];
                resultData = basechart.columns.map(column => {
                    return {
                        id: column,
                        color: theme.palette.primary.main,
                        data: result.data.filter(x => !_.isNaN(parseFloat(x[column]))).map((x, i) => {
                            const dateRow = x[result.meta.fields[0]];
                            const valueRow = parseFloat(x[column])
                            return {
                                x: dateRow,
                                y: valueRow
                            }
                        })
                    }
                })

                setData(resultData);
                if (bcId) transformIndicatorData(indicatorData, resultData)
                setFields(result.meta.fields);
            }
        }
        Papa.parse(data, papaConfig)
    }
    const transformIndicatorData = (indicatorData, data) => {
        if (!data) {
            return
        }
        indicatorData = indicatorData.split("\n");
        const xAxe = data[0].data.map(row => row.x);
        const resultData = [];
        xAxe.forEach((xItem, index) => {
            if (indicatorData.length - 1 === index || _.isNaN(parseFloat(indicatorData[index]))) {
                return;
            }
            resultData.push({
                x: xItem,
                y: parseFloat(indicatorData[index])
            })
        })
        setData([...data, {id: "indicator", data: resultData}])
    }


    function renderBasechartGraph() {
        return error ? <div>
                <Typography>{error.message}</Typography>
                <Typography>{error.description}</Typography>
            </div> :
            data.length === 0 ? <h1>Loading...</h1> :
                    <div style={{width: "400%", height: "100%"}}>
                        <ResponsiveLineCanvas
                            data={data}
                            margin={{top: 50, right: 140, bottom: 50, left: 50}}
                            enablePoints={false}
                            lineWidth={2}
                            curve={"linear"}
                            colors={{scheme: "red_blue"}}
                            enableGridX={false}
                            enableGridY={true}
                            useMesh={true}
                            axisBottom={{
                                tickValues: data[0].data.filter((x, i) => i % 10 === 0).map(x => x.x),
                                orient: 'left',
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 90,
                                legend: 'Datum',
                                legendOffset: -35,
                                legendPosition: 'left'
                            }}
                            legends={[
                                {
                                    anchor: 'bottom-left',
                                    direction: 'column',
                                    justify: false,
                                    translateX: 0,
                                    translateY: -10,
                                    itemSpacing: 2,
                                    itemDirection: 'left-to-right',
                                    itemWidth: 80,
                                    itemHeight: 12,
                                    itemOpacity: 0.75,
                                    symbolSize: 12,

                                }
                            ]}
                        /></div>
    }

    function renderIndicatorGraphWithChooser() {
        if (indicator) {
            return <TextField onChange={e => setSelectedIndicatorFile(e.target.value)} variant={"outlined"} fullWidth
                              label={"Indikatorvariante auswählen."}
                              helperText={"Wähle eine Variante aus um sie als Graph anzusehen."} select>
                {indicator.paths.map(path =>
                    <MenuItem key={path} value={path}>{path}</MenuItem>)}
            </TextField>;
        } else {
            return <CircularProgress/>
        }
    }

    function renderChooserOrGraph() {
        if (indicatorId && data.length !== 0) {
            return renderBasechartGraph();
        }

        if (indicatorId) {
            return renderIndicatorGraphWithChooser()
        }

        if (data.length !== 0) {
            return renderBasechartGraph();
        }
    }

    return <Dialog className={classes.dialogRoot} open={open} onClose={setOpen} fullScreen>
        <DialogTitle style={{paddingTop: 40}}>
            <Typography variant={"h1"}>Vorschau</Typography>
        </DialogTitle>
        <DialogContent className={classes.contentRoot}>
            {renderChooserOrGraph()}
        </DialogContent>
        <DialogActions>
            {indicator && selectedIndicatorFile ?
                <Button variant={"contained"} color={"secondary"} onClick={() => setSelectedIndicatorFile(null)}>Zurück
                    zur Auswahl</Button> : <div/>}
            <Button variant={"contained"} color={"primary"} onClick={() => setOpen(false)}>Schließen</Button>
        </DialogActions>
    </Dialog>
}
export default ChartPreviewDialog_Component
