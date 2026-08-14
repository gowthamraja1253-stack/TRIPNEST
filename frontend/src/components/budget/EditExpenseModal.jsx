import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

const categories = [
  "Transportation",
  "Hotel",
  "Food",
  "Shopping",
  "Entertainment",
  "Miscellaneous",
];

const EditExpenseModal = ({
  open,
  onClose,
  expense,
  refreshData,
}) => {
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    category: "Transportation",
    amount: "",
    date: "",
    description: "",
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title || "",
        category: expense.category || "Transportation",
        amount: expense.amount || "",
        date: expense.date || "",
        description: expense.description || "",
      });
    }
  }, [expense]);

  if (!open) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validate = () => {
    const temp = {};

    if (!formData.title.trim())
      temp.title = "Title is required";

    if (!formData.amount)
      temp.amount = "Amount is required";

    if (Number(formData.amount) <= 0)
      temp.amount = "Invalid amount";

    if (!formData.date)
      temp.date = "Date is required";

    setErrors(temp);

    return Object.keys(temp).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      await axios.put(
        `/api/expenses/${expense.id}`,
        formData
      );

      refreshData();

      onClose();

    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "Failed to update expense."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-xl p-8 relative">

        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-500 hover:text-red-500"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold">
          Edit Expense
        </h2>

        <p className="text-gray-500 mt-2">
          Update expense details.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <div>

            <label>Title</label>

            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 mt-2"
            />

            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title}
              </p>
            )}

          </div>

          <div>

            <label>Category</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 mt-2"
            >
              {categories.map((item) => (
                <option key={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

          <div>

            <label>Amount</label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 mt-2"
            />

            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.amount}
              </p>
            )}

          </div>

          <div>

            <label>Date</label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 mt-2"
            />

            {errors.date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.date}
              </p>
            )}

          </div>

        </div>

        <div className="mt-6">

          <label>Description</label>

          <textarea
            rows="5"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-xl p-3 mt-2 resize-none"
          />

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            className="border px-6 py-3 rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Expense"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default EditExpenseModal;