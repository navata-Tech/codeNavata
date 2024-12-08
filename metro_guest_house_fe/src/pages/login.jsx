import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginActions } from "../store/slices/loginSlice";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";

export default function Login() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [logging, setLogging] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLogging(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER}/users/login`,
        {
          username,
          password,
        }
      );

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        toast("Logged In");
        dispatch(loginActions.login());
        dispatch(loginActions.setUser(res.data.user));
        window.location.pathname = "/";
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex justify-center items-center">
      <form
        className="flex flex-col p-3 shadow-lg shadow-black rounded-md"
        onSubmit={handleLogin}
      >
        <h1 className="text-center text-l font-semibold">Login Form</h1>
        <div className="flex flex-col">
          <label htmlFor="username" className="mt-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            className={`border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1 ${
              logging ? "cursor-not-allowed" : ""
            }`}
            onChange={(e) =>
              logging ? setUsername(username) : setUsername(e.target.value)
            }
            value={username}
            disabled={logging}
            required
          />
          <label htmlFor="password" className="mt-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className={`border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1 ${
              logging ? "cursor-not-allowed" : ""
            }`}
            onChange={(e) =>
              logging ? setPassword(password) : setPassword(e.target.value)
            }
            value={password}
            disabled={logging}
            required
          />
        </div>
        <button
          type="submit"
          className={`rounded-md text-white p-1 mt-2 w-1/2 h-[40px] self-center transition-all duration-200 flex justify-center items-center ${
            logging ? "bg-slate-900 cursor-not-allowed" : "bg-black"
          }`}
          disabled={logging}
        >
          {logging ? <BeatLoader color="white" /> : "Login"}
        </button>
      </form>
    </div>
  );
}
