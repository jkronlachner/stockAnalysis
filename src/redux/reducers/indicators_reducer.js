import {createReducer} from "@reduxjs/toolkit";
import {Basechart, Indicator, Project} from "../../objects/project";
import {Status} from "../../objects/enums/status.enum";

const _ = require("lodash");

export const indicatorReducer = createReducer([], {
    ["ADD_NEW_INDICATOR_TEMPLATE"] : (state, action) => {
        const {indicators} = action.payload;
        return indicators;
    }
});

