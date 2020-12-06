import React from 'react'
import { Link } from "react-router-dom"

function Footer(props) {
    return (
        <div className={`container-fluid bg-secondary ${ props.class }`} >
            {/* <hr className="featurette-divider-last" /> */}
            <footer className="featurette-divider-last">
                <div className="row">
                    <div className="col-4">
                        <p className="text-muted">
                            Helping everyday investors learn and invest in options the right way.
                        </p>
                        <p className="text-muted">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer fermentum, lacus vel gravida varius, nisi odio lacinia felis, in vehicula velit sapien vitae dolor.
                        </p>
                    </div>
                    <div className="col-2">
                        <p className="text-muted">
                            Learn
                        </p>
                        <p className="text-muted">
                            Product
                        </p>
                        <p className="text-muted">
                            Solutions
                        </p>
                        <p className="text-muted">
                            Pricing
                        </p>
                    </div>
                    <div className="col-2">
                        <p className="text-muted">
                            Company
                        </p>
                        <p className="text-muted">
                            About
                        </p>
                        <p className="text-muted">
                            Contact
                        </p>
                        <p className="text-muted">
                            Support
                        </p>
                    </div>
                    <div className="col-4">
                        <p className="text-muted">
                            Stay up to date
                        </p>
                        <p className="text-muted">
                            Sign up to our newsletter to get notified about any and all brand updates and exclusive information.
                        </p>
                        <p className="text-muted">
                            PUT EMAIL INPUT HERE
                        </p>
                    </div>
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
                            Data on tigerstance.com is delayed and may not reflect the latest market condition.
                        </p>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <small className="d-block mb-3 text-muted">Copyright &copy; 2020 tigerstance.com. All Rights Reserved.</small>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Footer