import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { BounceLoader } from "react-spinners";
import { getVisitors, visitorActions } from "../store/slices/visitorSlice";
import TableComponent from "./components/Table";
import NepaliDate from "nepali-date-converter";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";

import "nepali-datepicker-reactjs/dist/index.css";
import "react-datepicker/dist/react-datepicker.css";

import DatePicker from "react-datepicker";
import { useDebounce } from "use-debounce";

export default function AllEntries() {
  const dispatch = useDispatch();
  const allEntries = useSelector((state) => state.visitorReducer.allEntries);

  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  // const getNepaliDateString = (date) => {
  //   if (!date) return "";
  //   try {
  //     const nepaliDate = new NepaliDate(new Date(date));
  //     return nepaliDate.format("YYYY-MM-DD");
  //   } catch (error) {
  //     console.error("Invalid date:", error);
  //     return "";
  //   }
  // };

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [number, setNumber] = useState("");
  const [documentId, setDocumentId] = useState("");

  const [debouncedFirstname] = useDebounce(firstname, 500);
  const [debouncedLastname] = useDebounce(lastname, 500);
  const [debouncedNumber] = useDebounce(number, 500);
  const [debouncedDocumentId] = useDebounce(documentId, 500);

  const queryParameters = useMemo(
    () => ({
      firstname: debouncedFirstname,
      lastname: debouncedLastname,
      number: debouncedNumber,
      documentId: debouncedDocumentId,
    }),
    [
      debouncedFirstname,
      debouncedLastname,
      debouncedNumber,
      debouncedDocumentId,
    ]
  );

  useEffect(() => {}, [queryParameters]);

  function nepaliDate(selDate) {
    if (!selDate) {
      return;
    }

    const date = new NepaliDate(selDate);

    const year = date.getYear();
    const month = date.getMonth();
    const calculatedMonth = month.toString().length < 2 ? `0${month}` : month;
    const day = date.getDay();
    const calculatedDay = day.toString().length < 2 ? `0${day}` : day;

    // console.log(
    //   `${year}-${
    //     parseInt(calculatedMonth) > 12
    //       ? parseInt(calculatedMonth) - 12
    //       : parseInt(calculatedMonth) < 1
    //       ? 12 - parseInt(calculatedMonth)
    //       : calculatedMonth
    //   }-${calculatedDay}`
    // );

    return `${year}-${
      parseInt(calculatedMonth) > 12
        ? parseInt(calculatedMonth) - 12
        : parseInt(calculatedMonth) < 1
        ? 12 - parseInt(calculatedMonth)
        : calculatedMonth
    }-${calculatedDay}`;
  }

  async function handleDateChange(date) {
    const dateArr = date.split("-");
    const jsDate = new NepaliDate(
      parseInt(dateArr[0]),
      12 < parseInt(dateArr[1] - 1)
        ? parseInt(dateArr[1] - 1) - 12
        : 1 > parseInt(dateArr[1] - 1)
        ? 12 - parseInt(dateArr[1] - 1)
        : parseInt(dateArr[1] - 1),
      parseInt(dateArr[2])
    ).toJsDate();
    setSelectedDate(jsDate);
  }

  useEffect(() => {
    setLoading(true);

    async function getAllEntries(date) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER}/visitor/allEntries`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params: {
              date: selectedDate,
            },
          }
        );
        if (response.data.success) {
          dispatch(
            visitorActions.setAllEntries(await response.data.allEntries)
          );
        }
      } catch (error) {
        if (error.response && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    }
    async function getVisitorsHandler() {
      try {
        const searchedEntry = await getVisitors({
          ...queryParameters,
          entry: true,
        });
        dispatch(visitorActions.setAllEntries(searchedEntry));
      } catch (error) {
        if (error.response && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    }
    if (
      queryParameters.firstname.trim() !== "" ||
      queryParameters.lastname.trim() !== "" ||
      queryParameters.documentId.trim() !== "" ||
      queryParameters.number.trim() !== ""
    ) {
      getVisitorsHandler();
    } else {
      getAllEntries(selectedDate);
    }
  }, [selectedDate, dispatch, queryParameters]);

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
      Header: "Checkout",
      accessor: "checkout",
      Cell: ({ cell }) => {
        const { value } = cell;

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
          </div>
        );
      },
    },
  ];

  // Function to highlight matched words in a given text
  const highlightMatchedWords = (text, search) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text
      .split(regex)
      .map((word, index) =>
        regex.test(word) ? <mark key={index}>{word}</mark> : word
      );
  };

  // Prepare visitors data with highlighted search terms
  const entriesWithHighlighting = allEntries.map((visitor) => ({
    ...visitor,
    firstname: highlightMatchedWords(visitor.firstname, firstname),
    lastname: highlightMatchedWords(visitor.lastname, lastname),
    phone: highlightMatchedWords(visitor.phone, number),
    documentId: highlightMatchedWords(visitor.documentId, documentId),
  }));

  return (
    <div className="w-full flex flex-col">
      <div className="text-center my-4">
        <h1 className="text-xl font-semibold">
          All Entries ({allEntries.length}){" "}
          {selectedDate
            ? `on ${new NepaliDate(selectedDate).format("dddd, MMMM Do YYYY")}`
            : ""}
        </h1>
        <div className="flex items-center justify-center">
          Date
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            className="border p-2 rounded m-2"
          />
          {selectedDate && (
            <button
              className="bg-green-600 p-2 rounded-md text-white font-semibold mx-2"
              onClick={() => setSelectedDate(null)}
            >
              Clear Date
            </button>
          )}
        </div>
      </div>
      <div className="self-center flex w-full items-center justify-center">
        <div className="flex flex-col m-2">
          <label htmlFor="firstname">Firstname</label>
          <input
            type="text"
            name="firstname"
            id="firstname"
            className="border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1 w-full"
            onChange={(e) => setFirstname(e.target.value)}
            value={firstname}
          />
        </div>
        <div className="flex flex-col m-2">
          <label htmlFor="lastname">Lastname</label>
          <input
            type="text"
            name="lastname"
            id="lastname"
            className="border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1 w-full"
            onChange={(e) => setLastname(e.target.value)}
            value={lastname}
          />
        </div>
        <div className="flex flex-col m-2">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="text"
            name="phone"
            id="phone"
            className="border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1 w-full"
            onChange={(e) => setNumber(e.target.value)}
            value={number}
          />
        </div>
        {/* <div className="flex flex-col m-2">
          <label htmlFor="documentId">DocumentId</label>
          <input
            type="text"
            name="documentId"
            id="documentId"
            className="border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1 w-full"
            onChange={(e) => setDocumentId(e.target.value)}
            value={documentId}
          />
        </div> */}
      </div>
      {loading ? (
        <div>
          <BounceLoader />
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="relative pointer-events-none">
              <TableComponent
                COLUMNS={COLUMNS}
                Data={entriesWithHighlighting}
                className="opacity-45"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                <BounceLoader />
              </div>
            </div>
          ) : allEntries && allEntries.length ? (
            <div>
              <TableComponent
                COLUMNS={COLUMNS}
                Data={entriesWithHighlighting}
              />
            </div>
          ) : (
            <div className="text-center">No Entries Yet</div>
          )}
        </div>
      )}
    </div>
  );
}
