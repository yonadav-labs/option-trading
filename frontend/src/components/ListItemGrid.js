import React from "react";
import {
    Grid, ListItem
} from "@material-ui/core";

export default function ListItemGrid(props) {
    return (
        <ListItem>
            <Grid container zeroMinWidth>
                {props.children}
            </Grid>
        </ListItem>
    );
}