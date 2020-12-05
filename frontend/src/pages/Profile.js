import React, { useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import UserContext from '../UserContext';
import './Profile.css';

const Profile = () => {
  const { authState, authService } = useOktaAuth();
  const { user } = useContext(UserContext);

  useEffect(() => {
  }, [authState, authService]); // Update if authState changes

  if (!user) {
    return (
      <div class="container justify-content-center">
        <p>Fetching user profile...</p>
      </div>
    );
  }

  return (
    <div class="container justify-content-center">
      <div class="card">
        <div class="row">
          <div class="col-md-4 bg-gradient user-profile">
            <div class="card-block text-center text-white">
              <h6 class="f-w-600">{user.email}</h6>
              <p>Member</p>
            </div>
          </div>
          <div class="col-md-8">
            <div class="card-block">
              <h6 class="b-b-default f-w-600">Information</h6>
              <div class="row">
                <div class="col-md-6">
                  <p class="f-w-600">Email</p>
                  <h6 class="text-muted">{user.email}</h6>
                </div>
                {/* <div class="col-md-6">
                  <p class="f-w-600">???</p>
                  <h6 class="text-muted">???</h6>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;