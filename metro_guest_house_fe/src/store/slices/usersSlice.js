import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export const getImage = async (image) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_STATIC}/${image.replace(/\\/g, "/")}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: "blob",
      }
    );
    const url = URL.createObjectURL(new Blob([response.data]));
    if (url) {
      return url;
    } else {
      return 1;
    }
  } catch (error) {
    if (error.response && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
    return 0;
  }
};

export const getUser = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_SERVER}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return res.data.allusers;
  } catch (error) {
    if (error.response && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
  }
};

export const getServerStatus = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_SERVER}/users/serverStat`
    );
    if (res.data.success) {
      return res.data.stat;
    } else {
      console.error("Server Error", response);
      return "server down";
    }
  } catch (error) {
    if (error.response && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
    return "server down";
  }
};

export const getSelectedUser = async (userId) => {
  try {
    console.log("getting", `${import.meta.env.VITE_SERVER}/users/${userId}`);
    const res = await axios.get(
      `${import.meta.env.VITE_SERVER}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (res.data.success) {
      return res.data.user;
    } else {
      return null;
    }
  } catch (error) {
    if (error.response && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
  }
};

export const deleteStaff = async (staffId) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_SERVER}/users/${staffId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log(response);
    if (response.data.success) {
      return response.data;
    } else {
      console.error("Server Error");
      alert("InternalServerError");
    }
  } catch (error) {
    if (error.response && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
  }
};

export const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    selectedUserDetails: {},
    myProfile: {},
    clickedImg: {
      clicked: false,
      img: "",
    },
  },
  reducers: {
    setUsers(state, action) {
      state.users = action.payload;
    },
    setSelectedUserDetails(state, action) {
      state.selectedUserDetails = { ...action.payload };
    },
    setMyProfile(state, action) {
      state.myProfile = { ...action.payload };
    },
    setClickedImg(state, action) {
      state.clickedImg.clicked = true;
      state.clickedImg.img = action.payload;
    },
    setUnclicked(state, action) {
      state.clickedImg.clicked = false;
      state.clickedImg.img = "";
    },
  },
});

export const userActions = usersSlice.actions;
