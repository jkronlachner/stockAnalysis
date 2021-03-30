import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {
    Box,
    CircularProgress,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle, Divider, IconButton,
    MenuItem, Slider,
    TextField,
    Typography,
    useTheme
} from "@material-ui/core";
import {getFile} from "../../service/backendServices/ProjectService";
import {useStore} from "react-redux";
import {ResponsiveLineCanvas} from "@nivo/line";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import {useAlert} from "react-alert";
import {convertToTargetData} from "../../service/backendServices/TargetDataEditorService";
import {DeleteRounded, RemoveRounded} from "@material-ui/icons";

const _ = require("lodash")
const useStyles = makeStyles((theme) => ({
    root: {},
    editor: {
        display: "flex",
        direction: "row",
        height: "100%",
        width: "100%"
    },
    editorPan: {
        width: "20%"
    }
}));
const EditorMode = {
    SELL: "sell",
    BUY: "buy",
    UNSET: "unset",
}
const baseEditorSettings = {
    editorMode: EditorMode.UNSET,
    buys: [],
    sells: [],
}
export const TargetDataEditor = (props: { project: Project, open: boolean, setOpen: Function, fileGeneratedCallback: Function }) => {
    const classes = useStyles();
    const store = useStore().getState();
    const theme = useTheme();
    const alert = useAlert();

    const [data, setData] = useState([]);
    const [fields, setFields] = useState([]);
    const [selectedBasechart, setSelectedbasechart] = useState();
    const [editorSettings, setEditorSettings] = useState(baseEditorSettings);
    const [sliderValue, setSliderValue] = useState(5);

    useEffect(() => {
        setData([]);
        setFields([]);
        setSelectedbasechart(null)
        setEditorSettings(baseEditorSettings)
    }, [props.open])


    useEffect(() => {
        if (selectedBasechart) {
            setData([]);
            setFields([]);
            setSliderValue(5);
            getFile(selectedBasechart._id).then(d => transformData(d, selectedBasechart._id))
        }
    }, [selectedBasechart])

    useEffect(() => {
        setData([]);
        setData([...data, {id: "buys", data: editorSettings.buys}, {
            id: "sells",
            data: editorSettings.sells
        }])
    }, [editorSettings])

    const transformData = (input, basechartId) => {
        const Papa = require("papaparse");
        const papaConfig = {
            header: true,
            fastMode: true,
            complete: (result) => {
                const basechart = store.projects[props.project.projectId].project.basecharts.find(basechart => basechart._id === basechartId)
                const resultData = basechart.columns.map(column => {
                    return {
                        id: column,
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
                setData([...data, ...resultData])
                setFields([...fields, ...basechart.columns])
            }
        }
        Papa.parse(input, papaConfig)
    }

    function addEvent(point) {
        const dataArray: any[] = data[0].data;
        const indexOfPoint = dataArray.findIndex(value => value.x === point.data.x && value.y === point.data.y);

        if (editorSettings.editorMode === EditorMode.BUY) {
            const buys = Array.from([...editorSettings.buys])
            for (let i = indexOfPoint; i < indexOfPoint + sliderValue; i++) {
                if (!buys.includes(dataArray[i])) buys.push(dataArray[i])
            }
            setEditorSettings({
                ...editorSettings, buys: buys
            })
        } else if (editorSettings.editorMode === EditorMode.SELL) {
            const sells = Array.from([...editorSettings.sells])
            for (let i = indexOfPoint; i < indexOfPoint + sliderValue; i++) {
                if (!sells.includes(dataArray[i])) sells.push(dataArray[i])
            }
            setEditorSettings({
                ...editorSettings, sells: sells
            })
        }
    }

    function renderEditor() {
        return <div className={classes.editor}>
            <div style={{height: "100%", width: "80%", overflowY: "scroll"}}>
                <div style={{width: "400%", height: "100%"}}><ResponsiveLineCanvas
                    data={data}
                    margin={{top: 50, right: 50, bottom: 50, left: 50}}
                    lineWidth={2}
                    curve={"linear"}
                    colors={{scheme: "red_blue"}}
                    enableGridX={false}
                    enableGridY={true}
                    layers={[
                        'grid',
                        'markers',
                        'areas',
                        ({lineGenerator, series, ctx, lineWidth, innerWidth}) => {
                            lineGenerator.context(ctx)
                            series.forEach(serie => {
                                if (serie.id !== "buys" && serie.id !== "sells") {
                                    ctx.strokeStyle = "black"
                                    ctx.lineWidth = lineWidth
                                    ctx.beginPath()
                                    lineGenerator(serie.data.map(d => d.position))
                                    ctx.stroke()
                                }
                            })
                        },
                        ({points}) => {
                            points.forEach(p => {
                                const indexOfPointBuy = _.findIndex(editorSettings.buys, (buy) => buy.x === p.data.x && p.data.y === buy.y)
                                if (indexOfPointBuy !== -1) {
                                    p.color = "#00ff34"
                                    p.pointSize = "16px"
                                    return;
                                }
                                const indexOfPointSell = _.findIndex(editorSettings.sells, (buy) => buy.x === p.data.x && p.data.y === buy.y)
                                if (indexOfPointSell !== -1) {
                                    p.color = "#ff0000"
                                    p.pointSize = "16px"
                                    return;
                                }
                                p.color = "transparent"
                            })
                        },
                        'points',
                        'mesh',
                        'legends',
                        'axes'
                    ]}
                    axisLeft={{
                        orient: 'left',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'count',
                        legendOffset: 0,
                        legendPosition: 'middle'
                    }}
                    useMesh={true}
                    pointSize={10}
                    pointColor={"transparent"}
                    axisBottom={null}
                    enableCrosshair
                    onClick={(point, event) => addEvent(point)}
                    crosshairType={"bottom-left"}/>
                </div>
            </div>
            <div className={classes.editorPan}>
                <Typography variant={"h5"}>Editor Settings</Typography>
                <Box m={4}>
                    <Typography variant={"body1"}>
                        zu setzende Punkte
                    </Typography>
                    <Slider
                        defaultValue={5}
                        step={1}
                        min={1}
                        max={25}
                        valueLabelDisplay={"on"}
                        value={sliderValue}
                        onChange={(event, value) => setSliderValue(value)}
                    />
                    <Typography variant={"caption"}>
                        Je mehr Buy und Sell Points zu setzt, desto besser funktioniert die Vorhersage. Wenn du also
                        einen großen Graphen hast wähle hier eine große Zahl aus.
                    </Typography>
                </Box>
                <Box m={4} display={"flex"} flexDirection={"column"}>
                    <Button color="primary" variant={"contained"}
                            style={{marginBottom: 10}}
                            onClick={() => setEditorSettings({...editorSettings, editorMode: EditorMode.BUY})}>BUY
                        Modus</Button>
                    <Button color={"secondary"} variant={"contained"}
                            onClick={() => setEditorSettings({...editorSettings, editorMode: EditorMode.SELL})}>SELL
                        Modus</Button>
                    <Typography variant={"body1"}>Derzeitiger Modus: {editorSettings.editorMode}</Typography>
                </Box>
                <Divider variant={"fullWidth"}/>
                <Box m={4}>
                    <Typography variant={"body1"}>Sells:</Typography>
                    {editorSettings.sells.map(sell => {
                        return <Box flexDirection={"row"} display={"flex"} alignItems={"center"}
                                    justifyContent={"center"}>
                            <Typography variant={"body2"}>{sell.x} / {sell.y}</Typography>
                            <IconButton size={"small"} onClick={() => {
                                var sells = Array.from(editorSettings.sells);
                                _.remove(sells, (x) => x === sell);
                                setEditorSettings(Object.assign({}, editorSettings, {"sells": sells}))
                            }}>
                                <DeleteRounded/>
                            </IconButton>
                        </Box>
                    })}
                </Box>
                <Divider variant={"fullWidth"}/>
                <Box m={4}>
                    <Typography variant={"body1"}>Buys:</Typography>
                    {editorSettings.buys.map(buy => {
                        return <Box flexDirection={"row"} display={"flex"} alignItems={"center"}
                                    justifyContent={"center"}>
                            <Typography variant={"body2"}>{buy.x} / {buy.y}</Typography>
                            <IconButton size={"small"} onClick={() => {
                                var buys = Array.from(editorSettings.buys);
                                _.remove(buys, (x) => x === buy);
                                setEditorSettings(Object.assign({}, editorSettings, {"buys": buys}))
                            }}>
                                <DeleteRounded/>
                            </IconButton>
                        </Box>
                    })}
                </Box>
                <Divider variant={"fullWidth"}/>
                <Box m={4} display={"flex"} flexDirection={"column"}>
                    <Button color="primary" variant={"outlined"}
                            style={{marginBottom: 10}}
                            onClick={() => setEditorSettings({...editorSettings, buys: []})}>Clear BUYS</Button>
                    <Button color={"secondary"} variant={"outlined"}
                            onClick={() => setEditorSettings({...editorSettings, sells: []})}>Clear SELLS</Button>
                </Box>
            </div>
        </div>

    }

    return <div>{
        props.project.basecharts ? <Dialog fullScreen open={props.open} className={classes.dialogRoot}>
            <DialogTitle>
                <Typography variant={"h2"}>
                    Zieldatensatz-Editor
                </Typography>
            </DialogTitle>
            <DialogContent>
                {
                    !selectedBasechart ?
                        <TextField
                            variant={"outlined"}
                            fullWidth
                            label={"Basisdaten auswählen"}
                            onChange={e => setSelectedbasechart(e.target.value)}
                            select>
                            {props.project.basecharts.map(basechart =>
                                <MenuItem value={basechart} key={basechart._id}>
                                    {basechart.nickname}
                                </MenuItem>
                            )}
                        </TextField>
                        :
                        data.length === 0 ? <CircularProgress/> :
                            renderEditor()
                }
            </DialogContent>
            <DialogActions>
                <Button variant={"text"} color={"secondary"} onClick={() => props.setOpen(false)}>Abbrechen</Button>
                <Button
                    disabled={!(selectedBasechart && editorSettings.buys.length !== 0 && editorSettings.sells.length !== 0)}
                    variant={"contained"} color={"primary"} onClick={() => {
                    const d = data.find(value => value.id !== "buys" && value.id !== "sells");
                    const targetDataText = convertToTargetData(editorSettings.buys, editorSettings.sells, d.data)
                    //MARK: GENERATED TARGET DATA FILE!
                    props.fileGeneratedCallback(targetDataText);
                    props.setOpen(false);
                    }}>Generieren</Button>
            </DialogActions>
        </Dialog> : <div></div>}</div>
}



