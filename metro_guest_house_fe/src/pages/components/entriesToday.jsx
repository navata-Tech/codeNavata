import { useEffect, useState } from "react";
import {
  getTodaysEntry,
  visitorActions,
} from "../../store/slices/visitorSlice";
import { useDispatch, useSelector } from "react-redux";
import TableComponent from "./Table";
import { Link } from "react-router-dom";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { BounceLoader } from "react-spinners";

export default function EntriesToday() {
  const visitorsToday = useSelector(
    (state) => state.visitorReducer.visitorsToday
  );
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getEntriesToday() {
      dispatch(visitorActions.setVisitorsToday(await getTodaysEntry()));
      setLoading(false);
    }

    getEntriesToday();
  }, []);

  const COLUMNS = [
    {
      Header: "#",
      Cell: ({ row }) => {
        return row.index + 1; // Display index starting from 1
      },
    },
    { Header: "First Name", accessor: "firstname" },
    { Header: "Last Name", accessor: "lastname" },
    { Header: "Phone Number", accessor: "phone" },
    {
      Header: "Room No",
      accessor: "room",
    },
    {
      Header: "With",
      accessor: "with",
      Cell: ({ value }) => {
        if (value == 0) {
          return "Single";
        } else if (value == 1) {
          return `${value} Other`;
        } else {
          return `${value} Others`;
        }
      },
    },
    {
      Header: "Checkin",
      accessor: "time",
      Cell: ({ value }) => {
        return new Date(value).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      },
    },
    {
      Header: "Checkout",
      accessor: "checkout",
      Cell: ({ cell }) => {
        const { value, row } = cell;

        if (!value) {
          return "In-Room";
        } else {
          return `${new Date(value).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}`;
        }
      },
    },
    {
      Header: "Actions",
      Cell: ({ row }) => {
        return (
          <div className="flex flex-row">
            <Link
              to={`/visitor/${row.original.visitorId}/viewEntry/${row.original.entryId}`}
            >
              <button className="bg-gray-600 p-2 rounded-md text-white font-semibold mx-2 flex items-center justify-center text-nowrap">
                View Entry
                <div className="pl-2">
                  <MdOutlineRemoveRedEye />
                </div>
              </button>
            </Link>
            {/* <Link to={`/visitor/${row.original.visitorId}`}>
              <button className="bg-gray-600 p-2 rounded-md text-white font-semibold mx-2 flex items-center justify-center text-nowrap">
                Visitor Details
                <div className="pl-2">
                  <MdOutlineRemoveRedEye />
                </div>
              </button>
            </Link> */}
          </div>
        );
      },
    },
  ];

  // if (!visitorsToday) {
  //   localStorage.removeItem("token");
  //   window.location.reload();
  // }

  return loading ? (
    <div>
      <BounceLoader />
    </div>
  ) : (
    <div className="">
      <h1 className="text-xl font-semibold text-center my-4">
        Entries Today ({visitorsToday.length})
      </h1>
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <BounceLoader />
        </div>
      ) : visitorsToday.length < 1 ? (
        <div className="text-center">No Visitors Today</div>
      ) : (
        <TableComponent COLUMNS={COLUMNS} Data={visitorsToday} />
      )}
    </div>
  );
}
