import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteVisitor,
  getSelectedVisitor,
  visitorActions,
} from "../store/slices/visitorSlice";
import { useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import EntryTable from "./components/entriesTable";

import { MdDeleteOutline } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import VisitorForm from "./visitorForm";
import { toast } from "react-toastify";
import { IoChevronBackOutline } from "react-icons/io5";
import { getImage, userActions } from "../store/slices/usersSlice";

export default function VisitorDetails() {
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = () => {
      navigate("/visitor", { replace: true });
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const { id } = useParams();

  const [deleting, setDeleting] = useState(false);

  const [loading, setLoading] = useState(true);

  const [deletionConfirmation, setDeleteConfrimation] = useState(false);

  const selectedVisitor = useSelector(
    (state) => state.visitorReducer.selectedVisitor
  );

  const loggedInUser = useSelector((state) => state.loginReducer.loggedInUser);

  const [state, setState] = useState("view");

  const [imageURL, setImageURL] = useState();

  const dispatch = useDispatch();

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
    async function getVisitorHandler() {
      const visitor = await getSelectedVisitor(id);
      dispatch(visitorActions.setSelectedVisitor(visitor));
      setLoading(false);
    }
    getVisitorHandler();
  }, [dispatch, id]);

  // let date = "";
  // if (selectedVisitor?.enteredAt?.length > 0) {
  //   const enteredAtDate = new Date(selectedVisitor.enteredAt[0].time);
  //   date =
  //     enteredAtDate.toLocaleDateString() +
  //     " " +
  //     enteredAtDate.toLocaleTimeString();
  // }

  async function deleteVisitorHanlder(id) {
    setDeleting(true);
    const response = await deleteVisitor(id);
    if (response.success) {
      toast(response.message);
      navigate(`/visitor`);
    } else {
      toast.error(response.message);
    }
    setDeleting(false);
  }

  function setFullScreen(image) {
    dispatch(userActions.setClickedImg(image));
  }

  return loading ? (
    <BounceLoader />
  ) : Object.keys(selectedVisitor).length < 1 ? (
    <div className="flex flex-col justify-center items-center">
      <div
        className="self-start bg-slate-300 h-fit w-fit pr-4 rounded-full flex items-center justify-center p-2 hover:text-white hover:bg-slate-600 hover:cursor-pointer transition-all duration-200"
        onClick={() => navigate("/visitor")}
      >
        <IoChevronBackOutline size={30} /> Visitor Table
      </div>
      <p className="text-2xl font-semibold mt-11">Visitor Not Found</p>
    </div>
  ) : state === "view" ? (
    <div className="w-full p-2 flex flex-col justify-center items-center">
      {/* <div
        className="self-start bg-slate-300 h-fit w-fit pr-4 rounded-full flex items-center justify-center p-2 hover:text-white hover:bg-slate-600 hover:cursor-pointer transition-all duration-200"
        onClick={() => navigate("/visitor")}
      >
        <IoChevronBackOutline size={30} /> Visitor Table
      </div> */}
      <div
        className="self-start mt-4 bg-slate-300 h-fit w-fit pr-4 rounded-full flex items-center justify-center p-2 hover:text-white hover:bg-slate-600 hover:cursor-pointer transition-all duration-200"
        onClick={() => navigate(-1)}
      >
        <IoChevronBackOutline size={30} /> Previous
      </div>
      <h1 className="text-2xl font-semibold text-center mb-4 px-4 py-2 relative flex justify-center items-center text-white w-fit">
        Visitor Details
        <span className="absolute w-full h-full bg-[#17469E] top-0 left-0 -z-10 skew-x-[15deg]"></span>
      </h1>
      <div
        id="visitorDetails"
        className="flex justify-center flex-col mb-6 items-center  bg-gray-200 overflow-hidden rounded-md shadow-lg shadow-gray-400"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="w-[500px] h-fit rounded-md text-center font-semibold">
            <img
              src={imageURL}
              alt="No Document Uploaded"
              className="h-full object-cover my-2"
              onClick={() => imageURL !== 1 && setFullScreen(imageURL)}
            />
          </div>
          {loggedInUser.role === "admin" && (
            <Link
              to={`./reuploadDocument`}
              className="bg-green-600 p-2 my-4 rounded-md text-white font-semibold text-sm mx-2 flex items-center"
            >
              {selectedVisitor.documentLocation
                ? "Reupload Document"
                : "Upload Document"}
            </Link>
          )}
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
              <Link to={`/users/${selectedVisitor.enteredBy._id}`} className="">
                {selectedVisitor.enteredBy.firstname}
              </Link>
            )}
          </div>
          <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
            <h1 className="text-lg font-semibold mx-2 w-[180px] border-r-2 border-gray-200">
              Created At
            </h1>
            <div className="">
              {new Date(selectedVisitor.enteredAt).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
          </div>
        </div>
      </div>
      {loggedInUser.role === "admin" && (
        <>
          <div className="flex items-center justify-center my-4">
            <button
              className="bg-green-600 p-3 rounded-md text-white font-semibold mx-2 flex items-center"
              onClick={() => setState("edit")}
            >
              Edit Visitor <MdEdit size={25} className="ml-1" />
            </button>
            <button
              className="bg-red-600 p-3 rounded-md text-white font-semibold mx-2 flex items-center"
              type="button"
              onClick={() => setDeleteConfrimation(true)}
            >
              Delete Visitor <MdDeleteOutline size={25} className="ml-1" />
            </button>
          </div>
          {deletionConfirmation && (
            <div className="fixed bg-[#000000c7] top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center flex-col z-50">
              <div className="text-2xl py-2 mb-3 text-white">
                Are you sure you want to delete this Visitor?
              </div>
              <div>
                <button
                  className={`bg-red-600 p-3 rounded-md text-white font-semibold mx-2 text-xl ${
                    deleting && "cursor-not-allowed opacity-65"
                  }`}
                  onClick={() => deleteVisitorHanlder(id)}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes"}
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
        </>
      )}
      <EntryTable entris={selectedVisitor.entries} id={id} className="my-2" />
    </div>
  ) : (
    <VisitorForm visitorToEdit={selectedVisitor} setState={setState} />
  );
}
