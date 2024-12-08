import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

export const getVisitors = async (params) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_SERVER}/visitor`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      params: { ...params },
    });

    if (res.data.success) {
      return res.data.visitors;
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
};

export const getSelectedVisitor = async (visitorId) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_SERVER}/visitor/${visitorId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (res.status == 401) {
      localStorage.removeItem("token");
      window.location.reload();
    }

    if (res.data.success) {
      return res.data.selectedVisitor;
    }
  } catch (error) {
    if (error.response && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
  }
};

export const getEntry = async (visitorId, entryId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER}/visitor/${visitorId}/${entryId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
  }
};

export const getVisitorWithNumber = async (number) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER}/visitor/numberSearch`,
      { number },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data.foundUsersWithInitialOfProvidedNumber;
  } catch (error) {
    if (error.response && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
  }
};

export const addNewEntry = async (visitorId, formData) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER}/visitor/${visitorId}/addEntry`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.data.success) {
      toast.success(response.data.message);
      return response.data.visitorToAddEntryTo;
    } else {
      toast.error("something went wrong adding entry");
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

export const getTodaysEntry = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER}/visitor/entriesToday`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.data.success) {
      return response.data.visitorsToday;
    }
  } catch (error) {
    if (error.response && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
  }
};

export const deleteEntry = async (id, entryId) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_SERVER}/visitor/${id}/${entryId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
  }
};

export const notCheckedOut = async (id, entryId) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_SERVER}/visitor/${id}/${entryId}/notCheckout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
  }
};

export const editEntry = async (id, entryId, formData) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_SERVER}/visitor/${id}/${entryId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
  }
};

export const deleteVisitor = async (visitorId) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_SERVER}/visitor/${visitorId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
  }
};

export const visitorSlice = createSlice({
  name: "visitor",
  initialState: {
    visitor: [],
    selectedVisitor: {},
    searchedVisitor: [],
    visitorsToday: [],
    currentVisitors: [],
    checkoutsToday: [],
    checkInsToday: [],
    selectedEntry: {},
    allEntries: [],
    entryView: "today",
  },
  reducers: {
    setVisitor(state, action) {
      state.visitor = action.payload;
    },
    setSelectedVisitor(state, action) {
      state.selectedVisitor = { ...action.payload };
    },
    setSearchedVisitor(state, action) {
      state.searchedVisitor = action.payload;
    },
    setVisitorsToday(state, action) {
      state.visitorsToday = action.payload;
    },
    setCurrentVisitors(state, action) {
      state.currentVisitors = action.payload;
    },
    setCheckoutsToday(state, action) {
      state.checkoutsToday = action.payload;
    },
    setSelectedEntry(state, action) {
      state.selectedEntry = { ...action.payload };
    },
    setCheckInsToday(state, action) {
      state.checkInsToday = action.payload;
    },
    setAllEntries(state, action) {
      state.allEntries = action.payload;
    },
    setEntryView(state, action) {
      state.entryView = action.payload;
    },
  },
});

export const visitorActions = visitorSlice.actions;
