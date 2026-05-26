// components/SubAdmin/SubadminBlogsDashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../../Context/Context";
import { Link } from "react-router-dom";

/**
 * Single-file Subadmin Blogs Management dashboard
 * - Tabs: Add Blog | Add Subheading | Blogs List | Blog Details
 * - Uses Subadmin context functions (names must match)
 *
 * Usage: render at route /subadmin-dashboard/blogs
 */

const SubadminBlogsDashboard = () => {
  const {
    // context functions & state you provided earlier
    getSubAdminBlogs,
    searchSubAdminBlogs,
    createSubAdminBlog,
    getSubAdminBlogDetails,
    deleteSubAdminBlog,
    updateSubAdminBlog,
    createSubAdminSubheading,
    getSubAdminSubheadingList,
    updateSubAdminSubheading,
    deleteSubAdminSubheading,

    // optional context flags (if available)
    loading,
    error,
    clearError,
  } = useContext(MyContext);

  // UI Tab state
  const [activeTab, setActiveTab] = useState("list"); // 'add', 'subheading', 'list', 'detail'

  // List / pagination / search
  const [blogs, setBlogs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const LIMIT = parseInt(process.env.REACT_APP_LIMIT || "10", 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshToggle, setRefreshToggle] = useState(false);

  // Add Blog form
  const [addForm, setAddForm] = useState({
    title: "",
    description: "",
    conclusion: "",
    created_by: "",
    type: "",
    blogimage: null,
  });
  const [addErrors, setAddErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Subheading add (for currently selected blog in details or last created)
  const [subForm, setSubForm] = useState({ title: "", description: "", mainFormId: "" });

  // Details view state
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [particularBlog, setParticularBlog] = useState(null);

  // Update blog form (populated when selecting a blog)
  const [updateForm, setUpdateForm] = useState({
    title: "",
    description: "",
    conclusion: "",
    created_by: "",
    type: "",
    blogimage: null, // File or existing path
  });

  // Subheading modal / editing
  const [editingSubheading, setEditingSubheading] = useState(null);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [addSubModalOpen, setAddSubModalOpen] = useState(false);

  const URL = process.env.REACT_APP_API_URL || "";

  // ------------- Helpers ----------------
  const resetAddForm = () => {
    setAddForm({
      title: "",
      description: "",
      conclusion: "",
      created_by: "",
      type: "",
      blogimage: null,
    });
    setImagePreview(null);
    setAddErrors({});
  };

  // Validate Add Blog
  const validateAdd = () => {
    const errs = {};
    if (!addForm.title || addForm.title.length < 3) errs.title = "Title is required (min 3 chars).";
    if (!addForm.description || addForm.description.length < 10) errs.description = "Description is required (min 10 chars).";
    if (!addForm.conclusion || addForm.conclusion.length < 5) errs.conclusion = "Conclusion is required (min 5 chars).";
    if (!addForm.created_by || addForm.created_by.length < 3) errs.created_by = "Created by is required (min 3 chars).";
    if (!addForm.type) errs.type = "Type is required.";
    if (!addForm.blogimage) errs.blogimage = "Image is required.";
    else {
      const ext = addForm.blogimage.name.split(".").pop().toLowerCase();
      if (!["jpg", "jpeg", "png", "gif"].includes(ext)) errs.blogimage = "Invalid image format.";
    }
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Build FormData from object (for image upload)
  const buildFormData = (obj) => {
    const fd = new FormData();
    Object.keys(obj).forEach((k) => {
      if (obj[k] !== undefined && obj[k] !== null) {
        fd.append(k, obj[k]);
      }
    });
    return fd;
  };

  // ------------- Fetching -------------
  const fetchBlogs = async (p = 1) => {
    try {
      const resp = await getSubAdminBlogs(p, LIMIT);
      // getSubAdminBlogs should return response with details and pages OR set in context
      if (resp && resp.success === 1) {
        setBlogs(Array.isArray(resp.details) ? resp.details : []);
        if (resp.pages) setTotalPages(resp.pages);
      } else if (resp && resp.success === 0) {
        setBlogs([]);
      }
    } catch (err) {
      console.error("fetchBlogs error", err);
    }
  };

  const doSearch = async (q) => {
    try {
      const resp = await searchSubAdminBlogs(q);
      if (resp && resp.success === 1) {
        setBlogs(Array.isArray(resp.details) ? resp.details : []);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("search error", err);
    }
  };

  useEffect(() => {
    if (activeTab === "list") fetchBlogs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, refreshToggle]);

  // When searchQuery changes (debounce lightly)
  useEffect(() => {
    if (!searchQuery) {
      fetchBlogs(1);
      setPage(1);
      return;
    }
    const id = setTimeout(() => doSearch(searchQuery), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ------------- Handlers -------------
  // Add form handlers - FIXED HERE
  const handleAddChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setAddForm((prev) => ({ ...prev, [name]: file }));
      if (file) {
        // FIX: Use window.URL.createObjectURL or check if URL exists
        const objectUrl = window.URL ? window.URL.createObjectURL(file) : null;
        setImagePreview(objectUrl);
      }
    } else {
      setAddForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateAdd()) return;
    try {
      const fd = buildFormData(addForm);
      const resp = await createSubAdminBlog(fd);
      if (resp && resp.success === 1) {
        // after creating, switch to add-subheading tab and prefill mainFormId
        setSubForm((prev) => ({ ...prev, mainFormId: resp._id || resp.data?._id || "" }));
        setActiveTab("subheading");
        resetAddForm();
        setRefreshToggle((t) => !t);
      } else {
        alert(resp.message || "Failed to create blog.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong creating blog.");
    }
  };

  // Delete blog
  const handleDeleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const resp = await deleteSubAdminBlog(id);
      if (resp && resp.success === 1) {
        setRefreshToggle((t) => !t);
      } else {
        alert(resp.message || "Failed to delete blog");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting blog");
    }
  };

  // View details
  const openBlogDetails = async (id) => {
    try {
      const resp = await getSubAdminBlogDetails(id);
      if (resp && resp.success === 1) {
        setParticularBlog(resp.details);
        setSelectedBlogId(id);
        setUpdateForm({
          title: resp.details.title || "",
          description: resp.details.description || "",
          conclusion: resp.details.conclusion || "",
          created_by: resp.details.created_by || "",
          type: resp.details.type || "",
          blogimage: resp.details.blogimage || null,
        });
        setActiveTab("detail");
      } else {
        alert(resp.message || "Failed to fetch blog");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update blog submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBlogId) return;
    try {
      const fd = buildFormData(updateForm);
      const resp = await updateSubAdminBlog(selectedBlogId, fd);
      if (resp && resp.success === 1) {
        alert("Updated successfully");
        // refresh details & list
        await openBlogDetails(selectedBlogId);
        setRefreshToggle((t) => !t);
      } else {
        alert(resp.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating blog");
    }
  };

  // Update form change
  const handleUpdateChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setUpdateForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setUpdateForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Subheading add for a blog
  const handleAddSubheading = async (e) => {
    e.preventDefault();
    if (!subForm.title || !subForm.description || !subForm.mainFormId) {
      alert("All fields are required for subheading.");
      return;
    }
    try {
      const resp = await createSubAdminSubheading({
        title: subForm.title,
        description: subForm.description,
        mainFormId: subForm.mainFormId,
      });
      if (resp && resp.success === 1) {
        alert("Subheading added");
        setSubForm({ title: "", description: "", mainFormId: "" });
        setRefreshToggle((t) => !t);
        // if viewing details of same blog, refresh it
        if (selectedBlogId === subForm.mainFormId) openBlogDetails(selectedBlogId);
      } else {
        alert(resp.message || "Failed to add subheading");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding subheading");
    }
  };

  // Open add-subheading modal for current blog
  const openAddSubForBlog = (mainFormId) => {
    setSubForm({ ...subForm, mainFormId });
    setActiveTab("subheading");
  };

  // Open edit subheading modal
  const openEditSubheading = (sub) => {
    setEditingSubheading(sub);
    setSubModalOpen(true);
  };

  const handleSaveEditedSubheading = async () => {
    if (!editingSubheading || !editingSubheading._id) return;
    try {
      const resp = await updateSubAdminSubheading(editingSubheading._id, {
        title: editingSubheading.title,
        description: editingSubheading.description,
        mainFormId: editingSubheading.mainFormId,
      });
      if (resp && resp.success === 1) {
        alert("Subheading updated");
        setSubModalOpen(false);
        setEditingSubheading(null);
        if (selectedBlogId) openBlogDetails(selectedBlogId);
        setRefreshToggle((t) => !t);
      } else {
        alert(resp.message || "Failed to update subheading");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating subheading");
    }
  };

  // Delete subheading
  const handleDeleteSubheading = async (mainFormId, subheadingId) => {
    if (!window.confirm("Delete this subheading?")) return;
    try {
      const resp = await deleteSubAdminSubheading(mainFormId, subheadingId);
      if (resp && resp.success === 1) {
        alert("Deleted");
        if (selectedBlogId) openBlogDetails(selectedBlogId);
        setRefreshToggle((t) => !t);
      } else {
        alert(resp.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting subheading");
    }
  };

  // ------------- Render helpers -------------
  const renderTabs = () => (
    <ul className="nav nav-tabs mb-3">
      <li className="nav-item">
        <button className={`nav-link ${activeTab === "add" ? "active" : ""}`} onClick={() => setActiveTab("add")}>
          Add Blog
        </button>
      </li>
      <li className="nav-item">
        <button className={`nav-link ${activeTab === "subheading" ? "active" : ""}`} onClick={() => setActiveTab("subheading")}>
          Add Subheading
        </button>
      </li>
      <li className="nav-item">
        <button className={`nav-link ${activeTab === "list" ? "active" : ""}`} onClick={() => setActiveTab("list")}>
          Blogs
        </button>
      </li>
      <li className="nav-item">
        <button className={`nav-link ${activeTab === "detail" ? "active" : ""}`} onClick={() => {
          if (selectedBlogId) setActiveTab("detail");
        }} disabled={!selectedBlogId}>
          Blog Details
        </button>
      </li>
    </ul>
  );

  // ----------------- JSX -------------------
  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Subadmin Blogs Management</h3>
        <div>
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => { clearError && clearError(); setRefreshToggle(t => !t); }}>
            Refresh
          </button>
        </div>
      </div>

      {renderTabs()}

      {/* Add Blog */}
      {activeTab === "add" && (
        <div className="card mb-4">
          <div className="card-header"><h5 className="mb-0">Add Blog</h5></div>
          <div className="card-body">
            <form onSubmit={handleAddSubmit}>
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label">Title</label>
                  <input name="title" value={addForm.title} onChange={handleAddChange} className="form-control" />
                  {addErrors.title && <small className="text-danger">{addErrors.title}</small>}
                </div>

                <div className="col-md-12">
                  <label className="form-label">Description</label>
                  <textarea name="description" value={addForm.description} onChange={handleAddChange} className="form-control" rows={4} />
                  {addErrors.description && <small className="text-danger">{addErrors.description}</small>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Created By</label>
                  <input name="created_by" value={addForm.created_by} onChange={handleAddChange} className="form-control" />
                  {addErrors.created_by && <small className="text-danger">{addErrors.created_by}</small>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Type</label>
                  <select name="type" value={addForm.type} onChange={handleAddChange} className="form-control">
                    <option value="">Select Type</option>
                    <option>Doctor Tips</option>
                    <option>Mind & Body</option>
                    <option>Monitoring</option>
                    <option>Food Lab</option>
                    <option>Recipes</option>
                    <option>Food & Nutrition</option>
                  </select>
                  {addErrors.type && <small className="text-danger">{addErrors.type}</small>}
                </div>

                <div className="col-md-12">
                  <label className="form-label">Conclusion</label>
                  <textarea name="conclusion" value={addForm.conclusion} onChange={handleAddChange} className="form-control" rows={3} />
                  {addErrors.conclusion && <small className="text-danger">{addErrors.conclusion}</small>}
                </div>

                <div className="col-md-12">
                  <label className="form-label">Image</label>
                  <input type="file" accept="image/*" name="blogimage" onChange={handleAddChange} className="form-control" />
                  {addErrors.blogimage && <small className="text-danger">{addErrors.blogimage}</small>}
                </div>

                {imagePreview && (
                  <div className="col-md-12">
                    <label className="form-label">Image Preview</label>
                    <div>
                      <img src={imagePreview} alt="preview" style={{ width: 200, height: 200, objectFit: "cover", borderRadius: 8 }} />
                    </div>
                  </div>
                )}

                <div className="col-12">
                  <button type="submit" className="btn btn-primary">Add Blog</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subheading */}
      {activeTab === "subheading" && (
        <div className="card mb-4">
          <div className="card-header"><h5 className="mb-0">Add Subheading</h5></div>
          <div className="card-body">
            <form onSubmit={handleAddSubheading}>
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label">Subheading Title</label>
                  <input name="title" value={subForm.title} onChange={(e) => setSubForm((p) => ({ ...p, title: e.target.value }))} className="form-control" />
                </div>

                <div className="col-md-12">
                  <label className="form-label">Subheading Description</label>
                  <textarea name="description" value={subForm.description} onChange={(e) => setSubForm((p) => ({ ...p, description: e.target.value }))} className="form-control" rows={4} />
                </div>

                <div className="col-12">
                  <button className="btn btn-primary">Add Subheading</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blogs List */}
      {activeTab === "list" && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">All Blogs</h5>
            <div className="d-flex align-items-center gap-2">
              <input className="form-control form-control-sm" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button className="btn btn-sm btn-outline-secondary" onClick={() => { setSearchQuery(""); fetchBlogs(1); }}>Clear</button>
            </div>
          </div>

          <div className="card-body">
            <div style={{ overflowX: "auto" }}>
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Image</th>
                    <th>Conclusion</th>
                    <th>Created By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs && blogs.length > 0 ? blogs.map((b, idx) => (
                    <tr key={b._id}>
                      <td>{(page - 1) * LIMIT + idx + 1}</td>
                      <td title={b.title}>{b.title}</td>
                      <td title={b.description}>{b.description?.slice(0, 40)}{b.description?.length > 40 ? "..." : ""}</td>
                      <td>{b.type}</td>
                      <td>
                        {b.blogimage ? (
                          <img src={`${URL}/${b.blogimage}`} alt="blog" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "50%" }} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/50x50?text=No+Image"; }} />
                        ) : <div style={{ width: 50, height: 50, background: "#eee", borderRadius: "50%" }} />}
                      </td>
                      <td>{b.conclusion?.slice(0, 30)}{b.conclusion?.length > 30 ? "..." : ""}</td>
                      <td>{b.created_by}</td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openBlogDetails(b._id)}>View</button>
                          <button className="btn btn-sm btn-outline-success" onClick={() => openAddSubForBlog(b._id)}>Add Subheading</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteBlog(b._id)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8} className="text-center py-4">No blogs found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>Page {page} / {totalPages}</div>
              <div>
                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => { if (page > 1) setPage((p) => p - 1); }} disabled={page <= 1}>Previous</button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => { if (page < totalPages) setPage((p) => p + 1); }} disabled={page >= totalPages}>Next</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Details / Update */}
      {activeTab === "detail" && particularBlog && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Blog Details</h5>
            <div>
              <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => setActiveTab("list")}>Back to List</button>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleUpdateSubmit} className="row g-3">
              <div className="col-12">
                <label className="form-label">Title</label>
                <input name="title" value={updateForm.title} onChange={handleUpdateChange} className="form-control" />
              </div>

              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea name="description" value={updateForm.description} onChange={handleUpdateChange} className="form-control" rows={4} />
              </div>

              <div className="col-md-6">
                <label className="form-label">Created By</label>
                <input name="created_by" value={updateForm.created_by} onChange={handleUpdateChange} className="form-control" />
              </div>

              <div className="col-md-6">
                <label className="form-label">Type</label>
                <select name="type" value={updateForm.type} onChange={handleUpdateChange} className="form-control">
                  <option value="">Select Type</option>
                  <option>Doctor Tips</option>
                  <option>Mind & Body</option>
                  <option>Monitoring</option>
                  <option>Food Lab</option>
                  <option>Recipes</option>
                  <option>Food & Nutrition</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">Conclusion</label>
                <textarea name="conclusion" value={updateForm.conclusion} onChange={handleUpdateChange} className="form-control" rows={3} />
              </div>

              <div className="col-12">
                <label className="form-label">Image</label>
                <input type="file" accept="image/*" name="blogimage" onChange={handleUpdateChange} className="form-control" />
                {updateForm.blogimage && (
                  <div className="mt-2">
                    {/* FIX: Use window.URL.createObjectURL here too */}
                    <img src={updateForm.blogimage instanceof File ? (window.URL ? window.URL.createObjectURL(updateForm.blogimage) : "") : `${URL}/${updateForm.blogimage}`} alt="preview" style={{ maxWidth: 300, borderRadius: 8 }} onError={(e) => e.target.style.display = "none"} />
                  </div>
                )}
              </div>

              <div className="col-12">
                <button className="btn btn-primary">Update Blog</button>
              </div>
            </form>

            {/* Subheadings */}
            <div className="mt-4">
              <h6>Subheadings</h6>
              {particularBlog.subheadingId && particularBlog.subheadingId.length > 0 ? (
                particularBlog.subheadingId.map((s) => (
                  <div key={s._id} className="d-flex align-items-start gap-3 mb-3">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{s.title}</h6>
                      <p className="mb-0">{s.description}</p>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEditSubheading(s)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteSubheading(particularBlog._id, s._id)}>Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No subheadings</p>
              )}

              <div>
                <button className="btn btn-sm btn-outline-primary" onClick={() => { setAddSubModalOpen(true); setSubForm({ ...subForm, mainFormId: particularBlog._id }); }}>Add Subheading</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subheading Modal */}
      {subModalOpen && editingSubheading && (
        <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Subheading</h5>
                <button className="btn-close" onClick={() => { setSubModalOpen(false); setEditingSubheading(null); }} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input className="form-control" value={editingSubheading.title} onChange={(e) => setEditingSubheading((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={4} value={editingSubheading.description} onChange={(e) => setEditingSubheading((p) => ({ ...p, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setSubModalOpen(false); setEditingSubheading(null); }}>Close</button>
                <button className="btn btn-primary" onClick={handleSaveEditedSubheading}>Save changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subheading Modal */}
      {addSubModalOpen && subForm.mainFormId && (
        <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Subheading</h5>
                <button className="btn-close" onClick={() => { setAddSubModalOpen(false); setSubForm({ title: "", description: "", mainFormId: "" }); }} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input className="form-control" value={subForm.title} onChange={(e) => setSubForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={4} value={subForm.description} onChange={(e) => setSubForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setAddSubModalOpen(false); setSubForm({ title: "", description: "", mainFormId: "" }); }}>Close</button>
                <button className="btn btn-primary" onClick={async () => {
                  await handleAddSubheading(new Event("submit"));
                  setAddSubModalOpen(false);
                }}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubadminBlogsDashboard;