import React from 'react';

export default function Base(props) {
    return (
        <div>
            <div class="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom box-shadow">
                <h5 class="my-0 mr-md-auto font-weight-normal"><a href="/">Tiger Stance</a></h5>
                <nav class="my-2 my-md-0 mr-md-3">
                    <a class="p-2 text-dark" href="#">Features</a>
                    <a class="p-2 text-dark" href="#">Enterprise</a>
                    <a class="p-2 text-dark" href="#">Support</a>
                    <a class="p-2 text-dark" href="#">Pricing</a>
                </nav>
                <a class="btn btn-outline-primary" href="#">Sign up</a>
            </div>

            <div class="container">
            <div id="content">
                {props.children}
            </div>
                <footer class="pt-4 my-md-5 pt-md-5 border-top">
                    <div class="row">
                        <div class="col-12 col-md">
                            <h2>🐯</h2>
                            <small class="d-block mb-3 text-muted">Copyright &copy; 2020 tigerstance.com. All Rights Reserved.</small>
                        </div>
                        <div class="col-6 col-md">
                            <h5>About</h5>
                            <ul class="list-unstyled text-small">
                                <li><a class="text-muted" href="#">Coming soon...</a></li>
                            </ul>
                        </div>
                        <div class="col-6 col-md">
                            <h5>Resources</h5>
                            <ul class="list-unstyled text-small">
                                <li><a class="text-muted" href="#">Coming soon...</a></li>
                            </ul>
                        </div>
                        <div class="col-6 col-md">
                            <p class="text-muted">
                                All Content on tigerstance.com is for informational purposes only, you should not construe
                                any such information or other material as legal, tax, investment, financial, or other advice.
                                See <a href="{% url 'about' %}" >full legal disclaimer</a>.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}