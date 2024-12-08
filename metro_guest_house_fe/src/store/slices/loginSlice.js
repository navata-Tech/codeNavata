import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

export const getLoggedInUser = async () => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER}/users/getCurrentUser`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        return res.data.profile;
      } else {
        localStorage.removeItem("token");
        window.location.reload();
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  }
};

export const logOut = () => {
  localStorage.removeItem("token");
};

export const loginSlice = createSlice({
  name: "loginSlice",
  initialState: { loggedIn: false, loggedInUser: {} },
  reducers: {
    login(state) {
      state.loggedIn = true;
    },
    logout(state) {
      state.loggedIn = false;
    },
    setUser(state, action) {
      state.loggedInUser = { ...action.payload };
    },
  },
});

export const loginActions = loginSlice.actions;
