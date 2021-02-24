import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import RoutingIndex from "./RoutingIndex";
import {DarkTheme, LightTheme} from "./themes/theme";
import {Provider} from "react-redux";
import {store} from "./redux/reducers";
import SnackbarProvider from "./service/SnackbarProvider";
import {SkeletonTheme} from "react-loading-skeleton";
import { Provider as AlertProvider} from 'react-alert'
import {AlertTemplate} from "./components/dialogs/CustomAlertTemplate";

const electron = window.require('electron')


console.log(electron.remote.nativeTheme, electron.remote.nativeTheme.shouldUseDarkColors)
ReactDOM.render(<Provider store={store}>
        <SkeletonTheme color={"#cdcdcd"} highlightColor={"#efefef"}>
            <ThemeProvider theme={/*electron.remote.nativeTheme.shouldUseDarkColors false ? DarkTheme : */ LightTheme}>
                <AlertProvider template={AlertTemplate}>
                    <SnackbarProvider/>
                    <RoutingIndex/>
                </AlertProvider>
            </ThemeProvider>
        </SkeletonTheme>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
