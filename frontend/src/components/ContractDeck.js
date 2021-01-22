import React, { useState } from 'react';
import { Container, Pagination } from 'react-bootstrap';

export default function ContractDeck(props) {
    const { contracts } = props;
    const [activePage, setActivePage] = useState(1);
    let pages = [];
    let pageSize = 20;
    let maxPages = Math.ceil(contracts.length / pageSize);

    const onPageChange = (params) => {
        setActivePage(params.target.text);
        console.log(activePage);
        console.log(params);
    }

    for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
        pages.push(
            <Pagination.Item key={pageNumber} active={pageNumber == activePage} onClick={onPageChange}>
                {pageNumber}
            </Pagination.Item>
        );
    }

    return (
        <Container>
            <Pagination>
                { activePage - 2 > 1 ? <Pagination.First /> : null }
                { activePage != 1 ? <Pagination.Prev /> : null }
                {pages.slice(activePage - 3, activePage + 2)}
                { activePage != maxPages ? <Pagination.Next /> : null }
                { activePage + 2 < maxPages ? <Pagination.Last /> : null }
            </Pagination>
        </Container>
    );
}