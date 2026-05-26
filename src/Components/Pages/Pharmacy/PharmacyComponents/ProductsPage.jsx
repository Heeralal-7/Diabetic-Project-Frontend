import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../../Context/Context';
import { Container, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import PharmacyItemCard from '../PharmacyComponents/PharmacyItemCard';
import CardsCarousel from '../PharmacyComponents/CardsCarousel';

const ProductsPage = () => {
  const { 
    products1: products = [], 
    popularProducts1: popularProducts = [],
    loading, 
    error,
    fetchProducts,
    fetchPopularProducts
  } = useContext(MyContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [localError, setLocalError] = useState(null);

  // ✅ Debug log
  useEffect(() => {
    console.group("ProductsPage Context Data");
    console.log("Products:", products);
    console.log("Popular Products:", popularProducts);
    console.log("Loading:", loading);
    console.log("Error:", error);
    console.groupEnd();
  }, [products, popularProducts, loading, error]);

  // ✅ Initial fetch
  useEffect(() => {
    const loadData = async () => {
      try {
        if (products.length === 0) {
          console.log("Fetching products...");
          await fetchProducts();
        }
        if (popularProducts.length === 0) {
          console.log("Fetching popular products...");
          await fetchPopularProducts();
        }
        setLocalError(null); // ✅ Success पर local error reset
      } catch (err) {
        console.error("❌ Products fetch error:", err);
        setLocalError("Failed to load products. Please try again.");
      }
    };

    loadData();
  }, []);

  // ✅ Extract unique categories
  useEffect(() => {
    const uniqueCategories = [...new Set(
      products.map(product => product.category).filter(Boolean)
    )];
    console.log("Extracted Categories:", uniqueCategories);

    setCategories(['all', ...uniqueCategories]);
  }, [products]);

  // ✅ Search + Filter
  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    console.log("Filtered Products:", filtered);
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  // ✅ Check if we already have valid data
  const hasValidData = products.length > 0 || popularProducts.length > 0;

  // 🔄 Loading state (only when no data yet)
  if (loading && !hasValidData) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading products...</p>
      </Container>
    );
  }

  // ❌ Error state (only when no products)
  if ((error || localError) && !hasValidData) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <p>{localError || `Error loading products: ${error}`}</p>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              console.log("Retrying product fetch...");
              fetchProducts();
              fetchPopularProducts();
              setLocalError(null);
            }}
          >
            Retry
          </button>
        </Alert>
      </Container>
    );
  }

  // ✅ Main UI
  return (
    <Container className="py-4">


      {/* Popular Products */}
      {/* {popularProducts.length > 0 && (
        <div className="mb-5">
          <CardsCarousel
            mainTittle="Popular Products"
            items={popularProducts}
            showSeeAll={false}
          />
        </div>
      )} */}
      {/* Search and Filter Section */}
      <Row className="mb-4">
        <Col md={8}>
          <Form.Control
            type="search"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      {/* All Products */}
      <h2 className="mb-4">
        {selectedCategory === 'all' ? 'All Products' : selectedCategory}
        <small className="text-muted ms-2">
          ({filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'})
        </small>
      </h2>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-5">
          <i className="ri-shopping-bag-line fs-1 text-muted"></i>
          <h4 className="mt-3">No products found</h4>
          <p className="text-muted">
            {searchTerm ? 'Try a different search term' : 'No products available in this category'}
          </p>
          {searchTerm && (
            <button
              className="btn btn-outline-primary"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <Row className="g-4">
          {filteredProducts.map(product => (
            <Col key={product._id} xs={12} sm={6} md={4} lg={3}>
              <PharmacyItemCard item={product} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ProductsPage;
