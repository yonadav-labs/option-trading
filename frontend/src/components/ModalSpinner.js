import React from 'react'
import Modal from "react-bootstrap/Modal";
import Spinner from 'react-bootstrap/Spinner';

function ModalSpinner({ active }) {
    return (
        <Modal show={active}
            aria-labelledby="contained-modal-title-vcenter"
            centered size="sm" className="bd-example-modal-lg"
        >
            <Modal.Body>
                <Spinner animation="grow" role="status">
                    <span className="sr-only"></span>
                </Spinner>
            </Modal.Body>
        </Modal>
    )
}

export default ModalSpinner