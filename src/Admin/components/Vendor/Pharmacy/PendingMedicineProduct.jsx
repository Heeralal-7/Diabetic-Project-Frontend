import React, {
    useState,
    useEffect,
    useContext,
    useMemo,
    useCallback,
  } from "react";
  // Path adjust kar lena apne project structure ke hisab se
  import { MyContext } from "../../../../Context/Context";
 
  // Memoized Image Component
  const MedicineImage = React.memo(({ src, alt, className, style, onError }) => {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        onError={onError}
        loading="lazy"
      />
    );
  });
 
  function PendingMedicinesProducts() {
    const {
      pendingProducts,    // State from Context
      getPendingMedicineProducts, // Function to fetch
      updateProductStatus // Unified function for Approve/Reject
    } = useContext(MyContext);
 
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
 
    // Dummy fallback images
    const dummyImages = useMemo(
      () => [
        "https://images.pexels.com/photos/3873209/pexels-photo-3873209.jpeg",
        "https://images.pexels.com/photos/51929/medications-cure-tablets-pharmacy-51929.jpeg",
      ],
      []
    );
 
    // Table Headers (Removed Prescription)
    const tableHeaders = useMemo(
      () => [
        { key: "name", label: "Product Name" },
        { key: "manufacturers", label: "Manufacturer" },
        { key: "mrp", label: "MRP" },
        { key: "best_price", label: "Best Price" },
        // Prescription Required removed as requested
        { key: "image_url", label: "Image" },
        { key: "actions", label: "Actions" },
      ],
      []
    );
 
    // Visible columns
    const [visibleColumns, setVisibleColumns] = useState(
      new Set([
        "name",
        "manufacturers",
        "mrp",
        "best_price",
        "image_url",
        "actions",
      ])
    );
 
    useEffect(() => {
      getPendingMedicineProducts();
      // eslint-disable-next-line
    }, []);
 
    const currentProducts = pendingProducts || [];
 
    const toggleColumn = useCallback((columnKey) => {
      setVisibleColumns((prev) => {
        const newVisible = new Set(prev);
        newVisible.has(columnKey)
          ? newVisible.delete(columnKey)
          : newVisible.add(columnKey);
        return newVisible;
      });
    }, []);
 
    const visibleHeaders = useMemo(
      () => tableHeaders.filter((h) => visibleColumns.has(h.key)),
      [tableHeaders, visibleColumns]
    );
 
    const handleImageError = useCallback(
      (e) => {
        e.target.src =
          dummyImages[Math.floor(Math.random() * dummyImages.length)];
      },
      [dummyImages]
    );
 
    const handleRowClick = (prod) => {
      setSelectedProduct(prod);
      setShowDetailModal(true);
    };
 
    // Render cell content
    const renderCellContent = (product, header) => {
      // Note: Ab data direct 'product' object me hai, 'product.medicineId' me nahi
     
      switch (header.key) {
        case "image_url": {
          // API response me image_url string hai, array nahi
          const img = product.image_url ? product.image_url : dummyImages[0];
 
          return (
            <MedicineImage
              src={img}
              alt={product.name || "Product"}
              className="medicine-image"
              style={{
                width: "40px",
                height: "40px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
              onError={handleImageError}
            />
          );
        }
 
        case "best_price":
          return (
            <span className="text-success fw-bold">
              {product.best_price ? `₹${product.best_price}` : "N/A"}
            </span>
          );
 
        case "mrp":
          return <span className="fw-bold">{product.mrp ? `₹${product.mrp}` : "N/A"}</span>;
 
        case "actions":
          return (
            <div
              className="d-flex justify-content-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Approve Button: Status 0 */}
              <button
                className="btn btn-success btn-sm"
                onClick={() => updateProductStatus(product._id, 0)}
              >
                Approve
              </button>
 
              {/* Reject Button: Status 1 */}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => updateProductStatus(product._id, 1)}
              >
                Reject
              </button>
            </div>
          );
 
        default:
          return (
            <span
              className="text-truncate d-block"
              style={{ maxWidth: "200px" }}
              title={product[header.key]}
            >
              {product[header.key] || "N/A"}
            </span>
          );
      }
    };
 
    return (
      <>
        <div className="container-fluid py-4">
          {/* COLUMN VISIBILITY */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Column Visibility</h5>
              <div className="row">
                {tableHeaders.map((header) => (
                  <div key={header.key} className="col-md-3 col-sm-6 mb-2">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={visibleColumns.has(header.key)}
                        onChange={() => toggleColumn(header.key)}
                        id={`col-${header.key}`}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`col-${header.key}`}
                      >
                        {header.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          {/* TABLE */}
          <div className="card">
            <div className="card-header d-flex justify-content-between">
              <h3 className="mb-0 text-primary">
                Hospital Products ({currentProducts.length})
              </h3>
            </div>
 
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>S.No</th>
                      {visibleHeaders.map((header) => (
                        <th key={header.key}>{header.label}</th>
                      ))}
                    </tr>
                  </thead>
 
                  <tbody>
                    {currentProducts.length > 0 ? (
                      currentProducts.map((product, index) => (
                        <tr
                          key={product._id}
                          onClick={() => handleRowClick(product)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{index + 1}</td>
 
                          {visibleHeaders.map((header) => (
                            <td key={header.key}>
                              {renderCellContent(product, header)}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={visibleHeaders.length + 1}
                          className="text-center py-4"
                        >
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
 
        {/* DETAILS MODAL */}
        {showDetailModal && selectedProduct && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: "800px" }}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedProduct.name}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
 
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4">
                    <img
                      src={selectedProduct.image_url || dummyImages[0]}
                      alt={selectedProduct.name}
                      className="img-fluid rounded mb-3"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="col-md-8">
                    <p><strong>Manufacturer: </strong> {selectedProduct.manufacturers || "N/A"}</p>
                    <p><strong>MRP: </strong> ₹{selectedProduct.mrp}</p>
                    <p><strong>Best Price: </strong> ₹{selectedProduct.best_price}</p>
                    <p><strong>Description: </strong> {selectedProduct.description || "N/A"}</p>
                    <p><strong>Primary Use: </strong> {selectedProduct.primary_use || "N/A"}</p>
                    {/* Status Indicator */}
                    <p>
                      <strong>Current Status: </strong>
                      {selectedProduct.onStatus === 0 || selectedProduct.onStatus === "0" ? (
                        <span className="badge bg-success">Approved</span>
                      ) : selectedProduct.onStatus === 1 || selectedProduct.onStatus === "1" ? (
                        <span className="badge bg-danger">Rejected</span>
                      ) : (
                        <span className="badge bg-warning text-dark">Pending</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
 
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
 
  export default PendingMedicinesProducts;
 