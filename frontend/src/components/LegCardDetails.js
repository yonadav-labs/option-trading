import React, { useEffect, useState } from 'react';
import getApiUrl, { PercentageFormatter, PriceFormatter } from '../utils';
import Axios from 'axios';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import ContractDetailsCard from './cards/ContractDetailsCard';
import { Col, Row } from 'react-bootstrap';

const SliderWithTooltip = createSliderWithTooltip(Slider);

export default function LegCardDetails(props) {
    const { legs, index, selectedTicker, updateLeg } = props;
    const [strikes, setStrikes] = useState([]);
    const [marks, setMarks] = useState({});
    const [contracts, setContracts] = useState([]);
    const [strikeSliderValue, setStrikeSliderValue] = useState(0);
    const API_URL = getApiUrl();

    useEffect(async () => {
        const leg = legs[index];

        if (leg.type === "option" && leg.action && leg.optionType && leg.expiration) {
            // call api to get option chain
            try {
                let url = `${API_URL}/tickers/${selectedTicker[0].symbol}/contracts/?`;
                url += `expiration_timestamps=${leg.expiration}&`
                const response = await Axios.get(url);
                let marksObj = {};
                const sortedContracts = response.data.contracts.sort((a, b) => a.strike - b.strike);
                
                setContracts(sortedContracts);
                setStrikes(sortedContracts.map(val => {
                    marksObj[val.strike] = "";
                    return val.strike;
                }));
                marksObj[props.atmPrice] = <>{PriceFormatter(props.atmPrice)}<br />(Current Price)</>;
                setMarks(marksObj);
            } catch (error) {
                console.error(error);
            }
        }
    }, [props.legs[index].action, props.legs[index].optionType, props.legs[index].expiration, props.legs[index].ticker]);

    const onStrikeSliderChange = (strike) => {
        setStrikeSliderValue(strike);
        updateLeg("contract", contracts.filter((val) => val.strike === strike)[0], index);
    }

    const strikeSliderTooltipFormatter = (v) => {
        const percentageChange = ((props.atmPrice - v) / props.atmPrice) * -1;
        return <>{PriceFormatter(v)} ({percentageChange > 0 ? "+" : ""}{PercentageFormatter(percentageChange)})</>;
    }

    switch (legs[index].type) {
        case "option":
            return (
                <>
                    <Row className="mb-5">
                        <Col>
                            <SliderWithTooltip
                                tipFormatter={strikeSliderTooltipFormatter}
                                value={strikeSliderValue}
                                min={strikes.length > 1 ? strikes[0] : 0}
                                max={strikes.length > 1 ? strikes[strikes.length - 1] : 0}
                                marks={marks}
                                step={null}
                                onChange={(e) => onStrikeSliderChange(e)}
                            />
                            {/* <Slider
                                value={strikeSliderValue}
                                min={strikes.length > 1 ? strikes[0] : 0}
                                max={strikes.length > 1 ? strikes[strikes.length - 1] : 0}
                                marks={marks}
                                step={null}
                                onChange={(e) => onStrikeSliderChange(e)}
                            /> */}
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <ContractDetailsCard contract={contracts.filter((val) => val.strike === strikeSliderValue)[0]} />
                        </Col>
                    </Row>
                </>
            );
        case "stock":
            return (
                <>
                    <Row className="mb-5">
                        <Col>
                            <p>{legs[index].shares} Shares at $_ per Share</p>
                        </Col>
                    </Row>
                </>
            );
        case "cash":
            return (
                <>
                    <Row className="mb-5">
                        <Col>
                            <p>${legs[index].value}</p>
                        </Col>
                    </Row>
                </>
            );
        default:
            return null;
    }
}