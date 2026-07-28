import React, { useState } from "react";
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

const AddExpenseModal = ({ open, onClose, refreshData }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "Transportation",
    amount: "",
    date: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

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
    const newErrors = {};

    if (!formData.title.trim())
      newErrors.title = "Expense title is required.";

    if (!formData.amount)
      newErrors.amount = "Amount is required.";

    if (Number(formData.amount) <= 0)
      newErrors.amount = "Amount must be greater than zero.";

    if (!formData.date)
      newErrors.date = "Please select a date.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative">

        {/* Close */}

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-red-500"
        >
          <X size={24} />
        </button>

        {/* Header */}

        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
          Add New Expense
        </h2>

        <p className="text-gray-500 mt-2">
          Record your travel expense.
        </p>

        {/* Form */}

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          {/* Title */}

          <div>

            <label className="font-medium">
              Expense Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-xl mt-2 p-3"
              placeholder="Hotel Booking"
            />

            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title}
              </p>
            )}

          </div>

          {/* Category */}

          <div>

            <label className="font-medium">
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-xl mt-2 p-3"
            >
              {categories.map((item) => (
                <option key={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

          {/* Amount */}

          <div>

            <label className="font-medium">
              Amount
            </label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border rounded-xl mt-2 p-3"
              placeholder="5000"
            />

            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.amount}
              </p>
            )}

          </div>

          {/* Date */}

          <div>

            <label className="font-medium">
              Expense Date
            </label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border rounded-xl mt-2 p-3"
            />

            {errors.date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.date}
              </p>
            )}

          </div>

        </div>

        {/* Description */}

        <div className="mt-6">

          <label className="font-medium">
            Description
          </label>

          <textarea
            rows="5"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-xl mt-2 p-3 resize-none"
            placeholder="Additional notes..."
          />

        </div>
                {/* Buttons */}

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 rounded-xl border hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              if (!validate()) return;

              try {
                setLoading(true);

                await axios.post("/api/expenses", formData);

                refreshData();

                setFormData({
                  title: "",
                  category: "Transportation",
                  amount: "",
                  date: "",
                  description: "",
                });

                setErrors({});

                onClose();

              } catch (error) {

                console.error(error);

                alert(
                  error?.response?.data?.message ||
                    "Failed to add expense."
                );

              } finally {

                setLoading(false);

              }
            }}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Expense"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default AddExpenseModal;