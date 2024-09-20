import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { setAuthToken } from '../../services/api';

// Thunk for user login
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      setAuthToken(response.data.token);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Thunk for admin sign-up
export const signupAdmin = createAsyncThunk(
  'user/signupAdmin',
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/signup-admin', adminData); // Adjust endpoint for admin sign-up
      setAuthToken(response.data.token);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Thunk for therapist sign-up
export const signupTherapist = createAsyncThunk(
  'user/signupTherapist',
  async (therapistData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/signup-therapist', therapistData); // Adjust endpoint for therapist sign-up
      setAuthToken(response.data.token);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
      setAuthToken(null); // Clear the auth token
      localStorage.removeItem('token'); // Clear token from localStorage
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
        localStorage.setItem('token', action.payload.token); // Store token in localStorage
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Login failed';
      })
      
      // Handle admin sign-up
      .addCase(signupAdmin.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signupAdmin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
        localStorage.setItem('token', action.payload.token); // Store token in localStorage
      })
      .addCase(signupAdmin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Admin signup failed';
      })

      // Handle therapist sign-up
      .addCase(signupTherapist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signupTherapist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
        localStorage.setItem('token', action.payload.token); // Store token in localStorage
      })
      .addCase(signupTherapist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Therapist signup failed';
      });
  },
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;
