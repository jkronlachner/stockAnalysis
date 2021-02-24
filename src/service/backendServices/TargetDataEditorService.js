import {uploadTargetdataFile} from "./ProjectService";

const _ = require("lodash");
const Papa = require('papaparse')
const fs = require('fs');
export const convertToTargetData = (buys: [{x: any, y: any}], sells: [{x: any, y: any}], basechartData: [{x: any, y: any}]) => {
    const targetData = []
    basechartData.forEach(value => {
        const indexOfPointBuy = _.findIndex(buys, (buy) => buy.x === value.x && value.y === buy.y)
        if(indexOfPointBuy !== -1){
            targetData.push({
                value: 1,
            })
            return;
        }
        const indexOfPointSell = _.findIndex(sells, (sell) => sell.x === value.x && value.y === sell.y)
        if(indexOfPointSell !== -1){
            targetData.push({
                value: 0,
            })
            return;
        }
        targetData.push({
            value: 0.5
        })
    })
    return Papa.unparse(targetData, {
        delimiter: ";",
        header: false,
    })
}
export const convertToFileAndUploadToServer = (fileContent: String, setProgress: Function) => {
    var blob = new Blob([fileContent], {type: "text/plain"});
    var file = new File([blob], "generated.csv", {type: "text/plain"})
    return new Promise((resolve, reject) => {
        uploadTargetdataFile({file: file, setProgress: setProgress}).then((r) => resolve({id: r, filename: "generated.csv"})).catch(reason => reject(reason));
    })

}
