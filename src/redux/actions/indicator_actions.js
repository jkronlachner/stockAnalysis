import {createAction} from "@reduxjs/toolkit";
import {IndicatorTemplate} from "../../objects/enums/indicatorTemplate";

const replaceIndicators = createAction("ADD_NEW_INDICATOR_TEMPLATE", function (indicators: IndicatorTemplate[]){
    return {
        payload: {
            indicators: indicators
        }
    }
})
export {
    replaceIndicators
}
