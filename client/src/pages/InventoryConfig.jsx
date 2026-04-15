import React, { useEffect, useState } from "react";
import {
  Plus,
  Settings2,
  Trash2,
  Home,
  X,
  BedDouble,
  Search,
  Snowflake,
} from "lucide-react";
import toast from "react-hot-toast";

import AdminNavbar from "../components/AdminNavbar";
import { useAuth } from "../hooks/useAuth";
import axiosInstance from "../lib/axios";
import { getErrorMessage } from "../lib/errors";

const STUDENT_YEARS = ["1st", "2nd", "3rd", "4th"];

const RoomCard = ({ canManage, onDelete, room }) => (
  <div className="bg-black/20 border border-white/5 p-5 rounded-3xl group relative hover:border-emerald-500/30 transition-all">
    <div className="flex justify-between items-start mb-4">
      <span
        className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
          room.ac_type ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"
        }`}
      >
        {room.ac_type ? "AC" : "Non-AC"}
      </span>
      {canManage ? (
        <button
          type="button"
          onClick={() => onDelete(room)}
          className="text-slate-600 hover:text-red-500 transition-colors cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      ) : null}
    </div>
    <h5 className="text-xl font-bold text-white mb-1">Room {room.room_number}</h5>
    <div className="space-y-2 text-xs text-slate-400 font-bold">
      <div className="flex items-center gap-2">
        <BedDouble size={14} className="text-emerald-400" />
        Capacity {room.capacity} / Available {room.available_beds}
      </div>
      {room.ac_type ? (
        <div className="flex items-center gap-2">
          <Snowflake size={14} className="text-blue-400" />
          Air-conditioned room
        </div>
      ) : null}
    </div>
  </div>
);

function InventoryConfigPage() {
  const { user } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("hostel");
  const [activeHostel, setActiveHostel] = useState(null);
  const [formData, setFormData] = useState({
    hostel_name: "",
    gender: "male",
    allowed_years: ["1st"],
    room_number: "",
    capacity: 1,
    ac_type: false,
  });

  const canManage = user?.role === "mainadmin";

  const loadInventory = async () => {
    setIsLoading(true);

    try {
      const hostelsResponse = await axiosInstance.get("/admin/hostels");
      const fetchedHostels = hostelsResponse.data?.data?.hostels || [];
      const roomsResponses = await Promise.all(
        fetchedHostels.map((hostel) =>
          axiosInstance
            .get(`/admin/hostels/${hostel.hostel_id}/rooms`)
            .then((response) => ({
              hostel_id: hostel.hostel_id,
              rooms: response.data?.data?.rooms || [],
            }))
        )
      );
      const roomsByHostelId = new Map(
        roomsResponses.map((entry) => [entry.hostel_id, entry.rooms])
      );

      setHostels(
        fetchedHostels.map((hostel) => ({
          ...hostel,
          rooms: roomsByHostelId.get(hostel.hostel_id) || [],
        }))
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load inventory"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveHostel(null);
    setFormData({
      hostel_name: "",
      gender: "male",
      allowed_years: ["1st"],
      room_number: "",
      capacity: 1,
      ac_type: false,
    });
  };

  const openModal = (type, hostel = null) => {
    if (!canManage) {
      return;
    }

    setModalType(type);
    setActiveHostel(hostel);
    setIsModalOpen(true);
  };

  const handleAllowedYearToggle = (year) => {
    setFormData((currentValue) => ({
      ...currentValue,
      allowed_years: currentValue.allowed_years.includes(year)
        ? currentValue.allowed_years.filter((item) => item !== year)
        : [...currentValue.allowed_years, year],
    }));
  };

  const handleSaveHostel = async () => {
    if (!formData.hostel_name.trim()) {
      toast.error("Enter hostel name");
      return;
    }

    if (formData.allowed_years.length === 0) {
      toast.error("Select at least one allowed year");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Creating hostel...");

    try {
      await axiosInstance.post("/admin/hostels", {
        hostel_name: formData.hostel_name.trim(),
        gender: formData.gender,
        allowed_years: formData.allowed_years,
      });
      toast.success("Hostel created successfully", { id: toastId });
      closeModal();
      await loadInventory();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create hostel"), { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRoom = async () => {
    if (!activeHostel) {
      return;
    }

    if (!formData.room_number.trim()) {
      toast.error("Enter room number");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Creating room...");

    try {
      await axiosInstance.post(`/admin/hostels/${activeHostel.hostel_id}/rooms`, {
        room_number: formData.room_number.trim(),
        capacity: Number(formData.capacity),
        ac_type: Boolean(formData.ac_type),
      });
      toast.success(`Room ${formData.room_number} added`, { id: toastId });
      closeModal();
      await loadInventory();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create room"), { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHostel = async (hostel) => {
    if (!canManage) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${hostel.hostel_name} and its inventory? This will fail if any room has booked capacity.`
    );

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading("Deleting hostel...");

    try {
      await axiosInstance.delete(`/admin/hostels/${hostel.hostel_id}`);
      toast.success(`${hostel.hostel_name} deleted`, { id: toastId });
      await loadInventory();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete hostel"), { id: toastId });
    }
  };

  const handleDeleteRoom = async (hostel, room) => {
    if (!canManage) {
      return;
    }

    const confirmed = window.confirm(
      `Delete room ${room.room_number} from ${hostel.hostel_name}? This will fail if the room has booked capacity.`
    );

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading("Deleting room...");

    try {
      await axiosInstance.delete(
        `/admin/hostels/${hostel.hostel_id}/rooms/${encodeURIComponent(room.room_number)}`
      );
      toast.success(`Room ${room.room_number} deleted`, { id: toastId });
      await loadInventory();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete room"), { id: toastId });
    }
  };

  const filteredHostels = hostels.filter((hostel) =>
    `${hostel.hostel_name} ${hostel.gender}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#101922] text-slate-200">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto pt-28 px-6 pb-12 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Settings2 size={16} className="text-emerald-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                System Setup
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Inventory Configuration
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Manage hostels and room inventory using the backend admin API.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search hostels..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <button
              type="button"
              disabled={!canManage}
              onClick={() => openModal("hostel")}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> New Hostel
            </button>
          </div>
        </header>

        {!canManage ? (
          <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 px-6 py-4 text-sm text-orange-200">
            Inventory write actions are restricted to the main admin. You can still inspect live hostel and room data.
          </div>
        ) : null}

        <div className="space-y-10">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400">Loading hostel inventory...</div>
          ) : filteredHostels.length > 0 ? (
            filteredHostels.map((hostel) => (
              <section
                key={hostel.hostel_id}
                className="bg-[#15202b]/40 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-xl"
              >
                <div className="p-8 border-b border-white/5 bg-white/2 flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
                      <Home size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">{hostel.hostel_name}</h2>
                      <div className="flex gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex-wrap">
                        <span className="bg-white/5 px-2 py-1 rounded">
                          {hostel.gender}
                        </span>
                        <span className="bg-white/5 px-2 py-1 rounded">
                          {hostel.total_rooms} Total Rooms
                        </span>
                        <span className="bg-white/5 px-2 py-1 rounded">
                          {hostel.available_beds} Beds Free
                        </span>
                        <span className="bg-white/5 px-2 py-1 rounded">
                          Years: {(hostel.allowed_years || []).join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={!canManage}
                      onClick={() => openModal("room", hostel)}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold border border-white/10 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Add Room
                    </button>
                    <button
                      type="button"
                      disabled={!canManage}
                      onClick={() => handleDeleteHostel(hostel)}
                      className="p-2.5 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {hostel.rooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {hostel.rooms.map((room) => (
                        <RoomCard
                          key={room._id || room.room_number}
                          canManage={canManage}
                          onDelete={(roomToDelete) => handleDeleteRoom(hostel, roomToDelete)}
                          room={room}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center border border-dashed border-white/10 rounded-3xl text-slate-500">
                      No rooms configured yet for this hostel.
                    </div>
                  )}
                </div>
              </section>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-[40px]">
              <p className="text-slate-500 text-sm font-medium">No hostels match your search.</p>
            </div>
          )}
        </div>
      </main>

      {isModalOpen ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-[#15202b] border border-white/10 w-full max-w-md rounded-[40px] shadow-2xl p-10 space-y-6 text-left">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-white">
                {modalType === "hostel" ? "Add Hostel" : `Add Room to ${activeHostel?.hostel_name}`}
              </h2>
              <button type="button" onClick={closeModal} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              {modalType === "hostel" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                      Hostel Name
                    </label>
                    <input
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Kailash Bhavan"
                      value={formData.hostel_name}
                      onChange={(event) =>
                        setFormData((currentValue) => ({
                          ...currentValue,
                          hostel_name: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                      Gender
                    </label>
                    <select
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500"
                      value={formData.gender}
                      onChange={(event) =>
                        setFormData((currentValue) => ({
                          ...currentValue,
                          gender: event.target.value,
                        }))
                      }
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                      Allowed Years
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {STUDENT_YEARS.map((year) => {
                        const isSelected = formData.allowed_years.includes(year);

                        return (
                          <button
                            key={year}
                            type="button"
                            onClick={() => handleAllowedYearToggle(year)}
                            className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-emerald-500 text-white border-emerald-400"
                                : "bg-black/30 text-slate-300 border-white/10"
                            }`}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                      Room Number
                    </label>
                    <input
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. 101"
                      value={formData.room_number}
                      onChange={(event) =>
                        setFormData((currentValue) => ({
                          ...currentValue,
                          room_number: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                        Capacity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="3"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500"
                        value={formData.capacity}
                        onChange={(event) =>
                          setFormData((currentValue) => ({
                            ...currentValue,
                            capacity: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                        AC Type
                      </label>
                      <select
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500"
                        value={formData.ac_type ? "true" : "false"}
                        onChange={(event) =>
                          setFormData((currentValue) => ({
                            ...currentValue,
                            ac_type: event.target.value === "true",
                          }))
                        }
                      >
                        <option value="false">Non-AC</option>
                        <option value="true">AC</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-4 bg-white/5 rounded-2xl text-xs font-black text-slate-400 cursor-pointer transition-all"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={modalType === "hostel" ? handleSaveHostel : handleSaveRoom}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-xs font-black text-white transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Inventory"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default InventoryConfigPage;
