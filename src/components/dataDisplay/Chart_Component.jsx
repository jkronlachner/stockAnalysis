import React from "react";
import AreaChart from "recharts/lib/chart/AreaChart";
import {Area, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Skeleton from "react-loading-skeleton";
import {useTheme} from "@material-ui/core";


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0px 0px 10px 1px " + theme.palette.shadowColor.main,
        borderRadius: 10,
        padding: 20,
        margin: 20,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    chart: {
        display: "flex",
        width: "100%",
        height: "100%",
    },
    legend: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
    },
    loader: {
        width: "100%",
        display: "flex",
        justifyContent: "center"
    }
}))
export const Chart_Component = ({data, isLoading}) => {
    //MARK: Hooks
    const theme = useTheme();
    const classes = useStyles();

    //MARK: Render
    return <div className={classes.root}>
        <div className={classes.chart}>
            <ResponsiveContainer height={250} width="100%">
                {isLoading ? <Skeleton/> : <AreaChart data={data}
                                                      margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.5}/>
                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.5}/>
                            <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="timestamp"/>
                    <YAxis/>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <Tooltip/>
                    <Area type="monotone" dataKey="Prediction" stroke={theme.palette.primary.main} fillOpacity={1}
                          fill="url(#colorUv)"/>
                    <Area type="monotone" dataKey="Real" stroke={theme.palette.secondary.main} fillOpacity={1}
                          fill="url(#colorPv)"/>
                    <Legend align={"right"} verticalAlign={"middle"} layout={"vertical"} height={36} wrapperStyle={{}}/>

                </AreaChart>}
            </ResponsiveContainer>
        </div>
        <div className={classes.legend}>
            <Typography style={{fontSize: 20}} variant={"h1"}>{isLoading ?
                <Skeleton height={20} width={200}/> : "Übereinstimmung"}</Typography>
            <Typography variant={"h3"}>{isLoading ? <Skeleton height={80} width={100}/> : "55%"}</Typography>
        </div>
    </div>
}
