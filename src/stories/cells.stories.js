import {LightTheme} from "../themes/theme";
import React from "react";
import {HistoryCell_Component} from "../components/cells/HistoryCell_Component";
import {Status} from "../objects/enums/status.enum";
import {SettingsCell_Component} from "../components/cells/SettingsCell_Component";

export default {
    title: "Cells",
    parameters: {
        backgrounds: [
            {name: 'white', value: '#ffffff', default: true},
            {name: 'not white', value: '#F7F7F7'},
        ],
    }
}

const theme = LightTheme;

export const History_Cell_done = () => HistoryCell_Component("Bitte funktionier jetz", 65, "2h 32min", Status.passed)
export const History_Cell_error = () => HistoryCell_Component("Bitte funktionier jetz", 0, "Error(SMA)", Status.error)
export const History_Cell_waiting = () => HistoryCell_Component("Bitte funktionier jetz", 0, "2h 32min...", Status.waiting)

export const Create_Accordion = () => {
    return <SettingsCell_Component title={"Basischart"} subtitle={"Noch kein Basischart eingefügt"} expandedView={<h1>Hi:)</h1>}/>
}
export const Settings_Accordions = () => {
    return <>
        <SettingsCell_Component title={"Basischart"} subtitle={"Noch kein Basischart eingefügt"} expandedView={<h1>Hi:)</h1>}/>
        <SettingsCell_Component title={"Indikatoren"} subtitle={"Noch keine Indikatoren eingefügt"} expandedView={<h1>Hi:)</h1>}/>
        <SettingsCell_Component title={"Neurales Netz"} subtitle={"Standarteinstellungen"} expandedView={<h1>Hi:)</h1>}/>
        </>
}
export const Disabled_Accordion = () => SettingsCell_Component({title: "Basischarts", subtitle: "Noch keine Daten eingefügt",expandedView: <h1>:)</h1>,disabled: true});
