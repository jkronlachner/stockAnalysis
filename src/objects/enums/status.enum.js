export const Status = {
    passed: 1,
    error: -1,
    waiting: 0,
    processing: -2,
    draft: 2,
}


///Returns Status Color for Status id
export function getStatusColor(status) {
    const statusNumber = Number.parseInt(status);
    switch (statusNumber) {
        case 0:
            return "#FFD800";
        case 1:
            return "#4ECC00";
        case -1:
            return "#CC0000";
        case -2:
            return "#134086";
        case 2:
            return "#5d5d5d";
        default:
            return "#5d5d5d";
    }
}
