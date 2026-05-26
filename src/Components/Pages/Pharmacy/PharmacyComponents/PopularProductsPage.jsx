import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../../Context/Context';
import { Container, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import PharmacyItemCard from '../PharmacyComponents/PharmacyItemCard';
import CardsCarousel from '../PharmacyComponents/CardsCarousel';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const PopularProductsPage = () => {
  const { 
    popularProducts1: popularProducts = [],
    loading, 
    error,
    fetchPopularProducts,
    getUserToken
  } = useContext(MyContext);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [authError, setAuthError] = useState(null);
  const [localError, setLocalError] = useState(null);

  // Debug logs
  useEffect(() => {
    console.group("PopularProductsPage Context Data");
    console.log("Popular Products:", popularProducts);
    console.log("Loading:", loading);
    console.log("Error:", error);
    console.groupEnd();
  }, [popularProducts, loading, error]);

  // Token check & API fetch
  useEffect(() => {
    const token = getUserToken();
    console.log("User Token:", token);

    if (!token) {
      setAuthError('Please login to access products');
      return;
    }

    const loadData = async () => {
      try {
        if (popularProducts.length === 0) {
          console.log("Fetching popular products...");
          await fetchPopularProducts();
        }

        // Clear local error on success
        setLocalError(null);

      } catch (err) {
        console.error('❌ Error while loading popular products:', err);

        if (err.message?.toLowerCase().includes('token') || 
            err.message?.toLowerCase().includes('auth')) {
          setAuthError('Your session has expired. Please login again.');
        } else {
          setLocalError('Failed to load popular products. Please try again later.');
        }
      }
    };

    loadData();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = popularProducts.filter(product => {
      return (
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    console.log("Filtered Popular Products:", filtered);
    setFilteredProducts(filtered);
  }, [searchTerm, popularProducts]);

  // Critical error checker
  const isCriticalError = (err) => {
    if (!err) return false;
    const e = err.toLowerCase();
    return e.includes('token') || e.includes('auth') || e.includes('unauthorized');
  };

  // Check if we already have valid data
  const hasValidData = popularProducts.length > 0;

  // Auth Error Handling
  if ((authError || isCriticalError(error)) && !hasValidData) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          {authError || error}
          <div className="mt-3">
            <Button
              variant="primary"
              onClick={() => navigate('/login', { state: { from: '/pharmacy/popular-products' } })}
            >
              Login Now
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  // Loading state
  if (loading && !hasValidData) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading popular products...</p>
      </Container>
    );
  }

  // API / Local Error
  if ((error || localError) && !hasValidData) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <p>{localError || `Error loading popular products: ${error}`}</p>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => {
              console.log("Retrying fetch...");
              fetchPopularProducts();
              setLocalError(null);
            }}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  // Main UI
  return (
    <Container className="py-4">
      {/* Carousel for Featured Popular Products */}
      {popularProducts.length > 0 && (
        <div className="mb-5">
          <CardsCarousel
            mainTittle="Featured Products"
            items={popularProducts.slice(0, 10)} // Show top 10 in carousel
            isMedicine={false}
            showSeeAll={false}
          />
        </div>
      )}
      
      {/* Search Section */}
      <Row className="mb-4">
        <Col md={12}>
          <Form.Control
            type="search"
            placeholder="Search popular products by name, description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      {/* Popular Products Title */}
      <h2 className="mb-4">
        Popular Products
        <small className="text-muted ms-2">
          ({filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'})
        </small>
      </h2>
      
      {/* All Popular Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-5">
          <i className="ri-shopping-bag-line fs-1 text-muted"></i>
          <h4 className="mt-3">No popular products found</h4>
          <p className="text-muted">
            {searchTerm ? 'Try a different search term' : 'No popular products available'}
          </p>
          {searchTerm && (
            <Button
              variant="outline-primary"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <Row className="g-4">
          {filteredProducts.map(product => (
            <Col key={`product-${product._id || product.id || Math.random().toString(36).substr(2, 9)}`} xs={12} sm={6} md={4} lg={3}>
              <PharmacyItemCard item={product} isMedicine={false} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default PopularProductsPage;