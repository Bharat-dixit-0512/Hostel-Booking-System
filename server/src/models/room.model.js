import mongoose from "mongoose";

import { MAX_ROOM_CAPACITY } from "../constants.js";

const { Schema } = mongoose;

const roomSchema = new Schema(
  {
    hostel_id: {
      type: Number,
      required: true,
      index: true,
    },
    floor: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      index: true,
    },
    room_number: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: MAX_ROOM_CAPACITY,
    },
    available_beds: {
      type: Number,
      required: true,
      min: 0,
    },
    ac_type: {
      type: Boolean,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

roomSchema.index({ hostel_id: 1, room_number: 1 }, { unique: true });
roomSchema.index({ hostel_id: 1, floor: 1 });
roomSchema.index({ hostel_id: 1, available_beds: 1 });

roomSchema.pre("validate", function validateAvailableBeds() {
  if (this.available_beds > this.capacity) {
    this.invalidate("available_beds", "available_beds cannot exceed capacity");
  }
});

const registerRoomModel = (connection) =>
  connection.models.Room || connection.model("Room", roomSchema, "rooms");

export default registerRoomModel;
