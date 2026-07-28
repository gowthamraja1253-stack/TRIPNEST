import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  Filter,
  Calendar,
  IndianRupee,
} from "lucide-react";
import axios from "axios";

const PAGE_SIZE = 10;

const categories = [
  "All",
  "Transportation",
  "Hotel",
  "Food",
  "Shopping",
  "Entertainment",
  "Miscellaneous",
];

const ExpenseTable = ({ expenses = [], loading, refreshData }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setTableData(expenses);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    let data = [...tableData];

    if (search.trim() !== "") {
      data = data.filter((expense) =>
        expense.title
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (category !== "All") {
      data = data.filter(
        (expense) => expense.category === category
      );
    }

    if (selectedDate !== "") {
      data = data.filter(
        (expense) => expense.date === selectedDate
      );
    }

    return data;
  }, [tableData, search, category, selectedDate]);

  const totalPages = Math.ceil(
    filteredExpenses.length / PAGE_SIZE
  );

  const paginatedExpenses = filteredExpenses.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      await axios.delete(`/api/expenses/${id}`);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (expense) => {
    console.log("Edit Expense:", expense);
    // Edit modal will be added in Part 3
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 border-b">

        <div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Expense History
          </h2>

          <p className="text-gray-500 mt-1">
            View and manage all recorded travel expenses.
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          {/* Search */}

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search Expense..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />

          </div>

          {/* Category */}

          <div className="relative">

            <Filter
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 border rounded-xl outline-none"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

          </div>

          {/* Date */}

          <div className="relative">

            <Calendar
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 border rounded-xl outline-none"
            />

          </div>

        </div>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-100 dark:bg-slate-700">

            <tr>

              <th className="text-left px-6 py-4">Expense</th>

              <th className="text-left px-6 py-4">Category</th>

              <th className="text-left px-6 py-4">Date</th>

              <th className="text-left px-6 py-4">Amount</th>

              <th className="text-center px-6 py-4">Actions</th>

            </tr>

          </thead>

          <tbody>
                        {loading ? (
              [...Array(6)].map((_, index) => (
                <tr
                  key={index}
                  className="border-b animate-pulse"
                >
                  <td className="px-6 py-5">
                    <div className="h-4 w-40 bg-gray-300 rounded"></div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="h-4 w-28 bg-gray-300 rounded"></div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-3">
                      <div className="h-8 w-8 rounded bg-gray-300"></div>
                      <div className="h-8 w-8 rounded bg-gray-300"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : paginatedExpenses.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-12"
                >
                  <IndianRupee
                    size={60}
                    className="mx-auto text-gray-300"
                  />

                  <h3 className="text-xl font-semibold mt-4">
                    No Expenses Found
                  </h3>

                  <p className="text-gray-500 mt-2">
                    Start by adding your first travel expense.
                  </p>
                </td>
              </tr>
            ) : (
              paginatedExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="border-b hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <td className="px-6 py-5">

                    <h3 className="font-semibold text-slate-800 dark:text-white">
                      {expense.title}
                    </h3>

                    <p className="text-gray-500 text-sm">
                      {expense.description}
                    </p>

                  </td>

                  <td className="px-6 py-5">

                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                      {expense.category}
                    </span>

                  </td>

                  <td className="px-6 py-5">
                    {expense.date}
                  </td>

                  <td className="px-6 py-5 font-semibold text-red-500">
                    ₹ {Number(expense.amount).toLocaleString()}
                  </td>

                  <td className="px-6 py-5">

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() => handleEdit(expense)}
                        className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="w-9 h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

      {/* Pagination */}

      <div className="flex items-center justify-between p-5 border-t">

        <p className="text-gray-500 text-sm">
          Showing {(page - 1) * PAGE_SIZE + 1} -
          {Math.min(
            page * PAGE_SIZE,
            filteredExpenses.length
          )} of {filteredExpenses.length}
        </p>

        <div className="flex gap-2">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => (
              <button
                key={index}
                onClick={() => setPage(index + 1)}
                className={`px-4 py-2 rounded-lg ${
                  page === index + 1
                    ? "bg-blue-600 text-white"
                    : "border"
                }`}
              >
                {index + 1}
              </button>
            )
          )}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
};

export default ExpenseTable;