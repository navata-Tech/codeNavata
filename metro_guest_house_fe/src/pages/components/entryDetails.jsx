import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteEntry,
  getEntry,
  getSelectedVisitor,
  notCheckedOut,
  visitorActions,
} from "../../store/slices/visitorSlice";
import { toast } from "react-toastify";
import EditForm from "./editForm";

import { IoChevronBackOutline } from "react-icons/io5";
import { BounceLoader } from "react-spinners";
import { IoMdExit } from "react-icons/io";
import axios from "axios";
import { getImage, userActions } from "../../store/slices/usersSlice";
import { MdOutlineRemoveRedEye } from "react-icons/md";

export default function EntryDetails() {
  const dispatch = useDispatch();
  const { id, entryId } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = () => {
      navigate(`/visitor/${id}`, { replace: true });
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const [deleting, setDeleting] = useState(false);

  const [loading, setLoading] = useState(true);

  const [imageURL, setImageURL] = useState();

  const [checkingOut, setCheckingOut] = useState(false);

  const loggedInUser = useSelector((state) => state.loginReducer.loggedInUser);
  const selectedVisitor = useSelector(
    (state) => state.visitorReducer.selectedVisitor
  );

  const [deletionConfirmation, setDeleteConfrimation] = useState(false);

  const [state, setState] = useState("view");

  const selectedEntry = useSelector(
    (state) => state.visitorReducer.selectedEntry
  );

  useEffect(() => {
    if (selectedVisitor && selectedVisitor.documentLocation) {
      const fetchImage = async () => {
        const image = await getImage(selectedVisitor.documentLocation);
        setImageURL(image);
      };
      fetchImage();
    } else {
      setImageURL(null);
    }
  }, [selectedVisitor]);

  useEffect(() => {
    async function getEntryHandler() {
      const entry = await getEntry(id, entryId);

      if (entry.success) {
        dispatch(visitorActions.setSelectedEntry(entry.selectedEntry));
      }
      setLoading(false);
    }

    async function getVisitorHandler() {
      const visitor = await getSelectedVisitor(id);
      dispatch(visitorActions.setSelectedVisitor(visitor));
    }
    getVisitorHandler();

    getEntryHandler();
  }, [dispatch, id, entryId]);

  async function removeEntry(id, entryId) {
    setDeleting(true);
    const response = await deleteEntry(id, entryId);
    if (response.success) {
      toast(response.message);
      navigate(`/visitor/${id}`);
    } else {
      toast.error(response.message);
    }
    setDeleting(false);
  }

  async function notCheckedOutHandler() {
    setCheckingOut(true);
    const response = await notCheckedOut(id, entryId);
    if (response.success) {
      toast(response.message);
      console.log(response);
      const found = response.editedEntry.find((entry) => entry._id === entryId);
      dispatch(visitorActions.setSelectedEntry(found));
    }
    setCheckingOut(false);
  }

  async function checkoutHandler(id, entryId) {
    setCheckingOut(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER}/visitor/${id}/${entryId}`,
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
        const found = response.data.editedEntry.find(
          (entry) => entry._id === entryId
        );
        dispatch(visitorActions.setCurrentVisitors([]));
        dispatch(visitorActions.setSelectedEntry(found));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setCheckingOut(false);
    }
  }

  // console.log("selectedVisitor ", selectedVisitor);

  function setFullScreen(image) {
    dispatch(userActions.setClickedImg(image));
  }

  return loading ? (
    <div className="min-h-[50vh] w-full flex justify-center items-center">
      <BounceLoader />
    </div>
  ) : (
    Object.keys(selectedEntry).length &&
      !loading &&
      (state === "view" ? (
        <div className="w-full h-full px-4">
          <div className="flex flex-col justify-center items-center">
            <div
              className="self-start bg-slate-300 pr-4 h-fit w-fit rounded-full flex items-center justify-center p-2 hover:text-white hover:bg-slate-600 hover:cursor-pointer transition-all duration-200"
              onClick={() => navigate(-1)}
            >
              <IoChevronBackOutline size={30} /> Previous
            </div>
            <div className="my-4 flex flex-col justify-center items-center">
              <h1 className="text-2xl font-semibold text-center mb-4 py-2 px-4 text-white relative">
                Entry Details
                <span className="absolute w-full h-full bg-[#17469E] top-0 left-0 -z-10 skew-x-[15deg]"></span>
              </h1>
              <div className="grid grid-cols-1 gap-2 bg-gray-200 p-2 rounded-md w-full shadow-lg shadow-gray-400">
                <div className="flex items-center bg-white rounded-md p-2 justify-start shadow-md shadow-gray-400">
                  <div className="text-lg font-semibold mx-2  w-[180px] border-r-2 border-gray-200">
                    Room No
                  </div>
                  <div>{selectedEntry.room}</div>
                </div>
                <div className="flex items-center bg-white rounded-md p-2 justify-start shadow-md shadow-gray-400">
                  <div className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                    CheckIn Time
                  </div>

                  {new Date(selectedEntry.time).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </div>
                <div className="flex items-center bg-white rounded-md p-2 justify-start shadow-md shadow-gray-400">
                  <div className="text-lg font-semibold mx-2  w-[180px] border-r-2 border-gray-200">
                    CheckedIn By
                  </div>
                  {selectedEntry.by === null ? (
                    "Deleted Staff"
                  ) : (
                    <Link to={`/users/${selectedEntry.by._id}`}>
                      <div>{selectedEntry.by.username}</div>
                    </Link>
                  )}
                </div>
                <div className="flex items-center bg-white rounded-md p-2 justify-start shadow-md shadow-gray-400">
                  <div className="text-lg font-semibold mx-2  w-[180px] border-r-2 border-gray-200">
                    Last Visited Address
                  </div>
                  <div>{selectedEntry.lastVisitedAddress}</div>
                </div>
                <div className="flex items-center bg-white rounded-md p-2 justify-start shadow-md shadow-gray-400">
                  <div className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                    Next Destination
                  </div>
                  <div>{selectedEntry.nextDestination}</div>
                </div>
                <div className="flex items-center bg-white rounded-md p-2 justify-start shadow-md shadow-gray-400">
                  <div className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                    Purpose Of Visit
                  </div>
                  <div>{selectedEntry.purposeOfVisit}</div>
                </div>
                {selectedEntry.vechileNumber && (
                  <div className="flex items-center bg-white rounded-md p-2 justify-start shadow-md shadow-gray-400">
                    <div className="text-lg font-semibold mx-2  w-[180px] border-r-2 border-gray-200">
                      Vechile Number
                    </div>
                    <div>{selectedEntry.vechileNumber}</div>
                  </div>
                )}
                <div className="flex items-center bg-white rounded-md p-2 justify-start shadow-md shadow-gray-400">
                  <div className="text-lg font-semibold mx-2  w-[180px] border-r-2 border-gray-200">
                    Checkout Time
                  </div>
                  {selectedEntry.checkoutTime ? (
                    <div>
                      {new Date(selectedEntry.checkoutTime).toLocaleString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "numeric",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        }
                      )}
                    </div>
                  ) : (
                    <div>In-Room</div>
                  )}
                </div>
                {selectedEntry.checkoutTime && (
                  <div className="flex items-center bg-white rounded-md p-2 justify-start shadow-md shadow-gray-400">
                    <div className="text-lg font-semibold mx-2  w-[180px] border-r-2 border-gray-200">
                      Checkout By
                    </div>
                    {selectedEntry.checkoutBy === null ? (
                      "Deleted Staff"
                    ) : (
                      <Link to={`/users/${selectedEntry.checkoutBy._id}`}>
                        <div>{selectedEntry.checkoutBy.firstname}</div>
                      </Link>
                    )}
                  </div>
                )}

                {selectedEntry.remarks && (
                  <div className="flex items-center bg-white rounded-md p-2 justify-start shadow-md shadow-gray-400">
                    <div className="text-lg font-semibold mx-2  w-[180px] border-r-2 border-gray-200">
                      Remarks
                    </div>
                    <div>{selectedEntry.remarks}</div>
                  </div>
                )}

                {selectedEntry.companion.length === 0 && (
                  <div className="flex items-center bg-white rounded-md p-2 justify-start shadow-md shadow-gray-400">
                    <div className="text-lg font-semibold mx-2  w-[180px] border-r-2 border-gray-200">
                      With
                    </div>
                    <div>Single</div>
                  </div>
                )}
              </div>
              <div>
                {selectedEntry.companion.length > 0 && (
                  <div className="w-full">
                    <h1 className="font-semibold text-xl my-2 text-center">
                      With
                    </h1>
                    <table>
                      <thead id="companion">
                        <tr>
                          <th>Fullname</th>
                          <th>Relation</th>
                          <th>Age</th>
                          <th>Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEntry.companion.map((companion, index) => (
                          <tr key={index}>
                            <td>{companion.fullname}</td>
                            <td>{companion.relation}</td>
                            <td>{companion.age}</td>
                            <td>{companion.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {loggedInUser.role == "admin" ? (
              <div className="flex items-center justify-center mt-4 pb-4">
                <button
                  className="bg-green-600 p-2 rounded-md text-white font-semibold mx-2"
                  // onClick={(id) => removeCompanion(index)}
                  type="button"
                  onClick={() => setState("edit")}
                >
                  Edit Entry
                </button>
                <button
                  className="bg-red-600 p-2 rounded-md text-white font-semibold mx-2"
                  onClick={() => setDeleteConfrimation(true)}
                  type="button"
                >
                  Delete Entry
                </button>
                {!selectedEntry.checkoutTime ? (
                  <button
                    className={`bg-green-600 p-2 rounded-md text-white font-semibold mx-2 flex items-center justify-center ${
                      checkingOut && "cursor-not-allowed opacity-60"
                    }`}
                    onClick={() => checkoutHandler(id, entryId)}
                    disabled={checkingOut}
                  >
                    {checkingOut ? "Checking Out" : "Checkout"}
                    <div className="pl-2">
                      <IoMdExit />
                    </div>
                  </button>
                ) : (
                  <button
                    className={`bg-green-600 p-2 rounded-md text-white font-semibold mx-2 ${
                      checkingOut && "cursor-not-allowed opacity-60"
                    }`}
                    type="button"
                    onClick={() => notCheckedOutHandler(id, entryId)}
                    disabled={checkingOut}
                  >
                    {checkingOut ? "Unchecking" : "Uncheckout"}
                  </button>
                )}
                {deletionConfirmation && (
                  <div className="fixed bg-[#000000c7] top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center flex-col z-50">
                    <div className="text-2xl py-2 mb-3 text-white">
                      Are you sure you want to delete this entry?
                    </div>
                    <div>
                      <button
                        className={`bg-red-600 p-3 rounded-md text-white font-semibold mx-2 text-xl ${
                          deleting && "cursor-not-allowed opacity-65"
                        }`}
                        disabled={deleting}
                        onClick={() => removeEntry(id, entryId)}
                      >
                        {deleting ? "Deleting..." : "Delete Entry"}
                      </button>
                      {!deleting && (
                        <button
                          className="bg-green-600 p-3 rounded-md text-white font-semibold mx-2 text-xl"
                          onClick={() => setDeleteConfrimation(false)}
                        >
                          No
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              !selectedEntry.checkoutTime && (
                <div className="flex items-center justify-center mt-4 pb-4">
                  <button
                    className={`bg-green-600 p-2 rounded-md text-white font-semibold mx-2 flex items-center justify-center ${
                      checkingOut && "cursor-not-allowed opacity-60"
                    }`}
                    onClick={() => checkoutHandler(id, entryId)}
                    disabled={checkingOut}
                  >
                    {checkingOut ? "Checking Out" : "Checkout"}
                    <div className="pl-2">
                      <IoMdExit />
                    </div>
                  </button>
                </div>
              )
            )}
            <h1 className="text-2xl font-semibold text-center mb-4 px-4 py-2 relative flex justify-center items-center text-white w-fit">
              Visitor Details
              <span className="absolute w-full h-full bg-[#17469E] top-0 left-0 -z-10 skew-x-[15deg]"></span>
            </h1>
            {Object.keys(selectedVisitor).length && (
              <div
                id="userDetails"
                className="flex justify-center flex-col mb-6 items-center  bg-gray-200 overflow-hidden rounded-md shadow-lg shadow-gray-400"
              >
                <div className="flex flex-row items-center justify-center">
                  <div className="w-[500px] rounded-md flex items-center justify-center font-semibold py-4">
                    <img
                      src={imageURL}
                      alt="Document Not Uploaded"
                      className="h-full object-cover"
                      onClick={() => imageURL !== 1 && setFullScreen(imageURL)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 p-2  w-full ">
                  <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
                    <h1 className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                      Name
                    </h1>
                    <div className="">
                      {selectedVisitor.firstname} {selectedVisitor.lastname}
                    </div>
                  </div>
                  {selectedVisitor.religion && (
                    <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
                      <h1 className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                        Religion
                      </h1>
                      <div className="">{selectedVisitor.religion}</div>
                    </div>
                  )}
                  <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
                    <h1 className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                      Address
                    </h1>
                    <div className="">{selectedVisitor.address}</div>
                  </div>
                  <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
                    <h1 className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                      Age
                    </h1>
                    <div className="">{selectedVisitor.age}</div>
                  </div>
                  <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
                    <h1 className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                      Occupation
                    </h1>
                    <div className="">{selectedVisitor.occupation}</div>
                  </div>
                  <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
                    <h1 className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                      Gender
                    </h1>
                    <div className="">{selectedVisitor.gender}</div>
                  </div>
                  {selectedVisitor.email && (
                    <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
                      <h1 className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                        Email
                      </h1>
                      <div className="">{selectedVisitor.email}</div>
                    </div>
                  )}

                  <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
                    <h1 className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                      Phone No
                    </h1>
                    <div className="">{selectedVisitor.phone}</div>
                  </div>

                  <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
                    <h1 className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                      Document Type
                    </h1>
                    <div className="">{selectedVisitor.documentType}</div>
                  </div>
                  <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
                    <h1 className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                      Document ID
                    </h1>
                    <div className="">{selectedVisitor.documentId}</div>
                  </div>
                  <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
                    <h1 className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                      Created By
                    </h1>
                    {selectedVisitor.enteredBy === null ? (
                      "Deleted Staff"
                    ) : (
                      <Link
                        to={`/users/${selectedVisitor.enteredBy._id}`}
                        className=""
                      >
                        {selectedVisitor.enteredBy.firstname}
                      </Link>
                    )}
                  </div>
                  <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
                    <h1 className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
                      Created At
                    </h1>
                    <div className="">
                      {new Date(selectedVisitor.enteredAt).toLocaleString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Link
              to={`/visitor/${selectedVisitor._id}`}
              className="bg-blue-800 p-2 rounded-md text-white font-semibold mx-2 flex items-center justify-center mb-10"
            >
              View Visitor Details{" "}
              <div className="pl-2">
                <MdOutlineRemoveRedEye />
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <EditForm
            id={id}
            entry={selectedEntry}
            setState={setState}
            entryId={entryId}
          />
        </>
      ))
  );
}
