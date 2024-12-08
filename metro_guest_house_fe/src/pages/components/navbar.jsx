import { Link } from "react-router-dom";

import { LuLayoutDashboard } from "react-icons/lu";
import { IoIosPersonAdd } from "react-icons/io";
import { FaPersonWalkingLuggage } from "react-icons/fa6";
import { useSelector } from "react-redux";

import { GiEntryDoor } from "react-icons/gi";

export default function Navbar() {
  const loggedInUser = useSelector((state) => state.loginReducer.loggedInUser);

  return (
    <aside className="flex flex-col items-center p-4 h-screen bg-[#0077b6] text-l text-white pt-2 sticky top-0">
      <Link
        to="/"
        className="transition-all duration-300 hover:bg-slate-600 rounded-md m-2 w-full flex items-center p-2"
      >
        <LuLayoutDashboard size={25} />
        <p className="text-left p-1">Dashboard</p>
      </Link>
      {loggedInUser.role == "admin" && (
        <Link
          to="/register"
          className="transition-all duration-300 hover:bg-slate-600 rounded-md m-2 w-full flex items-center p-2"
        >
          <IoIosPersonAdd size={25} />

          <p className="text-left p-1">Register</p>
        </Link>
      )}
      <Link
        to="/visitorForm"
        className="transition-all duration-300 hover:bg-slate-600 rounded-md m-2 w-full flex items-center p-2"
      >
        <FaPersonWalkingLuggage size={25} />

        <p className="text-left p-1">Visitor</p>
      </Link>
      <Link
        to="/entries"
        className="transition-all duration-300 hover:bg-slate-600 rounded-md m-2 w-full flex items-center p-2"
      >
        <GiEntryDoor size={25} />

        <p className="text-left p-1">Entries</p>
      </Link>
    </aside>
  );
}
