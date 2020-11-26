import {CustomTable_Component} from "../components/dataDisplay/Table_Component";
import {Chart_Component} from "../components/dataDisplay/Chart_Component";

export default {
    title: "Data Display",
    parameters: {
        backgrounds: [
            {name: 'white', value: '#ffffff', default: true},
            {name: 'not white', value: '#F7F7F7'},
        ],
    }
}

const tableData = {
    indicators: [
        {
            name: "SMA(SMA(Wirecard())[5:5:10])[5:5:10]",
            combinations: 10,
            dataName: "foo.csv"
        },
        {
            name: "SMA(SMA(Wirecard())[5:5:10])[5:5:10]",
            combinations: 10,
            dataName: "foo.csv"
        }
    ]
}
const chartData = [
    {
        "timestamp": 0,
        "Prediction": 4000,
        "Real": 2400,
    },
    {
        "timestamp": 100,
        "Prediction": 3020,
        "Real": 2200,
    },
    {
        "timestamp": 200,
        "Prediction": 3500,
        "Real": 3400,
    },
    {
        "timestamp": 300,
        "Prediction": 3700,
        "Real": 3600,
    },
    {
        "timestamp": 400,
        "Prediction": 1000,
        "Real": 3500,
    },

]

export const Table_Read_only = () => CustomTable_Component({readOnly: false, data: tableData});
export const Chart = () => Chart_Component({data: chartData})
