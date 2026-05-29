import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const URL = process.env.REACT_APP_API_URL;

export const submitPhoneNumber = createAsyncThunk(
  "auth/submitPhoneNumber",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${URL}/user/login`, userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.data);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (userData, { rejectWithValue }) => {
    try {
      // userData mein ab { otp, ctrCode, number, regId } charo honge
      const { data } = await axios.post(`${URL}/user/verify`, userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (formData, { rejectWithValue }) => {
    try {
      // Token nikalna zaroori hai kyunki backend mein middleware laga hai
      const token = JSON.parse(sessionStorage.getItem("token"));

      const { data } = await axios.put(`${URL}/user/update-user`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token, // Aapka middleware isi header key ko check kar raha hai
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error updating user");
    }
  }
);



export const verifypromo = createAsyncThunk(
  "auth/verifypromo",
  async (userData, { rejectWithValue }) => {
    try {
      const token = JSON.parse(sessionStorage.getItem("token"));

      const { data } = await axios.post(`${URL}/user/partner`, userData, {
        headers: {
          token: token,
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error occurred");
    }
  }
);

const otpSlice = createSlice({
  name: "auth",
  initialState: {
    ctrCode: "+91",
    number: "",
    otp: "",
    loading: false,
    error: null,
    otpSent: false,
    user: null,
    token: null,
    promoData: "",
  },
  reducers: {
    reset: (state) => {
      state.ctrCode = "+91";
      state.number = "";
      state.otp = "";
      state.promoData = "";
      state.loading = false;
      state.error = null;
      state.otpSent = false;
      state.user = null;
      state.token = null;
      sessionStorage.removeItem("token");
    },
  },
  extraReducers: (bulider) => {
    bulider
      .addCase(submitPhoneNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitPhoneNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.ctrCode = action.meta.arg.ctrCode;
        state.number = action.meta.arg.number;
        state.otpSent = true;
      })
      .addCase(submitPhoneNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    bulider
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.ctrCode = action.meta.arg.ctrCode;
        state.number = action.meta.arg.number;
        state.otp = action.meta.arg.otp;
        state.user = action.payload.user;
        state.token = action.payload.details.token;
        sessionStorage.setItem(
          "token",
          JSON.stringify(action.payload.details.token)
        );
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    bulider
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    bulider
      .addCase(verifypromo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifypromo.fulfilled, (state, action) => {
        state.loading = false;
        state.promoData = action.payload;
      })
      .addCase(verifypromo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { reset } = otpSlice.actions;

export default otpSlice.reducer;