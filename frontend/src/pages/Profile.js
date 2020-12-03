import React, { useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import UserContext from '../UserContext';

const Profile = () => {
  const { authState, authService } = useOktaAuth();
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
  }, [authState, authService]); // Update if authState changes

  if (!user) {
    return (
      <div>
        <p>Fetching user profile...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ "marginTop": "4rem" }}>
      <h1>User Profile</h1>
      {/* <ul>
        {Object.entries(user).map((claim) => {
          return <li><strong>{claim[0]}:</strong> {claim[1].toString()}</li>;
        })}
      </ul> */}
    </div>
  );
}

export default Profile;