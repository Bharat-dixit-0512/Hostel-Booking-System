import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileUp,
  RefreshCw,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

import AdminNavbar from "../components/AdminNavbar";
import axiosInstance from "../lib/axios";
import { getErrorMessage } from "../lib/errors";

const SummaryCard = ({ label, value, tone = "text-white" }) => (
  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
      {label}
    </p>
    <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
  </div>
);

const Badge = ({ isAc }) => (
  <span
    className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
      isAc ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"
    }`}
  >
    {isAc ? "AC" : "Non-AC"}
  </span>
);

const RoomImportPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hostels, setHostels] = useState([]);
  const [hostelId, setHostelId] = useState(searchParams.get("hostelId") || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoadingHostels, setIsLoadingHostels] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadHostels = async () => {
      setIsLoadingHostels(true);
      try {
        const response = await axiosInstance.get("/admin/hostels");
        setHostels(response.data?.data?.hostels || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load hostels"));
      } finally {
        setIsLoadingHostels(false);
      }
    };

    loadHostels();
  }, []);

  const selectedHostel = useMemo(
    () =>
      hostels.find((hostel) => String(hostel.hostel_id) === String(hostelId)),
    [hostelId, hostels],
  );

  const resetPreview = () => setPreview(null);

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("file", file);
    return formData;
  };

  const handlePreview = async () => {
    if (!hostelId || !file) {
      toast.error("Select hostel and file first");
      return;
    }

    setIsPreviewLoading(true);
    try {
      const response = await axiosInstance.post(
        `/admin/hostels/${hostelId}/rooms/import/preview`,
        buildFormData(),
        {
          timeout: 60000,
        },
      );

      setPreview(response.data?.data?.preview || null);
      toast.success("Preview generated");
    } catch (error) {
      setPreview(error?.response?.data?.data?.preview || null);
      toast.error(getErrorMessage(error, "Preview failed"));
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!hostelId || !file || !preview || preview.status === "error") {
      return;
    }

    setIsConfirmLoading(true);
    try {
      const response = await axiosInstance.post(
        `/admin/hostels/${hostelId}/rooms/import/confirm`,
        buildFormData(),
        {
          timeout: 60000,
        },
      );

      const summary = response.data?.data?.summary;
      toast.success(
        `Import complete: ${summary?.created || 0} created, ${summary?.updated || 0} updated, ${summary?.skipped || 0} unchanged.`,
      );
      setPreview(null);
      setFile(null);
    } catch (error) {
      setPreview(error?.response?.data?.data?.preview || preview);
      toast.error(getErrorMessage(error, "Confirm failed"));
    } finally {
      setIsConfirmLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto pt-28 px-6 pb-12 space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <FileUp size={16} className="text-emerald-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                Bulk Room Import
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Upload Rooms
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Upload a CSV/XLSX file and review smart preview before applying
              changes. Required columns: room number, floor (0-based), capacity,
              and AC type.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/manage-hostels")}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold border border-white/10 transition-all cursor-pointer"
          >
            Back to Inventory
          </button>
        </header>

        <section className="bg-[#15202b]/40 border border-white/5 rounded-[32px] p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Hostel
              </label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                value={hostelId}
                disabled={isLoadingHostels}
                onChange={(event) => {
                  setHostelId(event.target.value);
                  resetPreview();
                }}
              >
                <option value="">Select a hostel</option>
                {hostels.map((hostel) => (
                  <option key={hostel.hostel_id} value={hostel.hostel_id}>
                    {hostel.hostel_name} (ID: {hostel.hostel_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Import File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onClick={(event) => {
                  // Allow re-selecting the same filename so retries work without page refresh.
                  event.currentTarget.value = "";
                }}
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  resetPreview();
                }}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-300 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:text-xs file:font-bold file:cursor-pointer"
              />
            </div>
          </div>

          {selectedHostel ? (
            <p className="text-xs text-slate-400">
              Selected hostel:{" "}
              <span className="text-white font-bold">
                {selectedHostel.hostel_name}
              </span>{" "}
              <span className="text-slate-500">
                (Floors: {selectedHostel.floors ?? 1})
              </span>
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!file || !hostelId || isPreviewLoading}
              onClick={handlePreview}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPreviewLoading ? "Generating Preview..." : "Preview Import"}
            </button>
            <button
              type="button"
              disabled={!preview}
              onClick={resetPreview}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-300 border border-white/10 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center gap-2">
                <RefreshCw size={14} /> Clear Preview
              </span>
            </button>
          </div>
        </section>

        {preview ? (
          <section className="space-y-6">
            <div
              className={`rounded-2xl px-5 py-4 border flex items-center gap-3 ${
                preview.status === "error"
                  ? "bg-red-500/10 border-red-500/20 text-red-200"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
              }`}
            >
              {preview.status === "error" ? (
                <XCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <p className="text-sm font-semibold">
                {preview.status === "error"
                  ? "Preview found blocking issues. Resolve errors before confirm."
                  : "Preview is valid. You can confirm import now."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <SummaryCard label="Total Rows" value={preview.total_rows || 0} />
              <SummaryCard
                label="Valid Rows"
                value={preview.valid_rows || 0}
                tone="text-emerald-400"
              />
              <SummaryCard
                label="New"
                value={(preview.new_rooms || []).length}
                tone="text-emerald-400"
              />
              <SummaryCard
                label="Updated"
                value={(preview.updated_rooms || []).length}
                tone="text-blue-400"
              />
              <SummaryCard
                label="Unchanged"
                value={(preview.unchanged_rooms || []).length}
                tone="text-slate-300"
              />
              <SummaryCard
                label="Warnings"
                value={(preview.warnings || []).length}
                tone="text-yellow-400"
              />
              <SummaryCard
                label="Errors"
                value={(preview.errors || []).length}
                tone="text-red-400"
              />
              <SummaryCard
                label="Skipped"
                value={
                  (preview.invalid_rows_skipped || 0) +
                  (preview.empty_rows_skipped || 0)
                }
                tone="text-orange-400"
              />
            </div>

            {(preview.errors || []).length > 0 ? (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
                <h3 className="text-sm font-black text-red-300 uppercase tracking-wider inline-flex items-center gap-2">
                  <AlertTriangle size={16} /> Blocking Errors
                </h3>
                <ul className="space-y-2 text-xs text-red-200 list-disc pl-5">
                  {(preview.errors || []).map((errorText) => (
                    <li key={errorText}>{errorText}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {(preview.warnings || []).length > 0 ? (
              <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-5 space-y-3">
                <h3 className="text-sm font-black text-yellow-300 uppercase tracking-wider">
                  Warnings
                </h3>
                <ul className="space-y-2 text-xs text-yellow-100 list-disc pl-5">
                  {(preview.warnings || []).map((warningText) => (
                    <li key={warningText}>{warningText}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="bg-[#15202b]/40 border border-white/5 rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  New Rooms
                </h3>
                {(preview.new_rooms || []).length ? (
                  <div className="space-y-2 max-h-80 overflow-auto pr-1">
                    {preview.new_rooms.map((room) => (
                      <div
                        key={`new-${room.room_number}`}
                        className="rounded-2xl bg-black/20 border border-white/5 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-white">
                            Room {room.room_number}
                          </p>
                          <Badge isAc={room.ac_type} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Floor {room.floor} | Capacity {room.capacity}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No new rooms.</p>
                )}
              </div>

              <div className="bg-[#15202b]/40 border border-white/5 rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-400">
                  Updated Rooms
                </h3>
                {(preview.updated_rooms || []).length ? (
                  <div className="space-y-2 max-h-80 overflow-auto pr-1">
                    {preview.updated_rooms.map((room) => (
                      <div
                        key={`upd-${room.room_number}`}
                        className="rounded-2xl bg-black/20 border border-white/5 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-white">
                            Room {room.room_number}
                          </p>
                          <div className="flex items-center gap-1">
                            <Badge isAc={room.old_ac_type} />
                            <span className="text-slate-500">→</span>
                            <Badge isAc={room.new_ac_type} />
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Floor {room.old_floor} → {room.new_floor} | Capacity{" "}
                          {room.old_capacity} → {room.new_capacity} | Occupied{" "}
                          {room.occupied_beds}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No updates.</p>
                )}
              </div>

              <div className="bg-[#15202b]/40 border border-white/5 rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Unchanged Rooms
                </h3>
                {(preview.unchanged_rooms || []).length ? (
                  <div className="space-y-2 max-h-80 overflow-auto pr-1">
                    {preview.unchanged_rooms.map((room) => (
                      <div
                        key={`same-${room.room_number}`}
                        className="rounded-2xl bg-black/20 border border-white/5 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-white">
                            Room {room.room_number}
                          </p>
                          <Badge isAc={room.ac_type} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Floor {room.floor} | Capacity {room.capacity}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No unchanged rows.</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                disabled={preview.status === "error" || isConfirmLoading}
                onClick={handleConfirm}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isConfirmLoading ? "Applying Import..." : "Confirm Import"}
              </button>
              <p className="text-xs text-slate-500 self-center">
                Confirm will apply creations and updates for this hostel.
              </p>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default RoomImportPage;
