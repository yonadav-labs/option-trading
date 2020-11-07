import React, { useState, useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';

const Profile = () => {
  const { authState, authService } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUserInfo(null);
    } else {
      authService.getUser().then(info => {
        setUserInfo(info);
      });
    }
  }, [authState, authService]); // Update if authState changes

  async function logout() {
    authService.logout('/');
  }

  if (!userInfo) {
    return (
      <div>
        <p>Fetching user profile...</p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={logout}>Logout</button>
      <h1>User Profile</h1>
      <ul>
        {Object.entries(userInfo).map((claim) => {
          return <li><strong>{claim[0]}:</strong> {claim[1]}</li>;
        })}
      </ul>
    </div>
  );
}

export default Profile;