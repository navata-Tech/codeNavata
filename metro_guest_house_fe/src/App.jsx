import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./pages/register";
import Header from "./pages/components/header";
import Login from "./pages/login";
import Navbar from "./pages/components/navbar";
import Dashboard from "./pages/Dashboard";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getLoggedInUser, loginActions } from "./store/slices/loginSlice";

import { BounceLoader } from "react-spinners";
import VisitorForm from "./pages/visitorForm";
import VisitorTable from "./pages/visitorTable";
import UserTable from "./pages/userTable";
import UserDetails from "./pages/userDetails";
import VisitorDetails from "./pages/visitorDetails";
import EntryDetails from "./pages/components/entryDetails";
import { getServerStatus } from "./store/slices/usersSlice";
import ResetPassword from "./pages/resetPassword";
import Entries from "./pages/entries";
import MyProfile from "./pages/myProfile";
import AllEntries from "./pages/allEntries";

function App() {
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");

  const loggedIn = useSelector((state) => state.loginReducer.loggedIn);

  const loggedInUser = useSelector((state) => state.loginReducer.loggedInUser);

  const [userResolved, setUserResolved] = useState(false);

  const [serverStat, setServerStat] = useState("pending");

  useEffect(() => {
    async function serverStatHandler() {
      setServerStat(await getServerStatus());
    }
    serverStatHandler();
  }, []);

  useEffect(() => {
    async function userHandler() {
      const userFound = getLoggedInUser();
      dispatch(loginActions.setUser(await userFound));
      setUserResolved(true);
    }
    userHandler();
  }, [loggedIn]);

  if (token && !userResolved) {
    return (
      <div className="w-[100vw] h-[100vh] flex justify-center items-center">
        <BounceLoader />
      </div>
    );
  }

  if (Object.keys(loggedInUser).length === 0) {
    return serverStat === "pending" ? (
      <div className="w-[100vw] h-[100vh] flex justify-center items-center">
        <BounceLoader />
      </div>
    ) : serverStat === "server down" ? (
      <div className="w-[100vw] h-[100vh] p-4 text-nowrap flex-wrap border flex justify-center items-center text-2xl font-semibold">
        "&nbsp;SERVER DOWN PLEASE CONTACT&nbsp;
        <span className="mt-0 pt-0">
          <a
            href="https://prakashlama1.com.np"
            target="_blank"
            className="text-yellow-800 underline mt-0 pt-0"
          >
            ME
          </a>
        </span>
        &nbsp;AT&nbsp;
        <a
          href="https://technavata.com"
          target="_blank"
          className="text-yellow-800 underline mt-0 pt-0"
        >
          NAVATA TECH
        </a>
        &nbsp;"
      </div>
    ) : serverStat === true ? (
      <Login />
    ) : (
      <Register admin={true} setServerStat={setServerStat} />
    );
  }

  return (
    <Router>
      <Header />
      <div className="flex">
        <Navbar />
        <div className="flex justify-center items-center w-full h-fit pt-4">
          <Routes>
            <Route path="/visitorForm" element={<VisitorForm />} />
            <Route path="/entries" element={<Entries />} />
            <Route path="/entries/allEntries" element={<AllEntries />} />
            <Route path="/myProfile" element={<MyProfile />} />
            <Route path="/visitor" element={<VisitorTable />} />
            <Route path="/visitor/:id" element={<VisitorDetails />} />
            <Route
              path="/visitor/:id/viewEntry/:entryId"
              element={<EntryDetails />}
            />
            {loggedInUser.role == "admin" && (
              <>
                <Route path="/register" element={<Register />} />
                <Route path="/users" element={<UserTable />} />
                <Route path="/users/:id" element={<UserDetails />} />
                <Route path="/resetMyPassword" element={<ResetPassword />} />

                <Route
                  path="/visitor/:id/reuploadDocument"
                  element={<VisitorForm reupload={true} />}
                />
                <Route
                  path="/users/:id/reuploadAvatar"
                  element={<Register reupload={true} />}
                />
                <Route
                  path="/users/:id/resetPassword"
                  element={<ResetPassword />}
                />
              </>
            )}
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
