import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import Snackbar from "@material-ui/core/Snackbar";
import {Alert} from '@material-ui/lab';
import {connect} from "react-redux";
import {getLoadingStatus} from "../redux/selectors/selectors";
import {LoadingStatus} from "../objects/enums/loading.enum";

const useStyles = makeStyles((theme) => ({
    root: {},
}));
const SnackbarProvider = ({loading}) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [oldStatus, setOldStatus] = useState();

    useEffect(() => {
        if(loading.status !== LoadingStatus.loading && oldStatus !== loading.status){
            setOpen(true);
        }
        setOldStatus(loading.status);
    }, [loading])

    return <div className={classes.root}>
        <Snackbar transitionDuration={500} onClose={setOpen} anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={open} autoHideDuration={7000}>
            {loading.status === LoadingStatus.error ? <Alert severity="error">Deine Projekte konnten nicht von der Datenbank geladen werden... Bist du offline?</Alert> :  <Alert style={{}} severity="success">Deine Projekte wurden von der Datenbank geladen.</Alert>}
        </Snackbar>
    </div>
}


const mapStateToProps = (state) => {
    return {loading: getLoadingStatus(state)}
}
export default connect(mapStateToProps)(SnackbarProvider)
