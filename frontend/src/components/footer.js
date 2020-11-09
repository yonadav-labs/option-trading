import React from 'react'
import { Link } from "react-router-dom"

function Footer() {
    return (
        <footer className="border-top align-items-center p-3 px-md-4 mb-3">
            <div className="row">
                <div className="col">
                    <p className="text-muted">
                        All Content on tigerstance.com is for informational purposes only, you should not construe
                        any such information or other material as legal, tax, investment, financial, or other advice.
                        See <Link to="/disclaimer" > full legal disclaimer</Link>.
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <small className="d-block mb-3 text-muted">Copyright &copy; 2020 tigerstance.com. All Rights Reserved.</small>
                </div>
            </div>
        </footer>
    )
}

export default Footer