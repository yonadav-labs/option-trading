import React, { useState } from 'react';
import ButtonGroup from 'react-bootstrap/esm/ButtonGroup';
import ToggleButton from 'react-bootstrap/esm/ToggleButton';


function ButtonToggleFilter(props) {
    const { choiceLabelMap, tableFilter } = props;
    const [radioValue, setRadioValue] = useState('All');

    function onChoiceFilterChange(event) {
        setRadioValue(event.currentTarget.value)
        const value = event.target.value;
        if (value == 'All') {
            tableFilter(Object.keys(choiceLabelMap));
        } else {
            tableFilter([value]);
        }
    };
  
    const radios = [
      { name: 'All', value: 'All' },
      { name: 'Call', value: true },
      { name: 'Put', value: false },
    ];
  
    return (
      <>
        <ButtonGroup toggle>
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
  
export default ButtonToggleFilter