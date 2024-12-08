import { IoChevronBackOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getImage, userActions } from "../store/slices/usersSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import { GridLoader } from "react-spinners";
import { MdLockReset } from "react-icons/md";

export default function MyProfile() {
  const myProfile = useSelector((state) => state.loginReducer.loggedInUser);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [imageURL, setImageURL] = useState("");

  useEffect(() => {
    if (myProfile && myProfile.imageURL) {
      const fetchImage = async () => {
        const image = await getImage(myProfile.imageURL);
        setImageURL(image);
      };
      fetchImage();
    }
  }, [myProfile]);

  function setFullScreen(image) {
    dispatch(userActions.setClickedImg(image));
  }

  return (
    Object.keys(myProfile).length && (
      <div className="flex flex-col justify-center items-center w-full p-4">
        <div className="w-full">
          <div
            className="self-start bg-slate-300 pr-4 mb-4 h-fit w-fit rounded-full flex items-center justify-center p-2 hover:text-white hover:bg-slate-600 hover:cursor-pointer transition-all duration-200"
            onClick={() => navigate(-1)}
          >
            <IoChevronBackOutline size={30} /> Previous
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-center mb-4 px-4 py-2 relative flex justify-center items-center text-white w-fit">
          My Profile
          <span className="absolute w-full h-full bg-[#17469E] top-0 left-0 -z-10 skew-x-[15deg]"></span>
        </h1>
        <div
          id="userDetails"
          className="flex justify-center flex-col mb-6 items-center  bg-gray-200 overflow-hidden rounded-md shadow-lg shadow-gray-400"
        >
          <div className="flex flex-col items-center justify-center w-full">
            <div className="w-[350px] h-[350px] flex flex-col justify-center items-center bg-slate-800 mt-4 rounded-md overflow-hidden">
              {imageURL ? (
                <img
                  src={imageURL}
                  alt="No User Image"
                  className="w-[350px] h-[350px] object-cover flex justify-center items-center font-semibold text-white"
                  onClick={() => imageURL && setFullScreen(imageURL)}
                />
              ) : (
                <GridLoader color="white" />
              )}
            </div>

            {myProfile.role === "admin" && (
              <div className="flex items-center justify-center py-2">
                <Link
                  to={`/users/${myProfile._id}/reuploadAvatar`}
                  className="bg-green-600 p-2 rounded-md text-white font-semibold text-sm mx-2 flex items-center my-2"
                >
                  Reupload Photo
                </Link>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 p-2  w-full ">
            <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
              <h1 className="text-lg font-semibold mx-2 w-[150px] border-r-2 border-gray-200">
                Name
              </h1>
              <div className="">
                {myProfile.firstname} {myProfile.lastname}
              </div>
            </div>
            <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
              <h1 className="text-lg font-semibold mx-2 w-[150px] border-r-2 border-gray-200">
                Username
              </h1>
              <div className="">{myProfile.username}</div>
            </div>
            <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
              <h1 className="text-lg font-semibold mx-2 w-[150px] border-r-2 border-gray-200">
                Email
              </h1>
              <div className="">{myProfile.email}</div>
            </div>
            <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
              <h1 className="text-lg font-semibold mx-2 w-[150px] border-r-2 border-gray-200">
                Phone
              </h1>
              <div className="">{myProfile.phone}</div>
            </div>
            <div className="flex bg-white rounded-md p-2 justify-start items-center shadow-md shadow-gray-400">
              <h1 className="text-lg font-semibold mx-2 w-[150px] border-r-2 border-gray-200">
                Joined Date
              </h1>
              <div>
                {new Date(myProfile.createdUserTimestamp).toLocaleString(
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
            </div>
          </div>
        </div>
        <Link
          to={`/resetMyPassword`}
          className="bg-slate-600 p-3 rounded-md text-white font-semibold mx-2 flex items-center"
          type="button"
        >
          Reset My Password <MdLockReset size={25} className="ml-1" />
        </Link>
        {/* {myProfile.role === "admin" && <button>Edit Details</button>} */}
      </div>
    )
  );
}
