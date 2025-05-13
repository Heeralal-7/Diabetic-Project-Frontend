import { configureStore } from '@reduxjs/toolkit';
import otpReducer from './signupSlice'
import labtestReducer from './labtestSlice';

const store = configureStore({
    reducer:{
     auth:otpReducer,
     labtest:labtestReducer
    }
})

export default store
