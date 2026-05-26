import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
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

function PendingMedicinesSubadmin() {
  const {
    pendingMedicinesSub,
    getPendingMedicinesSubadmin,
    approveMedicineSubadmin,
    rejectMedicineSubadmin,
  } = useContext(MyContext);

  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Dummy fallback images
  const dummyImages = useMemo(
    () => [
      "https://images.pexels.com/photos/3873209/pexels-photo-3873209.jpeg",
      "https://images.pexels.com/photos/51929/medications-cure-tablets-pharmacy-51929.jpeg",
      "https://images.pexels.com/photos/208512/pexels-photo-208512.jpeg",
    ],
    []
  );

  // Table Headers
  const tableHeaders = useMemo(
    () => [
      { key: "name", label: "Medicine Name" },
      { key: "manufacturers", label: "Manufacturer" },
      { key: "mrp", label: "MRP" },
      { key: "best_price", label: "Best Price" },
      { key: "prescription_required", label: "Prescription Required" },
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
      "prescription_required",
      "image_url",
      "actions",
    ])
  );

  useEffect(() => {
    getPendingMedicinesSubadmin();
  }, []);

  const currentMedicines = pendingMedicinesSub || [];

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

  const handleRowClick = (med) => {
    setSelectedMedicine(med);
    setShowDetailModal(true);
  };

  // Render cell content
  const renderCellContent = (medicine, header) => {
    const med = medicine.medicineId || {};

    switch (header.key) {
      case "image_url": {
        const img =
          Array.isArray(med.image_url) && med.image_url.length > 0
            ? med.image_url[0]
            : dummyImages[0];

        return (
          <MedicineImage
            src={img}
            alt={med.name || "Medicine"}
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

      case "prescription_required":
        return (
          <span
            className={`badge ${
              med.prescription_required === "YES"
                ? "bg-warning text-dark"
                : "bg-success"
            }`}
          >
            {med.prescription_required}
          </span>
        );

      case "best_price":
        return (
          <span className="text-success fw-bold">
            {med.best_price ? `₹${med.best_price}` : "N/A"}
          </span>
        );

      case "mrp":
        return <span className="fw-bold">{med.mrp ? `₹${med.mrp}` : "N/A"}</span>;

      case "actions":
        return (
          <div
            className="d-flex justify-content-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-success btn-sm"
              onClick={() => approveMedicineSubadmin(medicine._id)}
            >
              Approve
            </button>

            <button
              className="btn btn-danger btn-sm"
              onClick={() => rejectMedicineSubadmin(medicine._id)}
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
            title={med[header.key]}
          >
            {med[header.key] || "N/A"}
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
              Pending Medicines ({currentMedicines.length})
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
                  {currentMedicines.length > 0 ? (
                    currentMedicines.map((medicine, index) => (
                      <tr
                        key={medicine._id}
                        onClick={() => handleRowClick(medicine)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{index + 1}</td>

                        {visibleHeaders.map((header) => (
                          <td key={header.key}>
                            {renderCellContent(medicine, header)}
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
                        No pending medicines found.
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
      {showDetailModal && selectedMedicine && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "1000px" }}>
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedMedicine.medicineId?.name}
              </h5>
              <button
                className="btn-close"
                onClick={() => setShowDetailModal(false)}
              ></button>
            </div>

            <div className="modal-body">
              <p>
                <strong>Manufacturer: </strong>{" "}
                {selectedMedicine.medicineId?.manufacturers || "N/A"}
              </p>
              <p>
                <strong>MRP: </strong> ₹{selectedMedicine.medicineId?.mrp}
              </p>
              <p>
                <strong>Best Price: </strong>{" "}
                ₹{selectedMedicine.medicineId?.best_price}
              </p>
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

export default PendingMedicinesSubadmin;
