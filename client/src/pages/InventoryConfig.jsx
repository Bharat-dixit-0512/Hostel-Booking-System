import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  FileUp,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  Layers,
  Home,
  X,
  BedDouble,
  Search,
  Snowflake,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import AdminNavbar from "../components/AdminNavbar";
import { useAuth } from "../hooks/useAuth";
import axiosInstance from "../lib/axios";
import { getErrorMessage } from "../lib/errors";

const STUDENT_YEARS = ["1st", "2nd", "3rd", "4th"];
const PRICING_CATEGORIES = [
  { capacity: 1, ac_type: true, label: "1 Bed AC" },
  { capacity: 1, ac_type: false, label: "1 Bed Non-AC" },
  { capacity: 2, ac_type: true, label: "2 Bed AC" },
  { capacity: 2, ac_type: false, label: "2 Bed Non-AC" },
  { capacity: 3, ac_type: true, label: "3 Bed AC" },
  { capacity: 3, ac_type: false, label: "3 Bed Non-AC" },
];

const getNormalizedPricing = (pricingRows = []) =>
  PRICING_CATEGORIES.map((category) => {
    const existingPricing = pricingRows.find(
      (row) =>
        Number(row.capacity) === category.capacity &&
        Boolean(row.ac_type) === category.ac_type,
    );

    return {
      ...category,
      price: Number(existingPricing?.price ?? 0),
    };
  });

const clonePricingRows = (pricingRows = []) =>
  getNormalizedPricing(pricingRows).map((row) => ({
    ...row,
    price: Number(row.price ?? 0),
  }));

const getPricingCategoryPrice = (pricingRows = [], capacity, acType) =>
  Number(
    getNormalizedPricing(pricingRows).find(
      (row) =>
        Number(row.capacity) === Number(capacity) &&
        Boolean(row.ac_type) === Boolean(acType),
    )?.price ?? 0,
  );

const isPricingCategoryChanged = (
  pricingRows = [],
  savedPricingRows = [],
  category,
) =>
  getPricingCategoryPrice(pricingRows, category.capacity, category.ac_type) !==
  getPricingCategoryPrice(savedPricingRows, category.capacity, category.ac_type);

const getPricingChangeCount = (pricingRows = [], savedPricingRows = []) =>
  PRICING_CATEGORIES.filter((category) =>
    isPricingCategoryChanged(pricingRows, savedPricingRows, category),
  ).length;

const confirmInventoryAction = ({
  title,
  description,
  confirmLabel,
  variant = "danger",
  icon: Icon = AlertTriangle,
}) =>
  new Promise((resolve) => {
    let isSettled = false;
    const variantStyles =
      variant === "success"
        ? {
            border: "border-emerald-500/20",
            iconWrapper: "bg-emerald-500/10",
            iconColor: "text-emerald-400",
            confirmButton: "bg-emerald-500 hover:bg-emerald-600",
          }
        : {
            border: "border-red-500/20",
            iconWrapper: "bg-red-500/10",
            iconColor: "text-red-400",
            confirmButton: "bg-red-500 hover:bg-red-600",
          };

    const settle = (value, toastId) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      toast.dismiss(toastId);
      resolve(value);
    };

    toast.custom(
      (toastInstance) => (
        <div
          className={`pointer-events-auto w-full max-w-md rounded-[32px] border bg-[#15202b] p-6 shadow-2xl ${variantStyles.border}`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`rounded-2xl p-3 ${variantStyles.iconWrapper} ${variantStyles.iconColor}`}
            >
              <Icon size={22} />
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {description}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => settle(false, toastInstance.id)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-300 transition-all hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => settle(true, toastInstance.id)}
                  className={`flex-1 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all cursor-pointer ${variantStyles.confirmButton}`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => settle(false, toastInstance.id)}
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
              aria-label="Close confirmation"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      },
    );
  });

const RoomCard = ({ canManage, onDelete, onEdit, room }) => (
  <div className="bg-black/20 border border-white/5 p-5 rounded-3xl group relative hover:border-emerald-500/30 transition-all">
    <div className="flex justify-between items-start mb-4">
      <span
        className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
          room.ac_type
            ? "bg-blue-500/20 text-blue-400"
            : "bg-orange-500/20 text-orange-400"
        }`}
      >
        {room.ac_type ? "AC" : "Non-AC"}
      </span>
      {canManage ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(room)}
            className="text-slate-600 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(room)}
            className="text-slate-600 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : null}
    </div>
    <h5 className="text-xl font-bold text-white mb-1">
      Room {room.room_number}
    </h5>
    <div className="space-y-2 text-xs text-slate-400 font-bold">
      <div className="flex items-center gap-2">
        <Layers size={14} className="text-indigo-400" />
        Floor {room.floor ?? 0}
      </div>
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("hostel");
  const [activeHostel, setActiveHostel] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [expandedHostelId, setExpandedHostelId] = useState(null);
  const [pricingSavingHostelId, setPricingSavingHostelId] = useState(null);
  const [formData, setFormData] = useState({
    hostel_name: "",
    gender: "male",
    floors: 1,
    allowed_years: ["1st"],
    room_number: "",
    floor: 0,
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
            })),
        ),
      );
      const roomsByHostelId = new Map(
        roomsResponses.map((entry) => [entry.hostel_id, entry.rooms]),
      );

      setHostels(
        fetchedHostels.map((hostel) => {
          const normalizedPricing = clonePricingRows(hostel.pricing || []);

          return {
            ...hostel,
            rooms: roomsByHostelId.get(hostel.hostel_id) || [],
            pricing: normalizedPricing,
            savedPricing: clonePricingRows(normalizedPricing),
          };
        }),
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
    setActiveRoom(null);
    setFormData({
      hostel_name: "",
      gender: "male",
      floors: 1,
      allowed_years: ["1st"],
      room_number: "",
      floor: 0,
      capacity: 1,
      ac_type: false,
    });
  };

  const openModal = (type, hostel = null, room = null) => {
    if (!canManage) {
      return;
    }

    setModalType(type);
    setActiveHostel(hostel);
    setActiveRoom(room);

    if (type === "hostel-edit" && hostel) {
      setFormData((currentValue) => ({
        ...currentValue,
        hostel_name: hostel.hostel_name || "",
        gender: hostel.gender || "male",
        floors: hostel.floors ?? 1,
        allowed_years: hostel.allowed_years || ["1st"],
      }));
    } else if (type === "room-edit" && room) {
      setFormData((currentValue) => ({
        ...currentValue,
        room_number: room.room_number || "",
        floor: room.floor ?? 0,
        capacity: room.capacity || 1,
        ac_type: Boolean(room.ac_type),
      }));
    }

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

    if (
      !Number.isInteger(Number(formData.floors)) ||
      Number(formData.floors) < 1
    ) {
      toast.error("Enter valid number of floors");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Creating hostel...");

    try {
      await axiosInstance.post("/admin/hostels", {
        hostel_name: formData.hostel_name.trim(),
        gender: formData.gender,
        floors: Number(formData.floors),
        allowed_years: formData.allowed_years,
      });
      toast.success("Hostel created successfully", { id: toastId });
      closeModal();
      await loadInventory();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create hostel"), {
        id: toastId,
      });
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

    if (
      !Number.isInteger(Number(formData.floor)) ||
      Number(formData.floor) < 0
    ) {
      toast.error("Enter valid room floor");
      return;
    }

    if (Number(formData.floor) >= Number(activeHostel.floors ?? 1)) {
      toast.error(
        `Room floor must be between 0 and ${(activeHostel.floors ?? 1) - 1}`,
      );
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Creating room...");

    try {
      await axiosInstance.post(
        `/admin/hostels/${activeHostel.hostel_id}/rooms`,
        {
          room_number: formData.room_number.trim(),
          floor: Number(formData.floor),
          capacity: Number(formData.capacity),
          ac_type: Boolean(formData.ac_type),
        },
      );
      toast.success(`Room ${formData.room_number} added`, { id: toastId });
      closeModal();
      await loadInventory();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create room"), {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateHostel = async () => {
    if (!activeHostel) {
      return;
    }

    if (!formData.hostel_name.trim()) {
      toast.error("Enter hostel name");
      return;
    }

    if (formData.allowed_years.length === 0) {
      toast.error("Select at least one allowed year");
      return;
    }

    if (
      !Number.isInteger(Number(formData.floors)) ||
      Number(formData.floors) < 1
    ) {
      toast.error("Enter valid number of floors");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Updating hostel...");

    try {
      await Promise.all([
        axiosInstance.put(`/admin/hostels/${activeHostel.hostel_id}`, {
          hostel_name: formData.hostel_name.trim(),
          gender: formData.gender,
          floors: Number(formData.floors),
        }),
        axiosInstance.put(
          `/admin/hostels/${activeHostel.hostel_id}/allowed-years`,
          {
            allowed_years: formData.allowed_years,
          },
        ),
      ]);
      toast.success(`${formData.hostel_name.trim()} updated`, { id: toastId });
      closeModal();
      await loadInventory();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update hostel"), {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!activeHostel || !activeRoom) {
      return;
    }

    if (
      !Number.isInteger(Number(formData.floor)) ||
      Number(formData.floor) < 0
    ) {
      toast.error("Enter valid room floor");
      return;
    }

    if (Number(formData.floor) >= Number(activeHostel.floors ?? 1)) {
      toast.error(
        `Room floor must be between 0 and ${(activeHostel.floors ?? 1) - 1}`,
      );
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Updating room...");

    try {
      await axiosInstance.put(
        `/admin/hostels/${activeHostel.hostel_id}/rooms/${encodeURIComponent(activeRoom.room_number)}`,
        {
          floor: Number(formData.floor),
          capacity: Number(formData.capacity),
          ac_type: Boolean(formData.ac_type),
        },
      );
      toast.success(`Room ${activeRoom.room_number} updated`, { id: toastId });
      closeModal();
      await loadInventory();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update room"), {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHostel = async (hostel) => {
    if (!canManage) {
      return;
    }

    const confirmed = await confirmInventoryAction({
      title: "Delete Hostel",
      description: `Delete ${hostel.hostel_name} and its inventory? This will fail if any room still has booked capacity.`,
      confirmLabel: "Delete Hostel",
    });

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading("Deleting hostel...");

    try {
      await axiosInstance.delete(`/admin/hostels/${hostel.hostel_id}`);
      toast.success(`${hostel.hostel_name} deleted`, { id: toastId });
      await loadInventory();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete hostel"), {
        id: toastId,
      });
    }
  };

  const handleDeleteRoom = async (hostel, room) => {
    if (!canManage) {
      return;
    }

    const confirmed = await confirmInventoryAction({
      title: "Delete Room",
      description: `Delete room ${room.room_number} from ${hostel.hostel_name}? This will fail if the room still has booked capacity.`,
      confirmLabel: "Delete Room",
    });

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading("Deleting room...");

    try {
      await axiosInstance.delete(
        `/admin/hostels/${hostel.hostel_id}/rooms/${encodeURIComponent(room.room_number)}`,
      );
      toast.success(`Room ${room.room_number} deleted`, { id: toastId });
      await loadInventory();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete room"), {
        id: toastId,
      });
    }
  };

  const handlePricingInputChange = (hostelId, capacity, acType, priceValue) => {
    setHostels((currentHostels) =>
      currentHostels.map((hostel) => {
        if (hostel.hostel_id !== hostelId) {
          return hostel;
        }

        return {
          ...hostel,
          pricing: (hostel.pricing || []).map((row) =>
            row.capacity === capacity && row.ac_type === acType
              ? {
                  ...row,
                  price: priceValue,
                }
              : row,
          ),
        };
      }),
    );
  };

  const handleSaveHostelPricing = async (hostel) => {
    if (!canManage) {
      return;
    }

    const normalizedPricing = getNormalizedPricing(hostel.pricing || []);
    const pricingChangeCount = getPricingChangeCount(
      normalizedPricing,
      hostel.savedPricing || [],
    );
    const hasInvalidPrice = normalizedPricing.some(
      (row) => Number(row.price) < 0 || Number.isNaN(Number(row.price)),
    );

    if (hasInvalidPrice) {
      toast.error("All prices must be non-negative numbers");
      return;
    }

    if (pricingChangeCount === 0) {
      toast.error("No pricing changes to save");
      return;
    }

    const confirmed = await confirmInventoryAction({
      title: "Confirm Pricing Update",
      description: `${pricingChangeCount} pricing ${
        pricingChangeCount === 1 ? "category has" : "categories have"
      } been changed for ${hostel.hostel_name}. Do you want to save these updates now?`,
      confirmLabel: "Save Pricing",
      variant: "success",
      icon: Settings2,
    });

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading("Saving pricing...");
    setPricingSavingHostelId(hostel.hostel_id);

    try {
      const response = await axiosInstance.put(
        `/admin/hostels/${hostel.hostel_id}/pricing`,
        {
          pricing: normalizedPricing.map((row) => ({
            capacity: row.capacity,
            ac_type: row.ac_type,
            price: Number(row.price),
          })),
        },
      );

      const updatedPricing = getNormalizedPricing(
        response.data?.data?.pricing || normalizedPricing,
      );

      setHostels((currentHostels) =>
        currentHostels.map((entry) =>
          entry.hostel_id === hostel.hostel_id
            ? {
                ...entry,
                pricing: updatedPricing,
                savedPricing: clonePricingRows(updatedPricing),
              }
            : entry,
        ),
      );
      toast.success("Pricing updated", { id: toastId });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update pricing"), {
        id: toastId,
      });
    } finally {
      setPricingSavingHostelId(null);
    }
  };

  const filteredHostels = hostels.filter((hostel) =>
    `${hostel.hostel_name} ${hostel.gender}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const toggleHostelExpansion = (hostelId) => {
    setExpandedHostelId((currentValue) =>
      currentValue === hostelId ? null : hostelId,
    );
  };

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
              onClick={() => navigate("/admin/room-import")}
              className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all border border-white/10 cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FileUp size={16} /> Upload Rooms
            </button>

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
            Inventory write actions are restricted to the main admin. You can
            still inspect live hostel and room data.
          </div>
        ) : null}

        <div className="space-y-10">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400">
              Loading hostel inventory...
            </div>
          ) : filteredHostels.length > 0 ? (
            filteredHostels.map((hostel) => {
              const isExpanded = expandedHostelId === hostel.hostel_id;
              const pricingChangeCount = getPricingChangeCount(
                hostel.pricing || [],
                hostel.savedPricing || [],
              );

              return (
                <section
                  key={hostel.hostel_id}
                  className="bg-[#15202b]/40 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-xl"
                >
                  <div className="p-8 border-b border-white/5 bg-white/2 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                    <button
                      type="button"
                      onClick={() => toggleHostelExpansion(hostel.hostel_id)}
                      className="text-left flex items-center gap-5 cursor-pointer group"
                    >
                      <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
                        <Home size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white inline-flex items-center gap-3">
                          {hostel.hostel_name}
                          <ChevronDown
                            size={18}
                            className={`text-slate-400 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </h2>
                        <div className="flex gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex-wrap">
                          <span className="bg-white/5 px-2 py-1 rounded">
                            {hostel.gender}
                          </span>
                          <span className="bg-white/5 px-2 py-1 rounded">
                            {hostel.total_rooms} Total Rooms
                          </span>
                          <span className="bg-white/5 px-2 py-1 rounded">
                            {hostel.floors ?? 1} Floors
                          </span>
                          <span className="bg-white/5 px-2 py-1 rounded">
                            {hostel.available_beds} Beds Free
                          </span>
                          <span className="bg-white/5 px-2 py-1 rounded">
                            Years: {(hostel.allowed_years || []).join(", ")}
                          </span>
                          <span className="bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded">
                            {isExpanded ? "Hide Rooms" : "Show Rooms"}
                          </span>
                        </div>
                      </div>
                    </button>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={!canManage}
                        onClick={() => openModal("hostel-edit", hostel)}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold border border-white/10 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Edit Hostel
                      </button>
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

                  {isExpanded ? (
                    <div className="p-8 space-y-8">
                      <div className="bg-black/20 border border-white/5 rounded-3xl p-6 space-y-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                              Room Category Pricing
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                              Set fee for each room category (
                              {hostel.hostel_name}).
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={
                              !canManage ||
                              pricingSavingHostelId === hostel.hostel_id ||
                              pricingChangeCount === 0
                            }
                            onClick={() => handleSaveHostelPricing(hostel)}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {pricingSavingHostelId === hostel.hostel_id
                              ? "Saving..."
                              : pricingChangeCount > 0
                                ? `Save ${pricingChangeCount} Change${
                                    pricingChangeCount > 1 ? "s" : ""
                                  }`
                                : "Save Pricing"}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {getNormalizedPricing(hostel.pricing || []).map(
                            (category) => {
                              const isChanged = isPricingCategoryChanged(
                                hostel.pricing || [],
                                hostel.savedPricing || [],
                                category,
                              );
                              const originalPrice = getPricingCategoryPrice(
                                hostel.savedPricing || [],
                                category.capacity,
                                category.ac_type,
                              );

                              return (
                                <div
                                  key={`${category.capacity}_${category.ac_type}`}
                                  className={`rounded-2xl border p-4 space-y-2 transition-all ${
                                    isChanged
                                      ? "border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.08)]"
                                      : "border-white/10 bg-black/30"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="text-xs font-bold text-white">
                                      {category.label}
                                    </p>
                                    {isChanged ? (
                                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300">
                                        Changed
                                      </span>
                                    ) : null}
                                  </div>
                                  <div
                                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                                      isChanged
                                        ? "border-emerald-400/30 bg-emerald-500/5"
                                        : "border-white/10 bg-black/40"
                                    }`}
                                  >
                                    <span
                                      className={`text-xs font-bold ${
                                        isChanged
                                          ? "text-emerald-300"
                                          : "text-slate-400"
                                      }`}
                                    >
                                      Rs.
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      disabled={!canManage}
                                      value={category.price}
                                      onChange={(event) =>
                                        handlePricingInputChange(
                                          hostel.hostel_id,
                                          category.capacity,
                                          category.ac_type,
                                          event.target.value,
                                        )
                                      }
                                      className="w-full bg-transparent text-sm text-white focus:outline-none disabled:text-slate-500"
                                    />
                                  </div>
                                  {isChanged ? (
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                                      Previous: Rs.{" "}
                                      {Number(originalPrice).toLocaleString(
                                        "en-IN",
                                      )}
                                    </p>
                                  ) : null}
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>

                      {hostel.rooms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {hostel.rooms.map((room) => (
                            <RoomCard
                              key={room._id || room.room_number}
                              canManage={canManage}
                              onEdit={(roomToEdit) =>
                                openModal("room-edit", hostel, roomToEdit)
                              }
                              onDelete={(roomToDelete) =>
                                handleDeleteRoom(hostel, roomToDelete)
                              }
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
                  ) : null}
                </section>
              );
            })
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-[40px]">
              <p className="text-slate-500 text-sm font-medium">
                No hostels match your search.
              </p>
            </div>
          )}
        </div>
      </main>

      {isModalOpen ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-[#15202b] border border-white/10 w-full max-w-md rounded-[40px] shadow-2xl p-10 space-y-6 text-left">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-white">
                {modalType === "hostel"
                  ? "Add Hostel"
                  : modalType === "hostel-edit"
                    ? `Edit ${activeHostel?.hostel_name}`
                    : modalType === "room-edit"
                      ? `Edit Room ${activeRoom?.room_number}`
                      : `Add Room to ${activeHostel?.hostel_name}`}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              {modalType === "hostel" || modalType === "hostel-edit" ? (
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
                      Number of Floors
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500"
                      value={formData.floors}
                      onChange={(event) =>
                        setFormData((currentValue) => ({
                          ...currentValue,
                          floors: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                      Allowed Years
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {STUDENT_YEARS.map((year) => {
                        const isSelected =
                          formData.allowed_years.includes(year);

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
                      readOnly={modalType === "room-edit"}
                      onChange={(event) =>
                        setFormData((currentValue) => ({
                          ...currentValue,
                          room_number: event.target.value,
                        }))
                      }
                    />
                    {modalType === "room-edit" ? (
                      <p className="text-[10px] text-slate-500">
                        Room number cannot be changed.
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                        Floor
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={Math.max((activeHostel?.floors ?? 1) - 1, 0)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500"
                        value={formData.floor}
                        onChange={(event) =>
                          setFormData((currentValue) => ({
                            ...currentValue,
                            floor: event.target.value,
                          }))
                        }
                      />
                    </div>
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
                onClick={
                  modalType === "hostel"
                    ? handleSaveHostel
                    : modalType === "hostel-edit"
                      ? handleUpdateHostel
                      : modalType === "room-edit"
                        ? handleUpdateRoom
                        : handleSaveRoom
                }
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-xs font-black text-white transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : modalType === "hostel" || modalType === "room"
                    ? "Save Inventory"
                    : "Update Inventory"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default InventoryConfigPage;
