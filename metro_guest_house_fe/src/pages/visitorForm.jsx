import axios from "axios";
import { useState } from "react";
import { FaUpload } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";

import { RxCross2 } from "react-icons/rx";

import documentImg from "/document.png";
import { useDispatch } from "react-redux";
import { visitorActions } from "../store/slices/visitorSlice";
import CompanionForm from "./components/companionForm";
import { PulseLoader } from "react-spinners";

export default function VisitorForm({ visitorToEdit, setState, reupload }) {
  const dispatch = useDispatch();

  const [submitting, setSubmitting] = useState(false);

  const { id } = useParams();

  const [companions, setCompaions] = useState([]);

  const [companionForm, setCompanionForm] = useState(false);

  const [firstname, setFirst] = useState(
    visitorToEdit ? visitorToEdit.firstname : ""
  );
  const [lastname, setLast] = useState(
    visitorToEdit ? visitorToEdit.lastname : ""
  );
  const [email, setEmail] = useState(visitorToEdit ? visitorToEdit.email : "");
  const [phone, setPhone] = useState(visitorToEdit ? visitorToEdit.phone : "");
  const [religion, setReligion] = useState(
    visitorToEdit ? visitorToEdit.religion : ""
  );

  const [room, setRoom] = useState("");
  const [lastVisitedAddress, setLastVisitedAddress] = useState("");
  const [nextDestination, setNextDestination] = useState("");
  const [purpose, setPurpose] = useState("");
  const [vechileNumber, setVechileNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  const [haveDocument, setHaveDocument] = useState(reupload ? true : false);

  const [image, setImage] = useState(
    visitorToEdit ? visitorToEdit.documentLocation : null
  );
  const [documentType, setDocumentType] = useState(
    visitorToEdit ? visitorToEdit.documentType : "citizenship"
  );

  const [otherDocumentType, setOtherDocumentType] = useState("");

  const [age, setAge] = useState(visitorToEdit ? visitorToEdit.age : "");

  const [address, setAddress] = useState(
    visitorToEdit ? visitorToEdit.address : ""
  );

  const [documentID, setDocumentID] = useState(
    visitorToEdit ? visitorToEdit.documentId : ""
  );

  const [gender, setGender] = useState(
    visitorToEdit ? visitorToEdit.gender : ""
  );
  const [occupation, setOccupation] = useState(
    visitorToEdit ? visitorToEdit.occupation : ""
  );

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    console.log(e.target.files);
    setImage(e.target.files[0]);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (haveDocument) {
      if (
        !image ||
        !firstname?.trim() ||
        !lastname?.trim() ||
        !phone?.trim() ||
        !address?.trim() ||
        !gender?.trim() ||
        !age?.trim() ||
        !occupation?.trim() ||
        !room?.trim() ||
        !lastVisitedAddress?.trim() ||
        !nextDestination?.trim() ||
        !purpose?.trim() ||
        !documentID?.trim()
      ) {
        toast.info("fields marked with * are required");
        return;
      } else if (
        !firstname?.trim() ||
        !lastname?.trim() ||
        !phone?.trim() ||
        !address?.trim() ||
        !gender?.trim() ||
        !age?.trim() ||
        !occupation?.trim() ||
        !room?.trim() ||
        !lastVisitedAddress?.trim() ||
        !nextDestination?.trim() ||
        !purpose?.trim()
      ) {
        toast.info("fields marked with * are required");
        return;
      }
    }

    if (documentType == "other" && otherDocumentType.trim() === "") {
      toast.info("please specify document type");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("firstname", firstname);
    formData.append("lastname", lastname);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("documentId", documentID);
    formData.append(
      "documentType",
      documentType === "other" ? otherDocumentType : documentType
    );
    formData.append("gender", gender);
    formData.append("age", age);
    formData.append("occupation", occupation);
    formData.append("room", room);
    formData.append("religion", religion);
    formData.append("lastVisited", lastVisitedAddress);
    formData.append("nextDestination", nextDestination);
    formData.append("purpose", purpose);
    formData.append("vechileNumber", vechileNumber);
    formData.append("remarks", remarks);
    formData.append("companions", JSON.stringify(companions));

    console.log(formData);

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/visitor`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Image uploaded successfully:", response.data);
      if (response.data.success) {
        toast(response.data.message);
        navigate(`/visitor/${response.data.visitorAdded._id}`);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else if (error.response && error.response.data) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = error.response.data;
        toast.error(tempDiv.querySelector("h1").innerText);
      } else {
        toast.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    if (
      !firstname?.trim() ||
      !lastname?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !gender?.trim() ||
      !age ||
      !occupation?.trim()
    ) {
      toast.info("fields marked with * are required");
      return;
    }

    const formData = {
      firstname,
      lastname,
      email,
      phone,
      address,
      gender,
      age,
      occupation,
      religion,
    };

    try {
      setSubmitting(true);
      const response = await axios.patch(
        `${import.meta.env.VITE_SERVER}/visitor/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(response);
      if (response.data.success) {
        toast(response.data.message);
        dispatch(
          visitorActions.setSelectedVisitor(response.data.editedVisitor)
        );
        setState("view");
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
      setSubmitting(false);
    }
  };

  async function handleReupload(e) {
    e.preventDefault();

    if (documentType == "other" && otherDocumentType.trim() === "") {
      toast.info("please specify document type");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("documentId", documentID);
    formData.append(
      "documentType",
      documentType == "other" ? otherDocumentType : documentType
    );

    try {
      setSubmitting(true);
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER}/visitor/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        toast(response.data.message);
        navigate(`/visitor/${id}`);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else if (error.response && error.response.data) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = error.response.data;
        toast.error(tempDiv.querySelector("h1").innerText);
      } else {
        toast.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={` ${submitting && "cursor-not-allowed opacity-60"}`}>
      <form
        className={`flex flex-col flex-wrap z-10 justify-center items-center p-4 mb-6 bg-gray-200 overflow-hidden rounded-md shadow-lg shadow-gray-400 ${
          submitting && "pointer-events-none"
        }`}
        onSubmit={
          visitorToEdit
            ? handleEdit
            : reupload
            ? handleReupload
            : handleRegister
        }
      >
        <h1 className="text-2xl font-semibold text-center mb-4 px-4 z-10 py-2 relative flex justify-center items-center text-white w-fit">
          {visitorToEdit
            ? "Visitor Edit Form"
            : reupload
            ? "Reupload Document"
            : "Visitor Form"}
          <span className="absolute w-full h-full bg-[#17469E] top-0 left-0 -z-10 skew-x-[15deg]"></span>
        </h1>

        {!reupload && (
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 p-2  w-full ">
            <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
              <label
                htmlFor="firstname"
                className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
              >
                Firstname*
              </label>
              <input
                type="text"
                name="firstname"
                id="firstname"
                className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                value={firstname}
                onChange={(e) => setFirst(e.target.value)}
                placeholder="Jon"
                autoComplete="off"
                required
              />
            </div>
            <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
              <label
                htmlFor="lastname"
                className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
              >
                Lastname*
              </label>
              <input
                className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                type="text"
                name="lastname"
                id="lastname"
                onChange={(e) => setLast(e.target.value)}
                value={lastname}
                placeholder="doe"
                autoComplete="off"
                required
              />
            </div>
            {!visitorToEdit && (
              <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
                <label
                  htmlFor="room"
                  className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
                >
                  Room No*
                </label>
                <input
                  className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                  type="text"
                  name="room"
                  id="room"
                  onChange={(e) => setRoom(e.target.value)}
                  value={room}
                  placeholder="Room Number"
                  autoComplete="off"
                  required
                  onKeyPress={(e) => {
                    const isNumber = /[0-9]/.test(e.key);
                    if (!isNumber) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            )}
            <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
              <label
                htmlFor="religion"
                className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
              >
                Religion
              </label>
              <input
                className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                type="text"
                name="religion"
                id="religion"
                onChange={(e) => setReligion(e.target.value)}
                value={religion}
                autoComplete="off"
                placeholder="Religion"
              />
            </div>

            <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
              <label
                htmlFor="address"
                className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
              >
                Address*
              </label>
              <input
                className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                type="text"
                name="address"
                id="address"
                onChange={(e) => setAddress(e.target.value)}
                value={address}
                autoComplete="off"
                placeholder="address"
                required
              />
            </div>

            <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
              <label
                htmlFor="age"
                className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
              >
                Age*
              </label>
              <input
                className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                type="age"
                name="age"
                id="age"
                onChange={(e) => setAge(e.target.value)}
                value={age}
                autoComplete="off"
                placeholder="age"
                required
                onKeyPress={(e) => {
                  const isNumber = /[0-9]/.test(e.key);
                  if (!isNumber) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            {!visitorToEdit && (
              <>
                <div className="flex py-2 bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
                  <label
                    htmlFor="lastVisitedAddress"
                    className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
                  >
                    Last Visited Address*
                  </label>
                  <input
                    className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                    type="text"
                    name="lastVisitedAddress"
                    id="lastVisitedAddress"
                    onChange={(e) => setLastVisitedAddress(e.target.value)}
                    value={lastVisitedAddress}
                    autoComplete="off"
                    placeholder="last visited place"
                    required
                  />
                </div>
                <div className="flex py-2 bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
                  <label
                    htmlFor="nextDestination"
                    className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
                  >
                    Next Destination*
                  </label>
                  <input
                    className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                    type="text"
                    name="nextDestination"
                    id="nextDestination"
                    onChange={(e) => setNextDestination(e.target.value)}
                    value={nextDestination}
                    autoComplete="off"
                    placeholder="next destination"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
              <label
                htmlFor="occupation"
                className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
              >
                Occupation*
              </label>
              <input
                className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                type="text"
                name="occupation"
                id="occupation"
                onChange={(e) => setOccupation(e.target.value)}
                value={occupation}
                autoComplete="off"
                placeholder="occupation"
                required
              />
            </div>

            {!visitorToEdit && (
              <div className="flex py-2 bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
                <label
                  htmlFor="purpose"
                  className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
                >
                  Purpose Of Visit*
                </label>
                <input
                  className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                  type="text"
                  name="purpose"
                  id="purpose"
                  onChange={(e) => setPurpose(e.target.value)}
                  value={purpose}
                  autoComplete="off"
                  placeholder="purpose"
                  required
                />
              </div>
            )}

            <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
              {/* <label
                htmlFor="gender"
                className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
              >
                Gender*
              </label>
              <input
                className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                type="gender"
                name="gender"
                id="gender"
                onChange={(e) => setGender(e.target.value)}
                value={gender}
                autoComplete="off"
                placeholder="Male, Female"
                required
              /> */}
              <label
                htmlFor="gender"
                className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
              >
                Gender*
              </label>
              <select
                className="outline-none py-3 w-full h-full transition-all bg-white border-white duration-200 border-r-[3px] focus:border-blue-800"
                name="gender"
                id="gender"
                onChange={(e) => setGender(e.target.value)}
                value={gender}
                required
              >
                <option value="" className="text-xl" disabled>
                  Select Gender
                </option>
                <option value="Male" className="text-xl">
                  Male
                </option>
                <option value="Female" className="text-xl">
                  Female
                </option>
                <option value="Other" className="text-xl">
                  Other
                </option>
              </select>
            </div>

            <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
              <label
                htmlFor="email"
                className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
              >
                Email
              </label>
              <input
                className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                type="email"
                name="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                autoComplete="off"
                placeholder="email"
              />
            </div>

            <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
              <label
                htmlFor="phone"
                className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
              >
                Phone*
              </label>
              <input
                className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                type="text"
                name="phone"
                id="phone"
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
                autoComplete="off"
                placeholder="phone number"
                minLength={10}
                maxLength={18}
                required
                onKeyPress={(e) => {
                  const isNumber = /[0-9]/.test(e.key);
                  if (!isNumber) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>
        )}

        {!visitorToEdit && haveDocument ? (
          <>
            <input
              type="file"
              name="image"
              id="image"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            {image ? (
              <div className=" w-[700px] overflow-hidden h-[400px] flex flex-col justify-center items-center text-center relative rounded-lg my-6">
                <img
                  src={visitorToEdit ? image : URL.createObjectURL(image)}
                  alt="avatar"
                  className="w-full h-full object-contain"
                />
                <div
                  className="right-2 z-10 absolute top-2 rounded-full bg-slate-600 text-white p-2 hover:cursor-pointer"
                  onClick={() => setImage(null)}
                >
                  <RxCross2 size={40} />
                </div>
              </div>
            ) : (
              <label
                htmlFor="image"
                className="cursor-pointer w-full overflow-hidden h-[400px] flex flex-col justify-center items-center text-center relative rounded-lg my-6"
              >
                <div className="absolute z-10 w-full h-full top-0 left-0 flex flex-col justify-center bg-[#00000097] items-center text-xl text-white">
                  <FaUpload size={50} className="text-4xl mb-2 z-10" />
                  <span>
                    Upload Document <br />{" "}
                    <span className="text-sm text-slate-200">
                      (image under 3mb)
                    </span>
                  </span>
                </div>
                <img
                  src={documentImg}
                  className="top-0 left-0 w-full h-full object-contain absolute z-0"
                  alt=""
                />
              </label>
            )}
            {!visitorToEdit && !reupload && haveDocument && (
              <button
                className="bg-red-600 p-2 rounded-md text-white font-semibold"
                onClick={() => setHaveDocument(false)}
              >
                Don't have Document
              </button>
            )}
          </>
        ) : (
          !visitorToEdit && (
            <button
              className="bg-green-600 p-2 rounded-md text-white font-semibold"
              type="button"
              onClick={() => setHaveDocument(true)}
            >
              Have Document
            </button>
          )
        )}
        {!visitorToEdit && (
          <>
            <div className="grid grid-cols-2 gap-2 p-2  w-full ">
              {haveDocument && (
                <>
                  <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
                    <label
                      htmlFor="docType"
                      className="text-lg font-semibold mx-2 w-[200px] border-gray-200"
                    >
                      Document Type
                    </label>
                    <select
                      name="docType"
                      id="docType"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="text-xl p-2 rounded-lg ml-4"
                    >
                      <option value="citizenship">Citizenship</option>
                      <option value="liscence">Liscence</option>
                      <option value="passport">Passport</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {documentType === "other" && (
                    <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden p-4 mt-4">
                      <label
                        htmlFor="otherDocType"
                        className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
                      >
                        Specify
                      </label>
                      <input
                        type="text"
                        name="otherDocType"
                        id="otherDocType"
                        value={otherDocumentType}
                        onChange={(e) => setOtherDocumentType(e.target.value)}
                        className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                        placeholder="Specify Document Type"
                      />
                    </div>
                  )}

                  <div className="flex mt-4 bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
                    <label
                      htmlFor="ID"
                      className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
                    >
                      Document ID*
                    </label>
                    <input
                      className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                      type="text"
                      name="ID"
                      id="ID"
                      onChange={(e) => setDocumentID(e.target.value)}
                      value={documentID}
                      autoComplete="off"
                      placeholder="ID Number"
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
        {!reupload && !visitorToEdit && (
          <>
            <div className="flex mt-4 bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
              <label
                htmlFor="vechileNumber"
                className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
              >
                Vechile Number
              </label>
              <input
                className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                type="text"
                name="vechileNumber"
                id="vechileNumber"
                onChange={(e) => setVechileNumber(e.target.value)}
                value={vechileNumber}
                autoComplete="off"
                placeholder="Vechile Number"
              />
            </div>
            <div className="flex mt-4 bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
              <label
                htmlFor="remarks"
                className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
              >
                Remarks
              </label>
              <input
                className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
                type="text"
                name="remarks"
                id="remarks"
                onChange={(e) => setRemarks(e.target.value)}
                value={remarks}
                autoComplete="off"
                placeholder="remarks"
              />
            </div>
            <div className="w-full flex flex-col items-center justify-center my-3">
              {companions.length > 0 && (
                <>
                  <h1 className="font-semibold text-xl my-2">Companions</h1>
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
          </>
        )}

        <div className="flex justify-center items-center">
          <button
            type="submit"
            className="rounded-md bg-black text-white mt-2 self-center w-auto p-3 shadow-lg border border-white hover:shadow-md transition-all duration-200 shadow-black relative"
          >
            {visitorToEdit ? "Submit Edit" : "Submit"}
            {submitting && (
              <div className="absolute left-0 top-0 flex justify-center items-center w-full h-full backdrop-blur-lg">
                <PulseLoader color="yellow" />
              </div>
            )}
          </button>
          {visitorToEdit && !submitting && (
            <button
              type="button"
              className="bg-red-600 p-2 rounded-md text-white font-semibold"
              onClick={() => setState("view")}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
