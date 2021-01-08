import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@material-ui/core";
import {getFile} from "../../service/backendServices/ProjectService";
import {Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

const useStyles = makeStyles((theme) => ({
    root: {},
}));
const ChartPreviewDialog_Component = ({projectId, basechartId, open, setOpen}) => {
    //MARK: Hooks
    const classes = useStyles();

    //MARK: States
    const [data, setData] = useState([]);
    const [fields, setFields] = useState([]);


    //<editor-fold desc="Lifecycle">
    useEffect(() => {
        setData([]);
        setFields([]);
        getFile(basechartId).then(r => transformData(r)).catch(e => console.log(e))
    }, [open])
    //</editor-fold>


    const transformData = (data) => {
        const Papa = require("papaparse");
        const papaConfig = {
            header: true,
            fastMode: true,
            complete: (result) => {
                setData(result.data);
                setFields(result.meta.fields)
            }
        }
        Papa.parse(data, papaConfig)
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    return <Dialog className={classes.root} open={open} onClose={setOpen} fullScreen>
        <DialogTitle>
            <Typography variant={"h1"}>Vorschau</Typography>
        </DialogTitle>
        <DialogContent>
            {data.length === 0 ? <Typography variant={"caption"}>Loading</Typography> :
                    <LineChart height={800} width={800} data={data}>
                        <XAxis dataKey={fields[0]} allowDataOverflow={false}/>
                        <YAxis allowDecimals={true} allowDataOverflow={false}/>
                        <CartesianGrid strokeDasharray={"3 3"}/>
                        <Tooltip/>
                        <Line isAnimationActive type={"monotone"} dataKey={fields[1]} stroke={getRandomColor()}/>
                        <Line isAnimationActive type={"monotone"} dataKey={fields[2]} stroke={getRandomColor()}/>
                    </LineChart>
            }
        </DialogContent>
        <DialogActions>
            <Button variant={"contained"} color={"primary"} onClick={() => setOpen(false)}>Schließen</Button>
        </DialogActions>
    </Dialog>
}
export default ChartPreviewDialog_Component
