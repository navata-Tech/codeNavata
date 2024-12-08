import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { visitorActions } from "../../store/slices/visitorSlice";
import TableComponent from "./Table";
import { IoMdExit } from "react-icons/io";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { BounceLoader } from "react-spinners";

export default function CurrentVisitors() {
  const dispatch = useDispatch();
  const currentVisitors = useSelector(
    (state) => state.visitorReducer.currentVisitors
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    async function getCurrentVisitors() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER}/visitor/currentVisitors`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.data.success) {
          dispatch(
            visitorActions.setCurrentVisitors(
              await response.data.currentVisitors
            )
          );
        }
      } catch (error) {
        if (error.response && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    }
    getCurrentVisitors();
    setLoading(false);
  }, []);

  // console.log(currentVisitors);

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
      Header: "Checkin",
      accessor: "time",
      Cell: ({ value }) => {
        return (
          <div className="text-nowrap">
            {new Date(value).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        );
      },
    },
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
      Header: "Actions",
      Cell: ({ row }) => {
        // async function checkoutHandler(entryInfo) {
        //   setLoading(true);
        //   console.log(entryInfo);
        //   try {
        //     const response = await axios.put(
        //       `${import.meta.env.VITE_SERVER}/visitor/${entryInfo.visitorId}/${
        //         entryInfo.entryId
        //       }`,
        //       {},
        //       {
        //         headers: {
        //           "Content-Type": "application/json",
        //           Authorization: `Bearer ${localStorage.getItem("token")}`,
        //         },
        //       }
        //     );

        //     if (response.data.success) {
        //       toast(response.data.message);
        //       dispatch(
        //         visitorActions.setCurrentVisitors(
        //           await response.data.currentVisitors
        //         )
        //       );
        //     } else {
        //       toast.error(response.data.message);
        //     }
        //   } catch (err) {
        //     console.error(err);
        //   }
        //   setLoading(false);
        // }

        return (
          <div className="flex flex-row">
            <Link
              to={`/visitor/${row.original.visitorId}/viewEntry/${row.original.entryId}`}
            >
              <button className="bg-yellow-600 rounded-full p-2 text-white font-semibold mx-2 flex items-center text-sm justify-center text-nowrap">
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
            {/* <button
              className="bg-green-600 p-2 rounded-md text-white font-semibold mx-2 flex items-center justify-center"
              onClick={() => checkoutHandler(row.original)}
            >
              Checkout
              <div className="pl-2">
                <IoMdExit />
              </div>
            </button> */}
          </div>
        );
      },
    },
  ];

  return loading ? (
    <div>
      <BounceLoader />
    </div>
  ) : (
    <div>
      <h1 className="text-xl font-semibold text-center my-4">
        Current Visitors ({currentVisitors.length})
      </h1>
      {loading ? (
        <div className="relative pointer-events-none">
          <TableComponent
            COLUMNS={COLUMNS}
            Data={currentVisitors}
            className="opacity-45"
          />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <BounceLoader />
          </div>
        </div>
      ) : currentVisitors.length && !loading ? (
        <div>
          <TableComponent COLUMNS={COLUMNS} Data={currentVisitors} />
        </div>
      ) : (
        <div className="text-center">No Current Visitors</div>
      )}
    </div>
  );
}
