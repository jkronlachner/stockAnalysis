// @flow
import {Status} from "./enums/status.enum";

//Flow classes for structuring

export class Project {
    creationTimestamp: Date;
    projectId: string;
    projectTitle: string;
    status: Status;
    timeunit: "M" | "W" | "D" | "h" | "m" | "s" | "ms";
    runtime: string;
    correlation: number;
    error: string;
    zieldatensatz: string;
    basecharts: Array<Basechart>;
    indicator: Array<Indicator>;
    rules: Array<mixed>;
    options: Array<mixed>;
}

export class Basechart {
    _id: string;
    chartname: string;
    nickname: string;
    columns: string[];
    grouped: boolean;
    filepath: string;
    editable: boolean;
    uploadProgress: number;
}
export class Indicator {
    _id: number;
    definition: string;
    combinations: number;
    basechart: Basechart;
    column: string;


    constructor(definition: string, combinations: number, basechart: Basechart, column: string) {
        this.definition = definition;
        this.combinations = combinations;
        this.basechart = basechart;
        this.column = column;
    }
}
