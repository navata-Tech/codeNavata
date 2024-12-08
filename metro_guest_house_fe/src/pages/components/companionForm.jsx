import { useState } from "react";
import { toast } from "react-toastify";

export default function CompanionForm({
  companions,
  setCompanions,
  setCompanionForm,
}) {
  const [fullname, setFullname] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");

  function addCompanion() {
    const companionToAdd = [...companions];

    if (
      fullname.trim() === "" ||
      relation.trim() === "" ||
      phone.trim() === "" ||
      age.trim() === ""
    ) {
      return toast.error("fields cannot be empty");
    }

    const companionData = {
      fullname: fullname.trim(),
      relation: relation.trim(),
      phone: phone.trim(),
      age: age.trim(),
    };

    companionToAdd.push(companionData);
    console.log(companionToAdd);
    setCompanions(companionToAdd);
    setCompanionForm(false);
  }

  return (
    <>
      <h1 className="font-semibold text-xl mt-4">Companion Form</h1>
      <div className="grid grid-cols-2 gap-2 p-2  w-full ">
        <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
          <label
            htmlFor="fullname"
            className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
          >
            Full Name
          </label>
          <input
            className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
            type="text"
            name="fullname"
            id="fullname"
            onChange={(e) => setFullname(e.target.value)}
            value={fullname}
            required
          />
        </div>
        <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
          <label
            htmlFor="relation"
            className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
          >
            Relation
          </label>
          <input
            className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
            type="text"
            name="relation"
            id="relation"
            onChange={(e) => setRelation(e.target.value)}
            value={relation}
            required
          />
        </div>
        <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
          <label
            htmlFor="phone"
            className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
          >
            Phone
          </label>
          <input
            className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
            type="text"
            name="phone"
            id="phone"
            onChange={(e) => {
              setPhone(e.target.value);
            }}
            onKeyPress={(e) => {
              const isNumber = /[0-9]/.test(e.key);
              if (!isNumber) {
                e.preventDefault();
              }
            }}
            value={phone}
            required
          />
        </div>

        <div className="flex bg-white rounded-md justify-start items-center shadow-md shadow-gray-400 overflow-hidden">
          <label
            htmlFor="age"
            className="text-lg font-semibold mx-2 w-[200px] border-r-2 border-gray-200"
          >
            Age
          </label>
          <input
            className="outline-none py-3 w-full h-full transition-all border-white duration-200 border-r-[3px] focus:border-blue-800"
            type="text"
            name="age"
            id="age"
            onChange={(e) => {
              setAge(e.target.value);
            }}
            value={age}
            required
          />
        </div>
      </div>
      <div className="w-full flex justify-center items-center">
        <button
          type="button"
          className="bg-green-900 p-2 m-2 font-semibold rounded-md text-white"
          onClick={addCompanion}
        >
          Add Companion
        </button>
        <button
          type="button"
          className="m-2 bg-red-600 p-2 rounded-md text-white font-semibold"
          onClick={() => setCompanionForm(false)}
        >
          No Companion
        </button>
      </div>
    </>
  );
}
