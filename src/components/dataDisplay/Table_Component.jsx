import React, {useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {LightTheme} from "../../themes/theme";
import {DeleteRounded} from '@material-ui/icons'
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
const _ = require("lodash");

const theme = LightTheme;
const useStyles = makeStyles((/*theme*/) => ({
    table: {},
    headerRow: {
        padding: 10,
        fontWeight: "bold",
    },
    row: {
        backgroundColor: theme.palette.background.default,
        borderRadius: 10,
    },
    cell: {
        padding: "15px",
        borderRadius: 10,
        marginRight: 20,
        backgroundColor: theme.palette.background.default,
    },
    spacer: {
        paddingRight: 50,

    },
    indicators: {
        fontFamily: "Courier New",
        fontWeight: "bold",

    },
    combinations: {
        color: theme.palette.primary.main,
        fontSize: 30,
        fontWeight: "bold",
    },
    baseChart: {
        fontFamily: "Courier New !important",
        fontWeight: "bold",

    }
}));
/**
 * @component
 * @param settings
 *          Settings for Table, structured like this:
 *          Headers:
 *              @param name: Headertitle to display
 *              @param id: Data columnnime corresponding to Header, can be split with "."
 *      Data:
 *              @param can be everything
 * @param deletable
 *          if rows are deletable
 * @param onDelete
 *      @fires onDelete     deletes rows
 * @param onBlur
 *      @fires updates in database on textfield blur
 * @returns {*}
 * @constructor
 */

export const CustomTable_Component = ({settings, deletable, onDelete, onBlur, actions}) => {
    //mark: hooks
    const classes = useStyles();

    //mark: render
    if(!_.isArray(settings.data)){
        settings.data = [settings.data];
    }

    function getValue(header, d) {
        if(header.id.includes(".")){
            if(!d[header.id.split(".")[0]]){
                return "";
            }
            return d[header.id.split(".")[0]][header.id.split(".")[1]]
        }else {
            return d[header.id];
        }
    }

    return <>
        <table className={classes.table}>
            <thead>
            <tr key={"header"} className={classes.headerRow}>
                {settings.header.map((header) => {
                    return <>
                        <td>{header.name}</td>
                        <td className={classes.spacer}/>
                    </>
                })}
            </tr>
            </thead>
            <tbody>
            {settings.data.map(d => {
                if(!d){return <></>}
                return (<>
                    <tr key={d._id}>
                        {settings.header.map((header) => {
                            if(!header){return <></>}
                            return <TableField
                                data={d}
                                onBlur={onBlur ? (value) => onBlur(value, d, header.id) : null}
                                classes={classes}
                                defaultValue={getValue(header, d)}
                                type={"text"}
                                editable={false}
                            />
                        })}
                        <Grid container spacing={2} direction={"row"} wrap={"nowrap"}>
                            {
                                actions.map(x => {
                                    return <Grid item>
                                        <IconButton size={"medium"} onClick={() => x.onClick(d._id)}>{x.icon(d)}</IconButton>
                                    </Grid>
                                })

                            }
                        </Grid>
                    </tr>
                    <tr key={"spacer"} className={classes.spacer}/>
                </>);
            })}
            </tbody>
        </table>
    </>
}
type TableFieldProps = {
    defaultValue: string;
    classes: any;
    editable?: boolean;
    type: any;
    onBlur: any;
}
export const TableField = (props: TableFieldProps) => {
    const [value, setValue] = useState(props.defaultValue);


    return <>
        <td style={{width: "450px"}}
            className={[props.classes.cell, props.classes.indicators].join(" ")}>
            <input onBlur={props.onBlur ? () => props.onBlur(value) : null}
                   disabled={props.editable}
                   readOnly={!props.onBlur}
                   onChange={event => {
                       setValue(event.target.value)
                   }} value={value}/></td>
        <td className={props.classes.spacer}/>
    </>
};
