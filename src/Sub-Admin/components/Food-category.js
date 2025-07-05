import React, { useContext, useState } from 'react';
import { MyContext } from '../../Context/Context';

const AddFoodCategory = () => {
  const [formState, setFormState] = useState({
    name: '',
    category: '',
    foodImage: null,
  });

  const { addFoodCategory, loading, message } = useContext(MyContext);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'foodImage') {
      setFormState({ ...formState, foodImage: files[0] });
    } else {
      setFormState({ ...formState, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formState.name);
    data.append('category', formState.category);
    if (formState.foodImage) data.append('foodImage', formState.foodImage);

    await addFoodCategory(data);
  };

  return (
    <div>
      <h2>Add Food Category</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input name="name" value={formState.name} onChange={handleChange} required />
        <input name="category" value={formState.category} onChange={handleChange} required />
        <input type="file" name="foodImage" accept="image/*" onChange={handleChange} />
        <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Category'}</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddFoodCategory;
