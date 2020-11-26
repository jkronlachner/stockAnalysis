import {ProjectTab_Component} from "../components/cells/ProjectTab_Component";
import {Status} from "../objects/enums/status.enum";
import {CreateProject_Component} from "../components/miscellaneous/CreateProject_Component";

export default {
    title: "Project Tab",
    parameters: {
        backgrounds: [
            {name: 'white', value: '#ffffff', default: true},
            {name: 'not white', value: '#F7F7F7'},
        ],
    }
}

export const Project_Tab_passed = () => ProjectTab_Component(Status.passed, "Versuch #212", "85% Korrelation");
export const Project_Tab_error = () => ProjectTab_Component(Status.error, "Geht scho funktionier", "Error(SMA)");
export const Project_Tab_waiting = () => ProjectTab_Component(Status.waiting, "Gehtscho gemma voigas! Gemma voigas!", "2h 31min...");
export const Project_Add = () => CreateProject_Component();
