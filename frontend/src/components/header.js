import React from 'react'
import { Link } from "react-router-dom"

function Header() {
    return (
        <header>
            <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
                <Link className="navbar-brand" to="/">Tiger Stance</Link>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarCollapse">
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item active">
                            <a class="nav-link" href="/">Home</a>
                        </li>
                        <li class="nav-item active">
                            <Link className="nav-link" to="/buy-call">Buy call</Link>
                        </li>
                        <li class="nav-item active">
                            <Link className="nav-link" to="/sell-covered-call">Sell covered call</Link>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    )
}

export default Header