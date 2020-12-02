import React, { useEffect, useState } from 'react';
import { useOktaAuth } from '@okta/okta-react';

export default function Home() {
    // const { authState, authService } = useOktaAuth();
    // const [userInfo, setUserInfo] = useState(null);

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
            <h1>Home</h1>
        </div>
    );
}