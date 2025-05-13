import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const URL = process.env.REACT_APP_API_URL;

export const createtest = createAsyncThunk(
  "labtest/createtest",
  async (userData, { rejectWithValue }) => {
    try {
      const verify = JSON.parse(sessionStorage.getItem("labtoken"));

      const { data } = await axios.post(
        `${URL}/addTest/create-test`,
        userData,
        {
          headers: {
            token: verify.token,
          },
        }
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.data);
    }
  }
);

export const createpackages = createAsyncThunk(
  "labtest/createpackages",
  async (userData, { rejectWithValue }) => {
    try {
      const verify = JSON.parse(sessionStorage.getItem("labtoken"));
      const { data } = await axios.post(
        `${URL}/package/create-package`,
        userData,
        {
          headers: {
            token: verify.token,
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.data);
    }
  }
);

const labtest = createSlice({
  name: "labtest",
  initialState: {
    test: [],
    packages: [],
    loading: false,
    error: null,
  },
  extraReducers: (bulider) => {
    bulider
      .addCase(createtest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createtest.fulfilled, (state, action) => {
        state.loading = false;
        state.test = action.payload;
      })
      .addCase(createtest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createpackages.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createpackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload;
      })
      .addCase(createpackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default labtest.reducer
