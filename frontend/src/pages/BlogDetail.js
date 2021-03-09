import React, { useEffect, useContext, useState, useRef } from 'react';
import { useParams, Link } from "react-router-dom";
import getApiUrl from '../utils';
import { useHistory } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import Axios from 'axios';
import './Blog.css';

const BlogDetail = () => {
    let { blogId } = useParams();
    const { oktaAuth, authState } = useOktaAuth();

    const API_URL = getApiUrl();
    const history = useHistory();
    const [blog, setBlog] = useState([]);

    const loadBlog = async () => {
        try {
            let headers = {}
            if (authState.isAuthenticated) {
                const { accessToken } = authState;
                headers = {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken.accessToken}`,
                };
            }

            const response = await Axios.get(`${API_URL}/blogs/${blogId}/`, {
                headers: headers
            });

            setBlog(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadBlog();
    }, [oktaAuth, authState]);

    return (
        <div className="blog-background">
            <div class="container justify-content-center min-vh-100 pt-5">
                <h1 className="text-center mb-5">{blog.title}</h1>
                <p className="blog-description">{blog.description}</p>
                <div className="p-5 mb-5">
                    <iframe src={blog.slide_link} frameborder="0" className="google-slide-iframe mx-auto" height="569" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
                </div>
            </div>
        </div>
    );
}

export default BlogDetail;