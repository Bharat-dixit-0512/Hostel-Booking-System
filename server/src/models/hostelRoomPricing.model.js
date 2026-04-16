import mongoose from "mongoose";

import { MAX_ROOM_CAPACITY } from "../constants.js";

const { Schema } = mongoose;

const hostelRoomPricingSchema = new Schema(
  {
    hostel_id: {
      type: Number,
      required: true,
      index: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: MAX_ROOM_CAPACITY,
    },
    ac_type: {
      type: Boolean,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

hostelRoomPricingSchema.index(
  {
    hostel_id: 1,
    capacity: 1,
    ac_type: 1,
  },
  {
    unique: true,
  },
);

const registerHostelRoomPricingModel = (connection) =>
  connection.models.HostelRoomPricing ||
  connection.model(
    "HostelRoomPricing",
    hostelRoomPricingSchema,
    "hostel_room_pricing",
  );

export default registerHostelRoomPricingModel;
