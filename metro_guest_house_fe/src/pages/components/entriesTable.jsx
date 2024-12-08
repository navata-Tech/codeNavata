import { Link, useNavigate } from "react-router-dom";
import { addNewEntry, visitorActions } from "../../store/slices/visitorSlice";
import TableComponent from "./Table";
import { useRef, useState } from "react";

import CompanionForm from "./companionForm";
import { toast } from "react-toastify";

import { MdOutlineRemoveRedEye } from "react-icons/md";
import { IoMdExit } from "react-icons/io";
import axios from "axios";
import { BounceLoader, BeatLoader } from "react-spinners";
import { useDispatch } from "react-redux";

export default function EntryTable({ entris, id }) {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [entryForm, setEntryForm] = useState(false);

  const [entryLoading, setEntryLoading] = useState(false);

  const [entries, setEntries] = useState(entris);

  const [companions, setCompaions] = useState([]);

  const [companionForm, setCompanionForm] = useState(false);

  const [room, setRoom] = useState("");
  const [lastVisitedAddress, setLastVisitedAddress] = useState("");
  const [nextDestination, setNextDestination] = useState("");
  const [purpose, setPurpose] = useState("");
  const [vechileNumber, setVechileNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  const [adding, setAdding] = useState(false);

  async function addNewEntryHandler(e) {
    e.preventDefault();
    console.log("adding new entry to ", id);

    if (
      room === "" ||
      lastVisitedAddress.trim() === "" ||
      nextDestination.trim() === "" ||
      purpose.trim() === ""
    ) {
      return toast.error("Form fields cannot be empty");
    }
    setAdding(true);

    const formData = {
      room,
      lastVisitedAddress,
      nextDestination,
      purpose,
      vechileNumber,
      companions,
      remarks,
    };
    const visitorWithEntry = await addNewEntry(id, formData);
    if (visitorWithEntry) {
      window.location.reload();
    }
    setAdding(false);
  }

  const Columns = [
    {
      Header: "#",
      Cell: ({ row }) => {
        return row.index + 1; // Display index starting from 1
      },
    },
    // {
    //   Header: "Entered By",
    //   accessor: "by",
    //   Cell: ({ value }) => {
    //     return <Link to={`/users/${value._id}`}>{value.firstname}</Link>;
    //   },
    // },
    {
      Header: "Checkin",
      accessor: "time",
      Cell: ({ cell }) => {
        const { value, row } = cell;

        // return `${new Date(value).toLocaleString("en-US", {
        //   year: "numeric",
        //   month: "short",
        //   day: "2-digit",
        //   hour: "numeric",
        //   minute: "2-digit",
        //   hour12: true,
        // })} ( ${row.original.by.username})`;
        return `${new Date(value).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })} ( ${row.original.by ? row.original.by.username : "Deleted Staff"})`;
      },
    },
    {
      Header: "Checkout",
      accessor: "checkoutTime",
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
          })} ( ${
            row.original.checkoutBy
              ? row.original.checkoutBy.username
              : "Deleted Staff"
          })`;
        }
      },
    },
    {
      Header: "Last Visited Address",
      accessor: "lastVisitedAddress",
    },
    {
      Header: "Next Destination",
      accessor: "nextDestination",
    },
    {
      Header: "Purpose Of Visit",
      accessor: "purposeOfVisit",
    },
    {
      Header: "With",
      accessor: "companion",
      Cell: ({ value }) => {
        if (!value || value.length < 1) {
          return "Single";
        }

        if (value.length === 1) {
          return <div className="text-nowrap">1 Other</div>;
        } else {
          return <div className="text-nowrap">{value.length} Others</div>;
        }
      },
    },
    {
      Header: "Actions",
      Cell: ({ row }) => {
        async function checkoutHandler(entryInfo) {
          setEntryLoading(true);
          console.log(id, entryInfo._id);
          try {
            const response = await axios.put(
              `${import.meta.env.VITE_SERVER}/visitor/${id}/${entryInfo._id}`,
              {},
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (response.data.success) {
              console.log(response.data);
              toast(response.data.message);
              setEntries(response.data.editedEntry);
            } else {
              toast.error(response.data.message);
            }
            setEntryLoading(false);
          } catch (error) {
            if (error.response && error.response.data.message) {
              toast.error(error.response.data.message);
            } else {
              toast.error(error.message);
            }
          }
        }

        return (
          <div className="flex flex-row">
            <Link to={`./viewEntry/${row.original._id}`}>
              <button className="bg-gray-600 p-2 rounded-md text-white font-semibold mx-2 flex items-center justify-center text-nowrap">
                View Entry
                <div className="pl-2">
                  <MdOutlineRemoveRedEye />
                </div>
              </button>
            </Link>
            {!row.original.checkoutTime && (
              <button
                className="bg-green-600 p-2 rounded-md text-white font-semibold mx-2 flex items-center justify-center"
                onClick={() => checkoutHandler(row.original)}
              >
                Checkout
                <div className="pl-2">
                  <IoMdExit />
                </div>
              </button>
            )}
          </div>
        );
      },
    },
    // {
    //   Header: "Remarks",
    //   accessor: "remarks",
    // },
  ];

  function removeCompanion(index) {
    console.log(index);
    const companionData = [...companions];

    companionData.splice(index, 1);
    setCompaions([...companionData]);
  }

  return (
    <>
      <div
        className={`w-[70vw] pb-8 my-2 ${adding ? "cursor-not-allowed" : ""}`}
      >
        {!entryForm && (
          <div className="w-full flex justify-center items-center my-4">
            <button
              className="rounded-md bg-black text-white mt-2 p-2 self-center"
              onClick={() => setEntryForm(true)}
            >
              Add New Entry
            </button>
          </div>
        )}
        <h1 className="text-xl font-semibold text-center mb-2">Entries</h1>
        <div className="text-center">
          {entryForm && (
            <form
              className={`bg-gray-200 p-2 rounded-lg m-4 ${
                adding ? "pointer-events-none" : ""
              }`}
              onSubmit={addNewEntryHandler}
            >
              <div className="p-4 rounded-lg bg-white">
                <div className="flex justify-center items-center flex-wrap">
                  <label htmlFor="room" className="flex-1 flex flex-col m-2">
                    Room No
                    <input
                      disabled={adding}
                      className={`border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1 ${
                        adding ? "cursor-not-allowed" : ""
                      }`}
                      type="text"
                      name="room"
                      id="room"
                      onChange={(e) => setRoom(e.target.value)}
                      value={room}
                      autoComplete="off"
                    />
                  </label>
                  <label
                    htmlFor="lastVisitedAddress"
                    className="flex-1 flex flex-col m-2"
                  >
                    Last Visited Address
                    <input
                      disabled={adding}
                      className={`border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1 ${
                        adding ? "cursor-not-allowed" : ""
                      }`}
                      type="text"
                      name="lastVisitedAddress"
                      id="lastVisitedAddress"
                      onChange={(e) => setLastVisitedAddress(e.target.value)}
                      value={lastVisitedAddress}
                      autoComplete="off"
                    />
                  </label>
                  <label
                    htmlFor="nextDestination"
                    className="flex-1 flex flex-col m-2"
                  >
                    Next Destination
                    <input
                      disabled={adding}
                      className={`border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1 ${
                        adding ? "cursor-not-allowed" : ""
                      }`}
                      type="text"
                      name="nextDestination"
                      id="nextDestination"
                      onChange={(e) => setNextDestination(e.target.value)}
                      value={nextDestination}
                      autoComplete="off"
                    />
                  </label>
                  <label htmlFor="purpose" className="flex-1 flex flex-col m-2">
                    Purpose
                    <input
                      disabled={adding}
                      className={`border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1 ${
                        adding ? "cursor-not-allowed" : ""
                      }`}
                      type="text"
                      name="purpose"
                      id="purpose"
                      onChange={(e) => setPurpose(e.target.value)}
                      value={purpose}
                      autoComplete="off"
                    />
                  </label>
                  <label
                    htmlFor="vechileNumber"
                    className="flex-1 flex flex-col m-2"
                  >
                    Vechile Number
                    <input
                      disabled={adding}
                      className={`border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1 ${
                        adding ? "cursor-not-allowed" : ""
                      }`}
                      type="text"
                      name="vechileNumber"
                      id="vechileNumber"
                      onChange={(e) => setVechileNumber(e.target.value)}
                      value={vechileNumber}
                      autoComplete="off"
                    />
                  </label>
                  <label htmlFor="remarks" className="flex-1 flex flex-col m-2">
                    Remarks
                    <input
                      disabled={adding}
                      className={`border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1 ${
                        adding ? "cursor-not-allowed" : ""
                      }`}
                      type="text"
                      name="remarks"
                      id="remarks"
                      onChange={(e) => setRemarks(e.target.value)}
                      value={remarks}
                      autoComplete="off"
                    />
                  </label>
                  <div className="w-full">
                    {companions.length > 0 && (
                      <>
                        <h1 className="font-semibold text-xl my-2">
                          Companions
                        </h1>
                        <table>
                          <thead id="companion">
                            <tr>
                              <th>Fullname</th>
                              <th>Relation</th>
                              <th>Age</th>
                              <th>Phone</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {companions.map((companion, index) => (
                              <tr key={index}>
                                <td>{companion.fullname}</td>
                                <td>{companion.relation}</td>
                                <td>{companion.age}</td>
                                <td>{companion.phone}</td>
                                <td>
                                  <button
                                    className="bg-red-600 p-2 rounded-md text-white font-semibold"
                                    onClick={(id) => removeCompanion(index)}
                                    type="button"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                    {companionForm ? (
                      <CompanionForm
                        companions={companions}
                        setCompanions={setCompaions}
                        setCompanionForm={setCompanionForm}
                      />
                    ) : (
                      <button
                        className="bg-slate-600 p-2 rounded-md text-white my-2"
                        type="button"
                        onClick={() => setCompanionForm(true)}
                      >
                        Add Companion
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <button
                  className={`rounded-md bg-black text-white mt-2 p-2 h-[40px] self-center m-2 transition-all duration-200 ${
                    adding ? "cursor-not-allowed bg-slate-700" : ""
                  }`}
                  type="submit"
                  disabled={adding}
                >
                  {adding ? <BeatLoader color="white" /> : "Submit"}
                </button>
                <button
                  className="rounded-md bg-black text-white mt-2 p-2 self-center m-2"
                  onClick={() => setEntryForm(false)}
                >
                  cancel
                </button>
              </div>
            </form>
          )}
          {entries.length < 1 ? (
            <div>
              <p>No Entries</p>
            </div>
          ) : entryLoading ? (
            <div className="relative pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                <BounceLoader />
              </div>
              <div className="opacity-50">
                <TableComponent COLUMNS={Columns} Data={entries} />
              </div>
            </div>
          ) : (
            <TableComponent COLUMNS={Columns} Data={entries} />
          )}
        </div>
      </div>
    </>
  );
}
