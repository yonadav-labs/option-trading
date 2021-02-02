import React from 'react';
import './Home.css';
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css';

export default function EmailVerified() {
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get('login_hint')

    return (
        <div className="container-fluid pricing-background">
            <div class="min-vh-100">
               <div id="sign-in-widget">
                  <div data-se="auth-container" id="okta-sign-in" class="auth-container main-container no-beacon">
                     <div class="okta-sign-in-header auth-header">
                        <img src="/logo192.png" class="auth-org-logo" alt="" />
                        <div data-type="beacon-container" class="beacon-container"></div>
                     </div>
                     <div class="auth-content">
                        <div class="auth-content-inner">
                           <div class="registration-complete">
                             <div data-se="o-form-content" class="o-form-content o-form-theme clearfix">
                                <div class="o-form-fieldset-container" data-se="o-form-fieldset-container">
                                   <div>
                                      <div class="container">
                                         <span class="title-icon icon icon-16 confirm-16-green"></span>
                                         <h2 class="title">Your email ({email}) verified successfully.</h2>
                                         <div class="desc">You can use the email to sign in.</div>
                                      </div>
                                      <a href="/signin" class="back-btn" data-se="back-link">Back to Sign In</a>
                                   </div>
                                </div>
                             </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
        </div>
    );
}