import React, {useEffect, useRef, useState} from "react";
import {useHistory, useLocation} from "react-router-dom";
import {makeStyles, useTheme} from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";
import DashboardIcon from "@material-ui/icons/Dashboard";
import History from "@material-ui/icons/History";
import {Settings} from "@material-ui/icons";


const useStyles = makeStyles((theme) => ({
    sideNavRoot: {
        height: "100%",
        color: "white",
        marginTop: "15vh",
        width: "calc(200px + 0.8em)"
    },
    nav: {width: "calc(200px + 0.8em)"},
    wrapper: {
        margin: 0,
    },
    navItemWrapper: {
        margin: 0,
        width: "100%",
        height: "4rem",
        transition: "all .15s ease-in",
        cursor: "pointer",
        "&:hover $icon": {
            paddingLeft: "0.3rem",
        },
    },
    navItem: {
        display: "flex",
        margin: "1rem 0",
        textAlign: "center",
        width: "80%",
        transition: "all .15s ease-in",

    },
    icon: {
        fontSize: 32,
        zIndex: 3,
        transition: "all 0.1s ease-in",
        color: theme.palette.text.secondary,
    },

    navItemText: {
        fontSize: 20,
        color: theme.palette.text.secondary,
        margin: "auto 1rem",
        zIndex: 3,
        fontWeight: "bold",
    },
    selector: {
        height: "4rem",
        background: theme.palette.primary.main,
        position: "absolute",
        transition: "top 0.2s ease-in",
        minWidth: "0.8rem",
        zIndex: 2,
    },
}));
const SideNavigationBar_Component = ({showNavigationBar: hideNavigationBar}) => {
    //mark: hooks
    const classes = useStyles();
    const location = useLocation();
    const selectorRef = useRef();
    const history = useHistory();
    const theme = useTheme();

    //TODO: Put somewhere else - should not be hidden in this component
    //mark: navigation Items
    const items = [
        {
            id: "dashboardItem",
            ref: useRef(),
            icon: DashboardIcon,
            text: "Dashboard",
            enabled: true,
            to: "dashboard",
        },
        {
            id: "verlaufItem",
            ref: useRef(),
            icon: History,
            text: "Verlauf",
            enabled: true,
            to: "history",
        },
        {
            id: "settings",
            ref: useRef(),
            icon: Settings,
            text: "Einstellungen",
            enabled: true,
            to: "settings",
        }
    ];

    //mark: states
    const [activeItemId, setActiveItemId] = useState("dashboardItem");
    const [selectorTop, setSelectorTop] = React.useState();
    const [selectorLeft, setSelectorLeft] = React.useState();


    //<editor-fold desc="Lifecycle">
    useEffect(() => {
        items.forEach(
            (x) => location.pathname.includes(x.to) && setActiveItemId(x.id)
        );
    }, []);

    useEffect(() => {
        handleResizeForSelector();
    }, [activeItemId]);

    useEffect(() => {
        items.forEach(item => {
            if (location.pathname.includes(item.to)) {
                setActiveItemId(item.id);
            }
        });
    }, [location])
    //</editor-fold>


    //<editor-fold desc="helpers">
    function handleResizeForSelector() {
        let selectedItemRef = items.find((x) => x.id === activeItemId).ref;
        setSelectorLeft(selectedItemRef.current.getBoundingClientRect().left + 200);
        setSelectorTop(selectedItemRef.current.getBoundingClientRect().top - 16);
    }

    //</editor-fold>

    //mark: renders
    return (
        <div className={classes.sideNavRoot}>
            <nav className={classes.nav}>
                <div className={classes.wrapper}>
                    {items.map((item) => {
                        return (
                            <div
                                className={[
                                    classes.navItemWrapper,
                                    activeItemId === item.id ? classes.selectedItem : "",
                                ].join(" ")}
                                onClick={() => {
                                    item.enabled && setActiveItemId(item.id);
                                    history.push(`/${item.to}`);
                                }}
                                key={item.id}
                            >
                                <div
                                    className={classes.navItem}
                                    ref={item.ref}
                                    key={item.id}>
                                    <item.icon
                                        className={classes.icon}
                                        style={activeItemId === item.id ? {color: theme.palette.primary.main} : {}}
                                    />
                                    <Typography
                                        style={activeItemId === item.id ? {color: theme.palette.primary.main} : {}}
                                        component={"p"}
                                        className={classes.navItemText}
                                    >
                                        {item.text}
                                    </Typography>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </nav>
            <div
                style={hideNavigationBar ? {opacity: 0} : {top: selectorTop, left: selectorLeft}}
                ref={selectorRef}
                className={classes.selector}
                id="selector"
            />
        </div>
    );
};

export default SideNavigationBar_Component;
