import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MyContext } from "../../../Context/Context";
import * as bootstrap from "bootstrap";

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

const PathologyTests = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { test, getVendortest } = useContext(MyContext);
  const [loading, setLoading] = useState(true);

  const {
    cartItems,
    addToCart,
    removeFromCart,
    isItemInCart
  } = useVendorCart(vendorId);

  useEffect(() => {
    if (vendorId) {
      getVendortest(vendorId).finally(() => setLoading(false));
    }
  }, [vendorId]);

  const pathologyTests = test.filter(
    (t) => t.testCategory === "Pathology"
  );

  const calculateDiscountedPrice = (amount, discount) =>
    Math.round(Number(amount) * (1 - Number(discount || 0) / 100));

  const cartTotal = cartItems.reduce(
    (sum, item) =>
      sum + calculateDiscountedPrice(item.amount, item.discountPercentage),
    0
  );

  const openCart = () => {
    bootstrap.Offcanvas.getOrCreateInstance(
      document.getElementById("ProductCart")
    ).show();
  };

  return (
    <>
      {/* ================= PAGE ================= */}
      <div className="container py-5">
        {/* HEADER WITH BACK BUTTON */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold text-primary mb-1">
              <i className="ri-flask-fill me-2"></i>All Pathology Tests
            </h2>
            <p className="text-muted mb-0">
              Complete list of all available pathology tests
            </p>
          </div>

          {/* BACK BUTTON */}
          <button
            className="btn btn-outline-secondary rounded-pill"
            onClick={() => navigate(-1)}
          >
            <i className="ri-arrow-left-line me-1"></i> Back
          </button>
        </div>

        {loading ? (
          <p className="text-center text-muted">Loading tests...</p>
        ) : pathologyTests.length > 0 ? (
          <div className="row">
            <div className="col-lg-8 mx-auto">
              {pathologyTests.map((v) => (
                <div
                  key={v._id}
                  className="card mb-3 shadow-sm border-0 rounded-3"
                >
                  <div className="card-body d-flex justify-content-between">
                    <div>
                      <h6 className="fw-semibold mb-1">{v.testName}</h6>
                      <span className="badge bg-light text-dark me-2">
                        {v.testType}
                      </span>
                      <span className="badge bg-light text-dark">
                        {v.testCategory}
                      </span>
                    </div>

                    <div className="text-end">
                      {v.discountPercentage > 0 && (
                        <small className="text-muted text-decoration-line-through">
                          ₹{v.amount}
                        </small>
                      )}
                      <div className="fw-bold text-success">
                        ₹{calculateDiscountedPrice(
                          v.amount,
                          v.discountPercentage
                        )}
                      </div>

                      <button
                        className={`btn btn-sm rounded-pill mt-1 ${
                          isItemInCart(v._id)
                            ? "btn-success"
                            : "btn-primary"
                        }`}
                        onClick={() => addToCart(v)}
                        disabled={isItemInCart(v._id)}
                      >
                        {isItemInCart(v._id) ? "Added" : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted">
            No pathology tests available.
          </p>
        )}
      </div>

      {/* ================= FLOATING CART BUTTON ================= */}
      <button
        className="btn btn-primary rounded-pill position-fixed"
        style={{
          bottom: "2rem",
          right: "2rem",
          zIndex: 1050
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

                    <div className="d-flex justify-content-between">
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
                        className="btn btn-outline-danger btn-lg rounded-circle"
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

export default PathologyTests;

