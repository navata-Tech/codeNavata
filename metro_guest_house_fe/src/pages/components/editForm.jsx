import { useState } from "react";
import CompanionForm from "./companionForm";
import { toast } from "react-toastify";
import { editEntry, visitorActions } from "../../store/slices/visitorSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { PulseLoader } from "react-spinners";

export default function EditForm({ id, entry, setState, entryId }) {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [companions, setCompaions] = useState([...entry.companion]);

  const [submitting, setSubmitting] = useState(false);

  const [companionForm, setCompanionForm] = useState(false);

  const [room, setRoom] = useState(entry.room);
  const [lastVisitedAddress, setLastVisitedAddress] = useState(
    entry.lastVisitedAddress
  );
  const [nextDestination, setNextDestination] = useState(entry.nextDestination);
  const [purpose, setPurpose] = useState(entry.purposeOfVisit);
  const [vechileNumber, setVechileNumber] = useState(entry.vechileNumber);
  const [remarks, setRemarks] = useState(entry.remarks);

  async function editHandler(e, id, entryId) {
    e.preventDefault();
    console.log("editing entry ", entryId);

    if (
      room === null ||
      lastVisitedAddress.trim() === "" ||
      nextDestination.trim() === "" ||
      purpose.trim() === ""
    ) {
      return toast.error("Form fields cannot be empty");
    }

    setSubmitting(true);

    const formData = {
      room,
      lastVisitedAddress,
      nextDestination,
      purpose,
      vechileNumber,
      companions,
      remarks,
    };

    const response = await editEntry(id, entryId, formData);
    if (response.success) {
      toast(response.message);
      dispatch(visitorActions.setSelectedEntry(response.editedEntry));
      setState("view");
    } else {
      toast.error(response.message);
    }
    setSubmitting(false);
  }

  function removeCompanion(index) {
    console.log(index);
    const companionData = [...companions];

    companionData.splice(index, 1);
    setCompaions([...companionData]);
  }

  console.log(entry, id);
  return (
    <div className={`w-full ${submitting && "cursor-not-allowed"}`}>
      <form
        className={`bg-gray-200 p-2 rounded-lg m-4 ${
          submitting && "pointer-events-none opacity-60"
        }`}
        onSubmit={(e) => editHandler(e, id, entryId)}
      >
        <div className="p-4 rounded-lg bg-white">
          <div className="flex justify-center items-center flex-wrap">
            <label htmlFor="room" className="flex-1 flex flex-col m-2">
              Room No*
              <input
                className="border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1"
                type="text"
                name="room"
                id="room"
                onChange={(e) => setRoom(e.target.value)}
                value={room}
                required
                onKeyPress={(e) => {
                  const isNumber = /[0-9]/.test(e.key);
                  if (!isNumber) {
                    e.preventDefault();
                  }
                }}
              />
            </label>
            <label
              htmlFor="lastVisitedAddress"
              className="flex-1 flex flex-col m-2"
            >
              Last Visited Address*
              <input
                className="border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1"
                type="text"
                name="lastVisitedAddress"
                id="lastVisitedAddress"
                onChange={(e) => setLastVisitedAddress(e.target.value)}
                value={lastVisitedAddress}
                required
              />
            </label>
            <label
              htmlFor="nextDestination"
              className="flex-1 flex flex-col m-2"
            >
              Next Destination*
              <input
                className="border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1"
                type="text"
                name="nextDestination"
                id="nextDestination"
                onChange={(e) => setNextDestination(e.target.value)}
                value={nextDestination}
                required
              />
            </label>
            <label htmlFor="purpose" className="flex-1 flex flex-col m-2">
              Purpose*
              <input
                className="border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1"
                type="text"
                name="purpose"
                id="purpose"
                onChange={(e) => setPurpose(e.target.value)}
                value={purpose}
                required
              />
            </label>
            <label htmlFor="vechileNumber" className="flex-1 flex flex-col m-2">
              Vechile Number
              <input
                className="border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1"
                type="text"
                name="vechileNumber"
                id="vechileNumber"
                onChange={(e) => setVechileNumber(e.target.value)}
                value={vechileNumber}
              />
            </label>
            <label htmlFor="remarks" className="flex-1 flex flex-col m-2">
              Remarks
              <input
                className="border border-yellow-700 rounded-md transition-all duration-200 focus:outline-none focus:border-green-500 p-1"
                type="text"
                name="remarks"
                id="remarks"
                onChange={(e) => setRemarks(e.target.value)}
                value={remarks}
              />
            </label>
            <div className="w-full flex justify-center items-center flex-col">
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
                              onClick={() => removeCompanion(index)}
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
        <div className="flex justify-center items-center">
          <button
            className="rounded-md bg-black text-white mt-2 p-2 self-center m-2 relative"
            type="submit"
          >
            Submit Edit{" "}
            {submitting && (
              <div className="absolute left-0 top-0 flex justify-center items-center w-full h-full backdrop-blur-lg">
                <PulseLoader color="yellow" />
              </div>
            )}
          </button>
          {/* <button
            className="rounded-md bg-black text-white mt-2 p-2 self-center m-2"
            onClick={() => setEntryForm(false)}
          >
            cancel
          </button> */}
          {!submitting && (
            <button
              onClick={() => setState("view")}
              className="bg-red-600 p-2 rounded-md text-white font-semibold mx-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
