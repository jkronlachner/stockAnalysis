import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {CircularProgress, Divider, Paper, Typography} from "@material-ui/core";
import {useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {Project} from "../../objects/project";
import {ResponsiveLineCanvas} from "@nivo/line";
import {Skeleton} from "@material-ui/lab";
import {getIndicatorFile} from "../../service/backendServices/IndicatorService";

const _ = require("lodash")

const useStyles = makeStyles((theme) => ({
    rootContainer: {padding: 20, height: "100%", overflow: "scroll"},
    graphs: {overflowX: "scroll", overflowY: "hidden"},
}));

export const FinishedProjectView = () => {
    const [data, setData] = useState([]);

    const classes = useStyles();
    const {id} = useParams();
    const project: Project = useSelector(state => {
        return (state.projects ?? {})[id] ? (state.projects ?? {})[id].project : null
    })


    useEffect(() => {
        if (project.statusText !== null) {
            getIndicatorFile(project.statusText).then(value =>
                transformData(value))
        }
    }, [])

    const transformData = (dataString) => {
        const Papa = require("papaparse");
        const papaConfig = {
            header: true,
            fastMode: true,
            complete: (result) => {
                console.log(result)
                let resultData = []
                resultData = result.meta.fields.map(field => {
                    return {
                        id: field,
                        data: result.data.filter(x => !_.isNaN(parseFloat(x[field]))).map((x, i) => {
                            return {
                                x: i,
                                y: parseFloat(x[field])
                            }
                        })
                    }
                })
                console.log(resultData)
                setData(resultData);
            }
        }
        Papa.parse(dataString, papaConfig);
    }

    function syncScroll(sender) {
        _.forEach(["All", "original", "prediction", "difference"], (f) => {
            document.getElementById("scrollContainer" + f).scrollLeft = sender.target.scrollLeft;
        })
    }

    function renderGraphic(field) {
        let d = data;
        if (field !== "All" && data) {
            d = data.filter(x => x.id === field)
        }
        return <div id={"scrollContainer" + field}
                    style={{height: "30vh", width: "100%", overflowY: "scroll", paddingBottom: 100}}
                    onScroll={syncScroll}>
            <div style={{height: "100%", width: "200%", overflow: "hidden"}}>
                {data.length === 0 && <CircularProgress/>}
                {data.length !== 0 && <ResponsiveLineCanvas
                    data={d}
                    margin={{top: 50, right: 50, bottom: 50, left: 150}}
                    lineWidth={6}
                    curve={"step"}
                    colors={{scheme: "red_blue"}}
                    enableGridX={true}
                    gridXValues={data[0].data.filter(x => x.x % 10 === 0).map(x => x.x)}
                    enableGridY={true}
                    axisLeft={{
                        tickValues: [
                            0, 0.5, 1
                        ],
                        orient: 'left',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'wert',
                        legendOffset: -35,
                        legendPosition: 'middle'
                    }}
                    useMesh={true}
                    pointSize={10}
                    pointColor={"transparent"}
                    axisBottom={{
                        tickValues: data[0].data.filter(x => x.x % 10 === 0).map(x => x.x),
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 90,
                        legend: 'schritt',
                        legendOffset: 35,
                        legendPosition: 'left'
                    }}
                    enableCrosshair
                    crosshairType="top-left"

                    legends={[
                        {
                            anchor: 'bottom-left',
                            direction: 'column',
                            justify: false,
                            translateX: -100,
                            translateY: 0,
                            itemsSpacing: 0,
                            itemDirection: 'left-to-right',
                            itemWidth: 80,
                            itemHeight: 20,
                            itemOpacity: 0.75,
                            symbolSize: 12,
                            symbolShape: 'circle',
                            symbolBorderColor: 'rgba(0, 0, 0, .5)',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemBackground: 'rgba(0, 0, 0, .03)',
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}
                />}
            </div>
        </div>
    }

    function renderKeyStatsForPrediction() {
        if (data.length === 0) {
            return <Skeleton/>
        }
        const d = data[1].data.map(x => x.y)
        const maxPrediction = _.max(d);
        const avgPrediction = _.sum(d) / d.length;
        const minPrediction = _.min(d);
        return <div className={classes.keyStats}>
            <Typography variant={"h5"}>
                Prediction - Stats
            </Typography>
            <Typography variant={"body1"}>Höchste Prediction: {maxPrediction}</Typography>
            <Typography variant={"body1"}>Durchschnittliche Prediction: {avgPrediction}</Typography>
            <Typography variant={"body1"}>Kleinste Prediction: {minPrediction}</Typography>
        </div>
    }

    function renderKeyStatsForDifference() {
        if (data.length === 0) {
            return <Skeleton/>
        }
        const d = data[2].data.map(x => x.y)
        const maxDiff = _.max(d);
        const avgDiff = _.sum(d) / d.length;
        const minDiff = _.min(d);
        return <div className={classes.keyStats}>
            <Typography variant={"h5"}>
                Prediction - Stats
            </Typography>
            <Typography variant={"body1"}>Höchster Unterschied: {maxDiff}</Typography>
            <Typography variant={"body1"}>Durchschnittlicher Unterschied: {avgDiff}</Typography>
            <Typography variant={"body1"}>Kleinster Unterschied: {minDiff}</Typography>
        </div>
    }

    return (<div className={classes.rootContainer}>
        <Typography variant={"h4"}><b>Ergebnis von {project.projectTitle}</b></Typography>
        <div className={classes.graphs}>
            <Typography variant={"h2"}>Original, Prediction und Difference</Typography>
            {renderGraphic("All")}
            <Divider variant={"middle"}/>

            <Typography variant={"h2"}>Original</Typography>
            {renderGraphic("original")}
            <Divider variant={"middle"}/>

            <Typography variant={"h2"}>Prediction</Typography>
            {renderGraphic("prediction")}
            {data && renderKeyStatsForPrediction()}
            <Divider variant={"middle"}/>

            <Typography variant={"h2"}>Difference</Typography>
            {renderGraphic("difference")}
            {data && renderKeyStatsForDifference()}
            <Divider variant={"middle"}/>

        </div>
    </div>)
}
