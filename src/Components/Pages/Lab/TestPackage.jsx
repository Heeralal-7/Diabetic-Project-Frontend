import React, { useEffect, useState } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";
import { useParams, useNavigate } from "react-router-dom";

/* ================= VENDOR CART HOOK ================= */
const useVendorCart = (vendorId) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!vendorId) return;
    const stored = localStorage.getItem("labCartItems");
    const data = stored ? JSON.parse(stored) : {};
    setCartItems(data[vendorId] || []);
  }, [vendorId]);

  useEffect(() => {
    if (!vendorId) return;
    const stored = localStorage.getItem("labCartItems");
    const data = stored ? JSON.parse(stored) : {};
    data[vendorId] = cartItems;
    localStorage.setItem("labCartItems", JSON.stringify(data));
  }, [cartItems, vendorId]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      if (prev.some((i) => i._id === item._id)) return prev;
      return [...prev, { ...item, vendorId }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i._id !== id));
  };

  const isItemInCart = (id) => cartItems.some((i) => i._id === id);

  return { cartItems, addToCart, removeFromCart, isItemInCart };
};
/* ==================================================== */

const TestPackages = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const { cartItems, addToCart, removeFromCart, isItemInCart } =
    useVendorCart(vendorId);

  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  /* ================= FETCH PACKAGES ================= */
  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    const fetchPackages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_URL}/labnear/package/${vendorId}`,
          { headers: token ? { token } : {} }
        );

        if (res.data?.success === 1) {
          setPackages(res.data.details || []);
        } else {
          setPackages([]);
        }
      } catch {
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [vendorId]);
  /* ================================================= */

  const calculateDiscountedPrice = (amount, discount) =>
    Math.round(Number(amount) * (1 - Number(discount || 0) / 100));

  const cartTotal = cartItems.reduce(
    (sum, item) =>
      sum + calculateDiscountedPrice(item.amount, item.discountPercentage),
    0
  );

  const openCart = () => {
    const el = document.getElementById("ProductCart");
    bootstrap.Offcanvas.getOrCreateInstance(el).show();
  };

  return (
    <>
      {/* ================= PAGE ================= */}
      <div className="container py-5">
        {/* HEADER WITH BACK BUTTON */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold text-info mb-1">
              <i className="ri-gift-line me-2"></i>All Test Packages
            </h2>
            <p className="text-muted mb-0">
              Complete list of all available health check-up packages
            </p>
          </div>

          <button
            className="btn btn-outline-secondary rounded-pill"
            onClick={() => navigate(-1)}
          >
            <i className="ri-arrow-left-line me-1"></i> Back
          </button>
        </div>

        {loading ? (
          <p className="text-center text-muted">Loading packages...</p>
        ) : packages.length === 0 ? (
          <p className="text-center text-muted">
            No test packages available.
          </p>
        ) : (
          <div className="row">
            <div className="col-lg-8 mx-auto">
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="card mb-3 shadow-sm border-0 rounded-3"
                >
                  <div className="card-body d-flex justify-content-between">
                    <div>
                      <h6 className="fw-semibold mb-1">
                        {pkg.packageName}
                      </h6>
                      <p className="mb-0 text-muted">
                        Comprehensive check-up
                      </p>
                    </div>

                    <div className="text-end">
                      {pkg.discountPercentage > 0 && (
                        <small className="text-muted text-decoration-line-through d-block">
                          ₹{pkg.amount}
                        </small>
                      )}
                      <div className="fw-bold text-danger mb-1">
                        ₹{calculateDiscountedPrice(
                          pkg.amount,
                          pkg.discountPercentage
                        )}
                      </div>

                      <button
                        className={`btn btn-sm rounded-pill ${
                          isItemInCart(pkg._id)
                            ? "btn-success"
                            : "btn-info"
                        }`}
                        disabled={isItemInCart(pkg._id)}
                        onClick={() => addToCart(pkg)}
                      >
                        {isItemInCart(pkg._id) ? "Added" : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= FLOATING CART BUTTON ================= */}
      <button
        className="btn btn-primary rounded-pill position-fixed"
        style={{
          bottom: "2rem",
          right: "2rem",
          zIndex: 1050,
          padding: "0.75rem 1.5rem"
        }}
        onClick={openCart}
      >
        <i className="ri-shopping-cart-2-line me-2"></i>
        View Cart
        {cartItems.length > 0 && (
          <span className="badge bg-danger ms-2">{cartItems.length}</span>
        )}
      </button>

      {/* ================= CART OFFCANVAS ================= */}
      <div
        className="offcanvas offcanvas-bottom"
        id="ProductCart"
        style={{
          height: "85vh",
          maxWidth: "720px",
          margin: "0 auto",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px"
        }}
      >
        <div className="offcanvas-header bg-primary text-white">
          <h5 className="fw-bold mb-0">
            Your Cart ({cartItems.length})
          </h5>
          <button
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>

        <div className="offcanvas-body bg-light">
          {cartItems.length === 0 ? (
            <p className="text-center text-muted mt-5">
              Your cart is empty
            </p>
          ) : (
            cartItems.map((item) => {
              const finalPrice = calculateDiscountedPrice(
                item.amount,
                item.discountPercentage
              );
              const saved = item.amount - finalPrice;

              return (
                <div
                  key={item._id}
                  className="card border-0 shadow-sm mb-3"
                >
                  <div className="card-body">
                    <h6 className="fw-semibold mb-1">
                      {item.testName || item.packageName}
                    </h6>

                    <div className="d-flex gap-2 mb-2">
                      {item.testType && (
                        <span className="badge bg-light text-dark">
                          {item.testType}
                        </span>
                      )}
                      {item.testCategory && (
                        <span className="badge bg-light text-dark">
                          {item.testCategory}
                        </span>
                      )}
                      {item.discountPercentage > 0 && (
                        <span className="badge bg-success-subtle text-success">
                          {item.discountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        {item.discountPercentage > 0 && (
                          <small className="text-muted text-decoration-line-through">
                            ₹{item.amount}
                          </small>
                        )}
                        <div className="fw-bold text-success fs-6">
                          ₹{finalPrice}
                        </div>
                        {saved > 0 && (
                          <small className="text-success">
                            You save ₹{saved}
                          </small>
                        )}
                      </div>

                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-3 border-top bg-white">
            <div className="d-flex justify-content-between fw-bold fs-5 mb-2">
              <span>Total Payable</span>
              <span>₹{cartTotal}</span>
            </div>
            <button className="btn btn-success w-100 rounded-pill">
              Proceed to Book
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default TestPackages;