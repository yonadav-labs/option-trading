import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form'
import TickerTypeahead from '../components/TickerTypeahead';
import TickerSummary from '../components/TickerSummary.js';
import BestCallByPrice from '../components/BestCallByPrice.js';
import { useOktaAuth } from '@okta/okta-react';
import ModalSpinner from '../components/ModalSpinner';

export default function Home() {
    // const { authState, authService } = useOktaAuth();
    // const [userInfo, setUserInfo] = useState(null);
    const [selectedTicker, setSelectedTicker] = useState([]);
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const [basicInfo, setbasicInfo] = useState({});
    const [modalActive, setModalActive] = useState(false);

    // useEffect(() => {
    //     console.log("using effect")
    //     if (!authState.isAuthenticated) {
    //         // When user isn't authenticated, forget any user info
    //         setUserInfo(null);
    //     } else {
    //         authService.getUser().then(info => {
    //             setUserInfo(info);
    //         });
    //     }
    // }, [authState, authService]);

    // if (!userInfo) {
    //     return (
    //         <div>
    //             <p>Fetching user profile...</p>
    //         </div>
    //     );
    // }

    return (
        <div id="content">
            <ModalSpinner active={modalActive}></ModalSpinner>
            {/* <div>
                <h1>User Profile</h1>
                <ul>
                    {Object.entries(userInfo).map((claim) => {
                        return <li><strong>{claim[0]}:</strong> {claim[1]}</li>;
                    })}
                </ul>
            </div> */}
            <h1 className="text-center">Buy call</h1>
            <Form>
                <Form.Group>
                    <Form.Label className="requiredField"><h5>Enter ticker symbol:</h5></Form.Label>
                    <TickerTypeahead
                        setSelectedTicker={setSelectedTicker}
                        setExpirationTimestamps={setExpirationTimestamps}
                        setbasicInfo={setbasicInfo}
                        setModalActive={setModalActive}
                    />
                </Form.Group>
            </Form>
            {selectedTicker.length > 0 ?
                <div>
                    <TickerSummary basicInfo={basicInfo} />
                    <BestCallByPrice
                        selectedTicker={selectedTicker[0].symbol}
                        expirationTimestamps={expirationTimestamps}
                        setModalActive={setModalActive} />
                </div>
                :
                null
            }
        </div>
    );
}