import React from 'react'
import { Link } from "react-router-dom"

function Footer(props) {
    return (
        <div className={`container-fluid ${props.class}`} style={{ background: '#2A2A2A' }} >
            {/* <hr className="featurette-divider-last" /> */}
            <footer className="featurette-divider-last">
                <div className="row">
                    <div className="col-md-4 col-12">
                        <h3 className="text-light">
                            Never get lost in the option chain again.
                        </h3>
                        <p className="text-light">
                            Contact us at contact@tigerstance.com or through this <a href="https://forms.gle/qEqcKb1mtG8PJUWq6" target="_blank">google form</a>.
                        </p>
                    </div>
                    {/* <div className="col-md-2 col-6">
                        <h3 className="text-light">
                            Learn
                        </h3>
                        <p className="text-light">
                            Product
                        </p>
                        <p className="text-light">
                            Solutions
                        </p>
                        <p className="text-light">
                            Pricing
                        </p>
                    </div>
                    <div className="col-md-2 col-6">
                        <h3 className="text-light">
                            Company
                        </h3>
                        <p className="text-light">
                            About
                        </p>
                        <p className="text-light">
                            Contact
                        </p>
                        <p className="text-light">
                            Support
                        </p>
                    </div>
                    <div className="col-md-4 col-12">
                        <h3 className="text-light">
                            Stay up to date
                        </h3>
                        <p className="text-light">
                            Sign up to our newsletter to get notified about any and all brand updates and exclusive information.
                        </p>
                        <p className="text-light">
                            PUT EMAIL INPUT HERE
                        </p>
                    </div> */}
                </div>
                <hr />
                <div className="row">
                    <div className="col">
                        <p className="text-muted">
                            All content and data on tigerstance.com is for informational purposes only, you should not construe
                            any such information or other material as legal, tax, trading, investment, financial, or other advice.
                        See <Link to="/disclaimer" > full legal disclaimer</Link>.
                    </p>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <p className="text-muted">
                            Data and information on tigerstance.com is provided 'as-is' and solely for informational purposes, not for trading purposes or advice, and is delayed.
                        </p>
                    </div>
                </div>
                <div className="row pb-5">
                    <div className="col">
                        <small className="d-block text-muted">Copyright &copy; 2020 tigerstance.com. All Rights Reserved.</small>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Footer