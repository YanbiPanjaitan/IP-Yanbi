import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

// Initial State
const initialState = {
  list: {
    data: [],
    totalData: 0,
    totalPages: 0,
    currentPage: 1,
  },
  detail: {},
  summary: "",
  photos: [],
  coordinates: {},
  reviews: [],
  status: "idle",
  error: null,
};

// Async Thunks for API endpoints
export const fetchCountries = createAsyncThunk(
  "countries/fetchCountries",
  async ({page = 1, limit = 20, search, filter}) => {
    const response = await axios({
      method: "GET",
      url: "http://localhost:3000/countries",
      params: {page, limit, search, filter},
    });
    return response.data;
  }
);

// Add a new async thunk for fetching country details
export const fetchCountryDetails = createAsyncThunk(
  "countries/fetchCountryDetails",
  async (id) => {
    const response = await axios({
      method: "GET",
      url: `http://localhost:3000/countries/${id}`,
    });
    return response.data;
  }
);
// Redux Slice
const countriesSlice = createSlice({
  name: "countries",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = {
          data: action.payload.data,
          totalData: action.payload.totalData,
          totalPages: action.payload.totalPage,
          currentPage: action.payload.page,
        };
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchCountryDetails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCountryDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.detail = action.payload;
      })
      .addCase(fetchCountryDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default countriesSlice.reducer;
