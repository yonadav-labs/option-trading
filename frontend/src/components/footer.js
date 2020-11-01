import React from 'react'
import { Link } from "react-router-dom"

function Footer() {
    return (
        <footer class="pt-4 my-md-5 border-top">
            <div class="row">
                <div class="col">
                    <p class="text-muted">
                        All Content on tigerstance.com is for informational purposes only, you should not construe
                        any such information or other material as legal, tax, investment, financial, or other advice.
                                See <Link to="/disclaimer" > full legal disclaimer</Link>.
                            </p>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <small class="d-block mb-3 text-muted">Copyright &copy; 2020 tigerstance.com. All Rights Reserved.</small>
                </div>
            </div>
        </footer>
    )
}

export default Footer