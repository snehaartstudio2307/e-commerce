import { createSlice } from "@reduxjs/toolkit";

const savedUserInfo = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userInfo: savedUserInfo,
  },
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },

    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
    },
  },
});

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;