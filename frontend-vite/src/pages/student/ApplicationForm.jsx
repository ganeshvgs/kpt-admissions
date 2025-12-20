import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

const BRANCHES = ["CSE", "ECE", "ME", "CE", "EEE"];

export default function ApplicationForm() {
  const { getToken } = useAuth();
  const [form, setForm] = useState(null);
  const [editable, setEditable] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/applications/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.application) {
        setForm(res.data.application);
        setEditable(
          ["DRAFT", "CORRECTION_REQUIRED"].includes(
            res.data.application.status
          )
        );
      } else {
        setForm({
          personalDetails: {},
          academicDetails: {},
          categoryDetails: { category: "GM", reservation: [] },
          branchPreferences: [],
        });
      }
    })();
  }, []);

  if (!form) return <p>Loading...</p>;

  const submit = async () => {
    const token = await getToken();

    const url =
      form.status === "CORRECTION_REQUIRED"
        ? "/applications"
        : "/applications";

    const method =
      form.status === "CORRECTION_REQUIRED" ? "put" : "post";

    await axios[method](
      `${import.meta.env.VITE_API_URL}${url}`,
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Application submitted");
    setEditable(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Application Form</h2>

      <input
        disabled={!editable}
        value={form.personalDetails.name || ""}
        onChange={(e) =>
          setForm({
            ...form,
            personalDetails: {
              ...form.personalDetails,
              name: e.target.value,
            },
          })
        }
        placeholder="Full Name"
        className="border p-2 w-full mb-2"
      />

      <div className="flex gap-2 flex-wrap">
        {BRANCHES.map((b) => (
          <button
            key={b}
            disabled={!editable}
            onClick={() =>
              setForm({
                ...form,
                branchPreferences: form.branchPreferences.includes(b)
                  ? form.branchPreferences.filter((x) => x !== b)
                  : [...form.branchPreferences, b],
              })
            }
            className={`px-3 py-1 border rounded ${
              form.branchPreferences.includes(b)
                ? "bg-indigo-600 text-white"
                : "bg-gray-100"
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {editable ? (
        <button
          onClick={submit}
          className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded"
        >
          {form.status === "CORRECTION_REQUIRED"
            ? "Re-Submit Application"
            : "Submit Application"}
        </button>
      ) : (
        <p className="mt-6 text-gray-500">
          Application submitted. Editing locked.
        </p>
      )}

      {form.remarks && (
        <p className="mt-4 text-red-600">
          Remarks: {form.remarks}
        </p>
      )}
    </div>
  );
}
