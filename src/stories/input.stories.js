import {LightTheme} from "../themes/theme";
import React from "react";
import {TextField_Component} from "../components/inputs/TextField_Component";
import {TimeInput_Component} from "../components/inputs/TimeInput_Component";

export default {
    title: "Input",
    parameters: {
        backgrounds: [
            {name: 'white', value: '#ffffff', default: true},
            {name: 'not white', value: '#F7F7F7'},
        ],
    }
}

const theme = LightTheme;

export const TextField_Placeholder_Helper = () => TextField_Component({disabled: false, defaultValue: "NNE", fullWidth: false, type: "email", helperText: "Gib hier deinen Namen ein.", label: "Projektname", placeholder: "Projektname..."});
export const TextField_Plain = () => TextField_Component({disabled: false, defaultValue: "", fullWidth: false, label: "Projektname", placeholder: "Projektname..."});
export const TextField_Error = () => TextField_Component({disabled: false, defaultValue: "", fullWidth: false, label: "TextField with Error", placeholder: "", error: true});
export const TextField_disabled = () => TextField_Component({disabled: true, label: "Projektname"});

export const TimeInput = () => TimeInput_Component();
