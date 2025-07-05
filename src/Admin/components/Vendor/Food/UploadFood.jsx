import { useState, useContext, useEffect } from 'react';
import { MyContext } from "../../../../Context/Context";
import { toast } from "react-toastify";
 
 
export default function UploadFood() {
  const {
    addCategory,
    addMeal
 
  } = useContext(MyContext);
 
  const [meal, setMeal] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [mealImage, setMealImage] = useState(null);
  const [mealImagePreview, setMealImagePreview] = useState(null);
  const [categoryImage, setCategoryImage] = useState(null);
  const [subCategoryImage, setSubCategoryImage] = useState(null);
  const [loading, setLoading] = useState({
    meal: false,
    category: false,
    subCategory: false
  });
 
  // Cleanup function for image preview URLs
  useEffect(() => {
    return () => {
      if (mealImagePreview) {
        URL.revokeObjectURL(mealImagePreview);
      }
    };
  }, [mealImagePreview]);
 
  const handleUpload = async (e, fieldName) => {
    e.preventDefault();
 
    setLoading(prev => ({ ...prev, [fieldName.toLowerCase().replace(' ', '')]: true }));
 
    try {
      if (fieldName === "Meal") {
        // Check if meal name is provided
        if (!meal.trim()) {
          toast.error("Please enter meal name");
          return;
        }
 
        // Updated to use addMeal API with correct data structure
        const mealData = {
          name: meal.trim(),
          image: mealImage // This can be null if no image is selected
        };
 
        console.log("Sending meal data:", mealData); // Debug log
 
        const result = await addMeal(mealData);
        if (result.success) {
          // Reset form
          setMeal('');
          setMealImage(null);
          if (mealImagePreview) {
            URL.revokeObjectURL(mealImagePreview);
            setMealImagePreview(null);
          }
          // Reset file input
          const fileInput = document.getElementById('meal-image');
          if (fileInput) fileInput.value = '';
        }
      }
      else if (fieldName === "Category") {
        if (!category.trim()) {
          toast.error("Please enter category name");
          return;
        }
 
        const categoryData = {
          name: category.trim(),
          category: "category",
          foodImage: categoryImage
        };
        const result = await addCategory(categoryData);
        if (result.success) {
          setCategory('');
          setCategoryImage(null);
          // Reset file input
          const fileInput = document.getElementById('category-image');
          if (fileInput) fileInput.value = '';
        }
      }
      else if (fieldName === "Sub Category") {
        if (!subCategory.trim()) {
          toast.error("Please enter sub category name");
          return;
        }
 
        const subCategoryData = {
          name: subCategory.trim(),
          category: "subcategory",
          foodImage: subCategoryImage
        };
        const result = await addCategory(subCategoryData);
        if (result.success) {
          setSubCategory('');
          setSubCategoryImage(null);
          // Reset file input
          const fileInput = document.getElementById('subcategory-image');
          if (fileInput) fileInput.value = '';
        }
      }
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [fieldName.toLowerCase().replace(' ', '')]: false }));
    }
  };
 
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
 
    if (type === 'meal') {
      setMealImage(file);
      // Cleanup previous preview URL
      if (mealImagePreview) {
        URL.revokeObjectURL(mealImagePreview);
      }
      // Create new preview URL for meal image
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setMealImagePreview(previewUrl);
      } else {
        setMealImagePreview(null);
      }
    } else if (type === 'category') {
      setCategoryImage(file);
    } else if (type === 'subcategory') {
      setSubCategoryImage(file);
    }
  };
 
  const handleChooseFile = (type) => {
    const fileInput = document.getElementById(`${type}-image`);
    if (fileInput) {
      fileInput.click();
    }
  };
 
  return (
    <div className="container p-4">
      <div className="row">
        <h2 className="text-center me-5 mb-4 fw-bold fs-1">Food Upload</h2>
 
        {/* Meal Section */}
        <div className="my-4">
          <h6 className="mb-2 fw-semibold fs-4">Meal Name :</h6>
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control w-100 shadow-none fs-5 py-3"
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
                placeholder="Enter meal name"
              />
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-primary py-3 w-100"
                onClick={(e) => handleUpload(e, "Meal")}
                disabled={loading.meal || !meal.trim()}
              >
                {loading.meal ? (
                  <span className="spinner-border spinner-border-sm mx-2" role="status"></span>
                ) : (
                  <i className="fa-solid fa-upload mx-2"></i>
                )}
                {loading.meal ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
 
          {/* Choose File Button Row */}
          <div className="row g-3 mt-1">
            <div className="col-md-4">
              <input
                type="file"
                id="meal-image"
                className="form-control shadow-none fs-6 py-2"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'meal')}
              />
            </div>
            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-outline-secondary py-2 w-100"
                onClick={() => handleChooseFile('meal')}
              >
                <i className="fa-solid fa-image mx-2"></i>
                Choose image
              </button>
            </div>
 
            {/* Meal Image Preview */}
            {mealImagePreview && (
              <div className="col-4 d-flex justify-content-end">
                <div className="text-center">
                  <img
                    src={mealImagePreview}
                    alt="Meal Preview"
                    className="rounded-circle"
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      border: '2px solid #007bff'
                    }}
                  />
                  <p className="mt-2 text-muted small">Meal Image</p>
                </div>
              </div>
            )}
          </div>
        </div>
 
 
        {/* Category Section - Updated to match Sub Category layout */}
        <div className="my-1">
          <h6 className="mb-3 fs-4">Category Name :</h6>
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control shadow-none fs-5 py-3 mb-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter category"
              />
              <input
                type="file"
                id="category-image"
                className="form-control shadow-none"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'category')}
              />
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-primary py-3 w-100"
                onClick={(e) => handleUpload(e, "Category")}
                disabled={loading.category || !category.trim()}
              >
                {loading.category ? (
                  <span className="spinner-border spinner-border-sm mx-2" role="status"></span>
                ) : (
                  <i className="fa-solid fa-upload mx-2"></i>
                )}
                {loading.category ? 'Uploading..' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
 
        {/* Sub Category Section */}
        <div className="my-4">
          <h6 className="mb-3 fs-4">Sub Category Name :</h6>
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control shadow-none fs-5 py-3 mb-2"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="Enter sub category"
              />
              <input
                type="file"
                id="subcategory-image"
                className="form-control shadow-none"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'subcategory')}
              />
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-primary py-3 w-100"
                onClick={(e) => handleUpload(e, "Sub Category")}
                disabled={loading.subcategory || !subCategory.trim()}
              >
                {loading.subcategory ? (
                  <span className="spinner-border spinner-border-sm mx-2" role="status"></span>
                ) : (
                  <i className="fa-solid fa-upload mx-2"></i>
                )}
                {loading.subcategory ? 'Uploading..' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
        {/* Calories */}
        <div className="my-4">
          <h6 className="mb-3 fs-4">Calories :</h6>
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control shadow-none fs-5 py-3 mb-2"
                placeholder="Enter Calories"
              />
         
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-primary py-3 w-100"
              >
                <i className="fa-solid fa-upload mx-2"></i>
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 