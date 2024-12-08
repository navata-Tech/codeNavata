import axios from "axios";
import { useEffect, useState } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [responseLoading, setResponseLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { id } = useParams();

  useEffect(() => {
    const handlePopState = () => {
      navigate("/visitor", { replace: true });
      if (id) {
        navigate(`/users/${id}`);
      } else {
        navigate("/myProfile");
      }
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("passwords doesnt match");
      return;
    }
    setResponseLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/users/${id}/resetPassword`,
        { password },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        toast(response.data.message);
        navigate(`/users/${id}`);
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
      setResponseLoading(false);
    }
  }

  async function handleAdminResetPassword(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("passwords doesnt match");
      return;
    }
    setResponseLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/users/resetPasswordAdm`,
        { currentPassword, password },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        toast(response.data.message);
        navigate(`/myProfile`);
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
      setResponseLoading(false);
    }
  }

  return (
    <>
      <div className="w-full">
        <div class="overflow-hidden flex items-center justify-center">
          <div class="bg-white lg:w-6/12 md:7/12 w-8/12 shadow-3xl rounded-xl">
            <div
              className="self-start my-4 bg-slate-300 h-fit w-fit pr-4 rounded-full flex items-center justify-center p-2 hover:text-white hover:bg-slate-600 hover:cursor-pointer transition-all duration-200"
              onClick={() => navigate(-1)}
            >
              <IoChevronBackOutline size={30} /> Previous
            </div>
            <form
              class="p-12 md:p-24 border border-blue-400 rounded-md shadow-lg mb-10 shadow-[#c4c4c4]"
              onSubmit={id ? handlePasswordChange : handleAdminResetPassword}
            >
              <h1 className="font-semibold text-xl text-center mb-4">
                Reset Password
              </h1>
              {!id && (
                <div class="flex items-center text-lg mb-6 md:mb-8">
                  <svg class="absolute ml-3" viewBox="0 0 24 24" width="24">
                    <path d="m18.75 9h-.75v-3c0-3.309-2.691-6-6-6s-6 2.691-6 6v3h-.75c-1.24 0-2.25 1.009-2.25 2.25v10.5c0 1.241 1.01 2.25 2.25 2.25h13.5c1.24 0 2.25-1.009 2.25-2.25v-10.5c0-1.241-1.01-2.25-2.25-2.25zm-10.75-3c0-2.206 1.794-4 4-4s4 1.794 4 4v3h-8zm5 10.722v2.278c0 .552-.447 1-1 1s-1-.448-1-1v-2.278c-.595-.347-1-.985-1-1.722 0-1.103.897-2 2-2s2 .897 2 2c0 .737-.405 1.375-1 1.722z" />
                  </svg>
                  <input
                    type="password"
                    id="password"
                    class="bg-gray-200 rounded pl-12 py-2 md:py-4 focus:outline-none w-full"
                    placeholder="Current Password"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    value={currentPassword}
                    autoComplete="off"
                  />
                </div>
              )}
              <div class="flex items-center text-lg mb-6 md:mb-8">
                <svg class="absolute ml-3" viewBox="0 0 24 24" width="24">
                  <path d="m18.75 9h-.75v-3c0-3.309-2.691-6-6-6s-6 2.691-6 6v3h-.75c-1.24 0-2.25 1.009-2.25 2.25v10.5c0 1.241 1.01 2.25 2.25 2.25h13.5c1.24 0 2.25-1.009 2.25-2.25v-10.5c0-1.241-1.01-2.25-2.25-2.25zm-10.75-3c0-2.206 1.794-4 4-4s4 1.794 4 4v3h-8zm5 10.722v2.278c0 .552-.447 1-1 1s-1-.448-1-1v-2.278c-.595-.347-1-.985-1-1.722 0-1.103.897-2 2-2s2 .897 2 2c0 .737-.405 1.375-1 1.722z" />
                </svg>
                <input
                  type="password"
                  id="password"
                  class="bg-gray-200 rounded pl-12 py-2 md:py-4 focus:outline-none w-full"
                  placeholder="New password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  autoComplete="off"
                />
              </div>
              <div class="flex items-center text-lg mb-6 md:mb-8">
                <svg class="absolute ml-3" viewBox="0 0 24 24" width="24">
                  <path d="m18.75 9h-.75v-3c0-3.309-2.691-6-6-6s-6 2.691-6 6v3h-.75c-1.24 0-2.25 1.009-2.25 2.25v10.5c0 1.241 1.01 2.25 2.25 2.25h13.5c1.24 0 2.25-1.009 2.25-2.25v-10.5c0-1.241-1.01-2.25-2.25-2.25zm-10.75-3c0-2.206 1.794-4 4-4s4 1.794 4 4v3h-8zm5 10.722v2.278c0 .552-.447 1-1 1s-1-.448-1-1v-2.278c-.595-.347-1-.985-1-1.722 0-1.103.897-2 2-2s2 .897 2 2c0 .737-.405 1.375-1 1.722z" />
                </svg>
                <input
                  type="password"
                  class="bg-gray-200 rounded pl-12 py-2 md:py-4 focus:outline-none w-full"
                  name="confirmPassword"
                  id="confirmPassword"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  autoComplete="off"
                  placeholder="Confirm Password"
                />
              </div>
              <button
                class="relative bg-gradient-to-b  from-gray-700 to-gray-900 font-medium p-2 md:p-4 text-white uppercase w-full rounded disabled:cursor-wait"
                disabled={responseLoading}
              >
                Reset Password{" "}
                {responseLoading && (
                  <div className="absolute left-0 top-0 flex justify-center items-center w-full h-full backdrop-blur-lg">
                    Please Wait <PulseLoader color="yellow" />
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
