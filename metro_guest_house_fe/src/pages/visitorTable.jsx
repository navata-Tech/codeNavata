import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import TableComponent from "./components/Table";
import { BounceLoader } from "react-spinners";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useDebounce } from "use-debounce";

import { getVisitors, visitorActions } from "../store/slices/visitorSlice";
import "../pages/components/table.css";
import { toast } from "react-toastify";

export default function VisitorTable() {
  const visitors = useSelector((state) => state.visitorReducer.visitor);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    setLoading(true);
    async function getVisitorsHandler() {
      try {
        const visitorsData = await getVisitors(queryParameters);
        dispatch(visitorActions.setVisitor(visitorsData));
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
    getVisitorsHandler();
  }, [dispatch, queryParameters]);

  const COLUMNS = [
    {
      Header: "#",
      Cell: ({ row }) => row.index + 1,
    },
    { Header: "First Name", accessor: "firstname" },
    { Header: "Last Name", accessor: "lastname" },
    { Header: "Age", accessor: "age" },
    { Header: "Gender", accessor: "gender" },
    { Header: "Phone Number", accessor: "phone" },
    { Header: "Address", accessor: "address" },
    { Header: "Occupation", accessor: "occupation" },
    {
      Header: "ID Type",
      accessor: "documentType",
      Cell: ({ value }) => {
        if (!value) {
          return "Not Provided";
        } else {
          return value;
        }
      },
    },
    {
      Header: "Document ID",
      accessor: "documentId",
      Cell: ({ value }) => {
        if (!value) {
          return "Not Provided";
        } else {
          return value;
        }
      },
    },
    {
      Header: "Created By",
      accessor: "enteredBy",
      Cell: ({ value }) =>
        value == null ? (
          "Deleted Staff"
        ) : (
          <Link to={`/users/${value._id}`}>
            {value.firstname} {value.role === "admin" ? "(Admin)" : ""}
          </Link>
        ),
    },
    {
      Header: "Entered At",
      accessor: "enteredAt",
      Cell: ({ value }) =>
        new Date(value).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
    },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <div className="flex flex-row">
          <Link to={`/visitor/${row.original._id}`}>
            <button className="bg-gray-600 p-2 rounded-md text-white font-semibold mx-2 flex items-center justify-center">
              View
              <div className="pl-2">
                <MdOutlineRemoveRedEye />
              </div>
            </button>
          </Link>
        </div>
      ),
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
  const visitorsWithHighlighting = visitors.map((visitor) => ({
    ...visitor,
    firstname: highlightMatchedWords(visitor.firstname, firstname),
    lastname: highlightMatchedWords(visitor.lastname, lastname),
    phone: highlightMatchedWords(visitor.phone, number),
    documentId: highlightMatchedWords(visitor.documentId, documentId),
  }));

  return (
    <div className="flex flex-col w-full p-2">
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
        <div className="flex flex-col m-2">
          <label htmlFor="documentId">DocumentId</label>
          <input
            type="text"
            name="documentId"
            id="documentId"
            className="border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1 w-full"
            onChange={(e) => setDocumentId(e.target.value)}
            value={documentId}
          />
        </div>
      </div>
      <h1 className="text-xl font-semibold text-center p-4">All Visitors</h1>
      {loading ? (
        <div className="min-h-[50vh] flex justify-center items-center">
          <BounceLoader />
        </div>
      ) : visitors && visitors.length > 0 ? (
        <TableComponent COLUMNS={COLUMNS} Data={visitorsWithHighlighting} />
      ) : (
        <p className="text-center">No visitors found</p>
      )}
    </div>
  );
}
