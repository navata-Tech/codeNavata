import { useEffect, useState } from "react";
import { getUser, userActions } from "../store/slices/usersSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { getVisitors, visitorActions } from "../store/slices/visitorSlice";
import EntriesToday from "./components/entriesToday";
import CurrentVisitors from "./components/currentVisitors";
import { BounceLoader } from "react-spinners";
import { PulseLoader } from "react-spinners";

export default function Dashboard() {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const [userLoading, setUserLoading] = useState(true);
  const [visitorLoading, setVisitorLoading] = useState(true);

  const users = useSelector((state) => state.userReducer.users);
  const visitors = useSelector((state) => state.visitorReducer.visitor);

  const loggedInUser = useSelector((state) => state.loginReducer.loggedInUser);

  useEffect(() => {
    async function getUsersHandler() {
      dispatch(userActions.setUsers(await getUser()));
      setUserLoading(false);
    }
    if (loggedInUser.role == "admin") {
      getUsersHandler();
    }
  }, [loggedInUser, dispatch, loading]);

  if (!users) {
    localStorage.removeItem("token");
    window.location.reload();
  }
  useEffect(() => {
    async function getVisitorsHandler() {
      dispatch(visitorActions.setVisitor(await getVisitors()));
      setVisitorLoading(false);
    }
    getVisitorsHandler();
  }, [dispatch, users, loading]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap justify-center items-center">
        {loggedInUser.role == "admin" && (
          <Link to="/users">
            <div className="h-[250px] w-[250px] border border-black shadow-md shadow-black rounded-full flex justify-center items-center flex-col m-3">
              <h2 className="font-bold text-xl">Total Staff</h2>
              {userLoading ? <PulseLoader /> : <p>{users.length}</p>}
            </div>
          </Link>
        )}
        <Link to="/visitor">
          <div className="h-[250px] w-[250px] border border-black shadow-md shadow-black flex rounded-full justify-center items-center flex-col m-3">
            <h2 className="font-bold text-xl">Search Visitor</h2>
            {visitorLoading ? <PulseLoader /> : <p>{visitors.length}</p>}
          </div>
        </Link>
      </div>
      {loading ? (
        <>
          <div className="relative pointer-events-none my-4 pb-4">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
              <BounceLoader />
            </div>
            <div className="opacity-50">
              <CurrentVisitors setLoading={setLoading} loading={loading} />
              <EntriesToday />
            </div>
          </div>
        </>
      ) : (
        <div className="my-4 pb-4">
          <CurrentVisitors />
        </div>
      )}
    </div>
  );
}
