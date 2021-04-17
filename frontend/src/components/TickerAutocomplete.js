import React, { cloneElement, createContext, forwardRef, useContext, useEffect, useRef, Children } from "react";
import { TextField, useTheme, useMediaQuery, Typography, Autocomplete } from "@material-ui/core";
import { VariableSizeList } from 'react-window';
import PropTypes from 'prop-types';

const LISTBOX_PADDING = 8;
const OuterElementContext = createContext({});

const outerElementType = forwardRef((props, ref) => {
    const outerElementProps = useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerElementProps} />;
});

function renderRow(props) {
    const { data, index, style } = props;
    return cloneElement(data[index], {
        style: {
            ...style,
            top: style.top + LISTBOX_PADDING,
        },
    });
}

function useResetCache(data) {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current != null) {
            ref.current.resetAfterIndex(0, true);
        }
    }, [data]);
    return ref;
}

const ListboxComponent = forwardRef(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData = Children.toArray(children);
    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
    const itemCount = itemData.length;
    const itemSize = smUp ? 36 : 48;

    const getHeight = () => {
        if (itemCount > 8) {
            return 8 * itemSize;
        }
        return itemData.map(() => itemSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemCount);

    return (
        <div ref={ref}>
            <OuterElementContext.Provider value={other}>
                <VariableSizeList
                    itemData={itemData}
                    height={getHeight() + 2 * LISTBOX_PADDING}
                    width="100%"
                    ref={gridRef}
                    outerElementType={outerElementType}
                    innerElementType="ul"
                    itemSize={(index) => itemSize}
                    overscanCount={5}
                    itemCount={itemCount}
                >
                    {renderRow}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    );
});

ListboxComponent.propTypes = {
    children: PropTypes.node,
};

export default function TickerAutocomplete(props) {
    const { tickers, onChange, value, size, displayLabel } = props;

    return (
        <Autocomplete
            id="ticker-autocomplete"
            fullWidth
            disableListWrap
            ListboxComponent={ListboxComponent}
            options={tickers}
            size={size}
            value={value}
            getOptionLabel={(option) => option.display_label}
            renderInput={(params) => <TextField {...params} InputLabelProps={{ shrink: true }}
                variant="standard" label={displayLabel ? "Ticker Symbol" : ""}
                placeholder="Enter a ticker symbol: TSLA, AAPL, GOOG..." />}
            renderOption={(props, option) => <li key={option}><Typography {...props} noWrap>{option.display_label}</Typography></li>}
            onChange={onChange}
        />
    );
}

TickerAutocomplete.propTypes = {
    tickers: PropTypes.array.isRequired,
    onChange: PropTypes.func
}