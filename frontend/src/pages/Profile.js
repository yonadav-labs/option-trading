import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import Axios from 'axios';
import getApiUrl from '../utils';
import UserContext from '../UserContext';

const Profile = () => {
  const { authState, authService } = useOktaAuth();
  const { user, setUser } = useContext(UserContext);
  const [userInfo, setUserInfo] = useState(null);
  const API_URL = getApiUrl();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUser(null);
    } else {
      authService.getUser().then(info => {
        getUser(info);
      });
    }
  }, [authState, authService]); // Update if authState changes

  async function getUser(info) {
    let url = `${API_URL}/users/${info.sub}`;
    const response = await Axios.get(url);
    console.log(response.data)
    setUser(response.data);
  }

  async function logout() {
    authService.logout('/');
  }

  if (!user) {
    return (
      <div>
        <button onClick={logout}>Logout</button>
        <p>Fetching user profile...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>User Profile</h1>
      <ul>
        {Object.entries(user).map((claim) => {
          return <li><strong>{claim[0]}:</strong> {claim[1].toString()}</li>;
        })}
      </ul>
      <h1>Watchlist</h1>
    </div>
  );
}

export default Profile;