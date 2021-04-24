import React, { useState } from 'react';
import ButtonGroup from 'react-bootstrap/esm/ButtonGroup';
import ToggleButton from 'react-bootstrap/esm/ToggleButton';
import { GetGaEventTrackingFunc } from '../../utils';

const GaEvent = GetGaEventTrackingFunc('options screener');

function ButtonToggleFilter(props) {
  const { choiceLabelMap, tableFilter } = props;
  const [radioValue, setRadioValue] = useState('All');

  function onChoiceFilterChange(event) {
    setRadioValue(event.currentTarget.value)
    const value = event.target.value;

    switch (value) {
      case 'All':
        tableFilter(Object.keys(choiceLabelMap));
        break;
      case 'Call':
        tableFilter([true]);
        break;
      case 'Put':
        tableFilter([false]);
        break;
      default:
        break;
    }
    GaEvent('adjust call/put filter');
  };

  const radios = [
    { name: 'All', value: 'All' },
    { name: 'Call', value: "Call" },
    { name: 'Put', value: "Put" },
  ];

  return (
    <>
      <ButtonGroup toggle style={{ zIndex: 0 }}>
        {radios.map((radio, idx) => (
          <ToggleButton
            key={idx}
            type="radio"
            variant="outline-primary"
            name="radio"
            value={radio.value}
            checked={radioValue === radio.value}
            onChange={(e) => onChoiceFilterChange(e)}
          >
            {radio.name}
          </ToggleButton>
        ))}
      </ButtonGroup>
    </>
  );
}
export default ButtonToggleFilter;
