import { BiCross } from "react-icons/bi";
import { CgCross } from "react-icons/cg";
import { ImCross } from "react-icons/im";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../../store/slices/usersSlice";

export default function FullScreenView() {
  const clickedImg = useSelector((state) => state.userReducer.clickedImg);

  const dispatch = useDispatch();

  return (
    clickedImg.clicked && (
      <div className="fixed top-0 h-[100vh] w-[100vw] border border-black bg-[#000000a7] flex justify-center items-center z-[100]">
        <div className="h-[80%] relative text-white">
          <img
            src={clickedImg.img}
            alt="fullscreen image"
            className="rounded-md h-full"
          />
          <div
            className="absolute top-0 right-0 p-4 rounded-full bg-red-400 translate-x-1/2 -translate-y-1/2"
            onClick={() => dispatch(userActions.setUnclicked())}
          >
            <ImCross size={30} />
          </div>
        </div>
      </div>
    )
  );
}
