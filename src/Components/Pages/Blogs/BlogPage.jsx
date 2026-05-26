// src/Pages/BlogPage/BlogPage.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Aos from "aos";
import "aos/dist/aos.css";

const BlogPage = () => {
  const { blogId, tabType } = useParams(); // Get both blogId and tabType from URL
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.68.74:8081";

  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found.");
      setLoading(false);
    }
    return token;
  };

  useEffect(() => {
    Aos.init({ duration: 1000 });
    Aos.refresh();

    const fetchBlogDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        if (!token) return;

        const fetchUrl = `${BASE_URL}/blogs?id=${blogId}`;
        const response = await fetch(fetchUrl, {
          headers: { token: token },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`HTTP error! status: ${response.status}. Message: ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();

        if (data.success && data.details) {
          setBlog(data.details);
        } else {
          throw new Error(data.message || "Failed to retrieve blog details.");
        }

      } catch (err) {
        setError(err.message);
        console.error("Error fetching blog details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [blogId, BASE_URL]);

  // Function to handle back navigation with tab context
  const handleBackToBlogs = () => {
    if (tabType && tabType !== 'all') {
      navigate(`/blogs/${tabType}`);
    } else {
      navigate('/blogs');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <p className="lead">Loading blog post...</p>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5 text-danger">
        <p className="lead">Error loading blog post:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-5">
        <p className="lead">Blog post not found.</p>
      </div>
    );
  }

  return (
    <>
      <section className="showcase single-blog-showcase">
        <div className="overlay">
          <h2 className="display-5">{blog.title || "Untitled Blog"}</h2>
          {tabType && tabType !== 'all' && (
            <p className="fs-6 text-capitalize">Category: {tabType}</p>
          )}
        </div>
      </section>

      <section className="blog-content py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <article className="blog-post-article">
                <div className="blog-post-header mb-4" data-aos="fade-in">
                  <h1 className="mb-3">{blog.title || "Untitled Blog"}</h1>
                  <p className="text-muted">
                    By {blog.created_by || "Unknown Author"}
                  </p>
                </div>

                <div className="blog-post-image mb-4" data-aos="fade-in">
                  <img
                    src={
                      blog.blogimage
                        ? `${BASE_URL}${blog.blogimage}`
                        : "https://via.placeholder.com/700x400?text=Blog+Image+Placeholder"
                    }
                    alt={blog.title || "Blog Image"}
                    className="img-fluid rounded"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/700x400?text=Error+Loading+Image";
                    }}
                  />
                </div>

                <div className="blog-post-body" data-aos="fade-up">
                  <p>{blog.description || "This blog post does not have a description."}</p>

                  {blog.subheadingId && blog.subheadingId.length > 0 && (
                    <div className="mt-4">
                      {blog.subheadingId.map((subheading) => (
                        <div key={subheading._id} className="mb-3">
                          <h4>{subheading.title}</h4>
                          <p>{subheading.description || "No description for this section."}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5">
                    <button 
                      onClick={handleBackToBlogs} 
                      className="btn btn-primary"
                    >
                      Back to Blogs
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogPage;