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
    userId: String;
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
    status: Status;
    paths: string[];


    constructor(definition: string, combinations: number, basechart: Basechart, status: Status) {
        this.definition = definition;
        this.combinations = combinations;
        this.basechart = basechart;
        this.status = status;
    }
}
