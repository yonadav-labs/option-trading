import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import getApiUrl from '../utils';
import { useHistory } from 'react-router-dom';
import Axios from 'axios';
import { useOktaAuth } from '@okta/okta-react';
import './Blog.css';

const Blog = () => {
    const { authState } = useOktaAuth();
    const API_URL = getApiUrl();
    const history = useHistory();
    const [blogs, setBlogs] = useState([]);

    useEffect(async () => {
        let url = `${API_URL}/reports/`;
        const response = await Axios.get(url);
        setBlogs(response.data);
    }, [])

    return (
        <div className="blog-background">
            <Helmet>
                <title>Tigerstance | Member-Only Market Reports</title>
            </Helmet>
            <div id="content" className="container min-vh-100" style={{ "marginTop": "2rem" }} fluid>
                <h2 className="text-center mt-4">Member-Only Market Reports</h2>
                {!authState.isAuthenticated &&
                    <p className="text-center  mb-5" >Our exclusive market insights.
                    <a href="/signin"> <b>Log In</b></a> or <Link to="/signin/register"><b>Sign Up for Free</b></Link> to access! </p>}
                <ul>
                    {
                        blogs.map((blog, index) => (
                            <li key={index}>
                                <Link className="d-inline-block" to={"/reports/" + blog.id}><h5>{blog.title}</h5></Link>
                                <p>{blog.created_time}</p>
                                <p>{blog.description}</p>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    );
}

export default Blog;