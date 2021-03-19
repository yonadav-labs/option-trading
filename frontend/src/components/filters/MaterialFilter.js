import React from "react";
import { Select, FormControl} from "@material-ui/core";

export default function MaterialFilter() {

    return (
        <FormControl variant="filled" size="small" fullWidth>
            <Select
            native
            inputProps={{
                name: 'age',
                id: 'filled-age-native-simple',
            }}
            style={{ backgroundColor: "#53555d", borderRadius: 5, color:'white' }}
            disableUnderline
            defaultValue={10}
            >
                <option value={10}>Ten</option>
                <option value={20}>Twenty</option>
                <option value={30}>Thirty</option>
            </Select>
        </FormControl>
    );
}
