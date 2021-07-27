import React, { useState } from "react";
import { List, ListItem, ListItemText, Collapse, Badge } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import PropTypes from "prop-types";

export default function ListItemGroup(props) {
    const { groupName, defaultOpen, badgeContent, children } = props;
    const [open, setOpen] = useState(defaultOpen);

    return (
        <>

            <ListItem button onClick={() => setOpen(!open)}>
                <ListItemText primary={groupName} />
                <Badge badgeContent={badgeContent} color="primary">{open ? <RemoveIcon /> : <AddIcon />}</Badge>
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {children}
                </List>
            </Collapse>
        </>
    );
}

ListItemGroup.defaultProps = {
    groupName: "",
    defaultOpen: false,
    badgeContent: "",
};

ListItemGroup.propTypes = {
    groupName: PropTypes.string.isRequired,
    defaultOpen: PropTypes.bool,
    badgeContent: PropTypes.any,
};