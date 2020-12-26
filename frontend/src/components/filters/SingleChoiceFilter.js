import React from 'react'
import Form from 'react-bootstrap/Form'

function SingleChoiceFilter(props) {

    const { choiceLabelMap, tableFilter } = props;

    function onChoiceFilterChange(event) {
        const { value } = event.target;
        if (value == 'all') {
            tableFilter(Object.keys(choiceLabelMap));
        } else {
            tableFilter([value]);
        }
    };

    return (
        <Form.Control name="strategy" as="select" defaultValue="all"
            onChange={(e) => onChoiceFilterChange(e)}>
            <option key="all" value="all">All</option>
            {Object.keys(choiceLabelMap).map((key, index) => {
                return (
                    <option key={key} value={key}>{choiceLabelMap[key]}</option>
                );
            })}
        </Form.Control>
    )
}

export default SingleChoiceFilter