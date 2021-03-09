import React, { useEffect, useContext, useState, useRef } from 'react';
import getApiUrl from '../utils';
import { useHistory } from 'react-router-dom';
import Axios from 'axios';
import './Blog.css';

const Blog = () => {
    const API_URL = getApiUrl();
    const history = useHistory();
    const [blogs, setBlogs] = useState([]);

    useEffect(async () => {
        let url = `${API_URL}/blogs/`;
        const response = await Axios.get(url);
        setBlogs(response.data);
    }, [])

    return (
        <div className="blog-background">
            <div class="container justify-content-center min-vh-100">
                <h1 className="text-center mt-4 mb-5">Blogs</h1>
                <ul>
                    {
                        blogs.map(blog => (
                            <li>
                                <a href={"/blogs/"+blog.id}><h5>{blog.title}</h5></a>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    );
}

export default Blog;