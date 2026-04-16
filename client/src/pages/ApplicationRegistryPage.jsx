import React, { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import toast from "react-hot-toast";

import AdminNavbar from "../components/AdminNavbar";
import axiosInstance from "../lib/axios";
import { getErrorMessage } from "../lib/errors";

const ApplicationRegistryPage = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadEligibleStudents = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/admin/eligible-students");
        setStudents(response.data?.data?.students || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load eligible students"));
      } finally {
        setIsLoading(false);
      }
    };

    loadEligibleStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return students;
    }

    return students.filter((student) => {
      const name = String(student.name || "").toLowerCase();
      const rollNumber = String(student.roll_number || "").toLowerCase();
      const year = String(student.year || "").toLowerCase();
      const gender = String(student.gender || "").toLowerCase();

      return (
        name.includes(query) ||
        rollNumber.includes(query) ||
        year.includes(query) ||
        gender.includes(query)
      );
    });
  }, [searchQuery, students]);

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200 font-sans">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto pt-28 px-6 pb-12 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Eligible Hostler Students
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Live list from GET /api/admin/eligible-students.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <Users size={16} className="text-emerald-400" />
              <span className="text-xs font-bold text-white">
                {isLoading ? "..." : filteredStudents.length}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500">
                Shown
              </span>
            </div>
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search name, roll, year, gender"
                className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs outline-none focus:border-emerald-500/40 w-72 transition-all"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="bg-[#15202b]/40 border border-white/5 rounded-4xl backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Student Name
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Roll Number
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Year
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Gender
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-8 py-16 text-center text-slate-500 text-sm"
                    >
                      Loading eligible students...
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.roll_number}
                      className="hover:bg-white/2 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <p className="font-bold text-sm text-white">
                          {student.name}
                        </p>
                      </td>
                      <td className="px-8 py-6 font-mono text-xs text-slate-300">
                        {student.roll_number}
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-300">
                        {student.year}
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-300 capitalize">
                        {student.gender}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-8 py-16 text-center text-slate-500 text-sm"
                    >
                      No eligible hostler students found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicationRegistryPage;
