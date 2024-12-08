import { useState } from "react";
import EntriesToday from "./components/entriesToday";
import CurrentVisitors from "./components/currentVisitors";
import CheckoutsToday from "./components/checkoutToday";
import CheckInsToday from "./components/checkInsToday";
import { Link } from "react-router-dom";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { visitorActions } from "../store/slices/visitorSlice";

export default function Entries() {
  // const [view, setView] = useState("today");
  const dispatch = useDispatch();
  const view = useSelector((state) => state.visitorReducer.entryView);

  return (
    <div>
      <div
        id="navigator"
        className="flex flex-wrap items-center justify-center"
      >
        <div
          className={`h-[200px] w-[200px] rounded-full flex items-center justify-center cursor-pointer border-[2px] border-[#0077b6] shadow-gray-400 transition-all duration-300 m-2 bg-white ${
            view === "today"
              ? "shadow-lg scale-110 z-100 bg-white"
              : "shadow-sm hover:scale-110"
          } `}
          onClick={() => dispatch(visitorActions.setEntryView("today"))}
        >
          Entries Today
        </div>
        <div
          className={`h-[200px] w-[200px] rounded-full flex items-center justify-center cursor-pointer border-[2px] border-[#0077b6] shadow-gray-400 transition-all duration-300 m-2 bg-white ${
            view === "current"
              ? "shadow-lg scale-110 z-100 bg-white"
              : "shadow-sm hover:scale-110"
          } `}
          onClick={() => dispatch(visitorActions.setEntryView("current"))}
        >
          Current Visitor
        </div>
        <div
          className={`h-[200px] w-[200px] rounded-full flex items-center justify-center cursor-pointer border-[2px] border-[#0077b6] shadow-gray-400 transition-all duration-300 m-2 bg-white ${
            view === "checkout"
              ? "shadow-lg scale-110 z-100 bg-white"
              : "shadow-sm hover:scale-110"
          } `}
          onClick={() => dispatch(visitorActions.setEntryView("checkout"))}
        >
          Checkouts Today
        </div>
        <div
          className={`h-[200px] w-[200px] rounded-full flex items-center justify-center cursor-pointer border-[2px] border-[#0077b6] shadow-gray-400 transition-all duration-300 m-2 bg-white ${
            view === "checkins"
              ? "shadow-lg scale-110 z-100 bg-white"
              : "shadow-sm hover:scale-110 z-20"
          } `}
          onClick={() => dispatch(visitorActions.setEntryView("checkins"))}
        >
          CheckIns Today
        </div>
      </div>
      {view === "today" ? (
        <EntriesToday />
      ) : view === "current" ? (
        <CurrentVisitors />
      ) : view === "checkout" ? (
        <CheckoutsToday />
      ) : (
        <CheckInsToday />
      )}
      <div className="w-full flex justify-center items-center">
        <Link
          to="./allEntries"
          className="rounded-md bg-black text-white self-center w-auto p-3 shadow-lg border border-white hover:shadow-md transition-all duration-200 shadow-black mt-4 flex justify-center items-center"
        >
          View All Entries <MdOutlineRemoveRedEye className="ml-2" />
        </Link>
      </div>
    </div>
  );
}
