import React from 'react'
import { Link } from "react-router-dom"

function Footer() {
    return (
        <div>
            <hr className="featurette-divider-last" />
            <footer className="container">
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