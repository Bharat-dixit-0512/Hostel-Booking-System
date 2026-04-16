import mongoose from "mongoose";

import { AUTH_DB_NAME, HOSTEL_DB_NAME } from "../constants.js";
import registerAuthAdminModel from "../models/authAdmin.model.js";
import registerAuthStudentModel from "../models/authStudent.model.js";
import registerBookingModel from "../models/booking.model.js";
import registerBookingWindowModel from "../models/bookingWindow.model.js";
import registerCounterModel from "../models/counter.model.js";
import registerHostelAllowedYearModel from "../models/hostelAllowedYear.model.js";
import registerHostelModel from "../models/hostel.model.js";
import registerHostelRoomPricingModel from "../models/hostelRoomPricing.model.js";
import registerHostelStudentModel from "../models/hostelStudent.model.js";
import registerRoomModel from "../models/room.model.js";

let authConnection = null;
let hostelConnection = null;
let registeredModels = null;

const getMongoUri = () => {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  return mongoUri;
};

const createNamedConnection = async (dbName) => {
  const connection = mongoose.createConnection(getMongoUri(), {
    dbName,
    autoIndex: true,
  });

  await connection.asPromise();
  console.log(`MongoDB connected: ${connection.host}/${connection.name}`);

  return connection;
};

const registerModels = () => {
  registeredModels = {
    authAdmin: registerAuthAdminModel(authConnection),
    authStudent: registerAuthStudentModel(authConnection),
    booking: registerBookingModel(hostelConnection),
    bookingWindow: registerBookingWindowModel(hostelConnection),
    counter: registerCounterModel(hostelConnection),
    hostel: registerHostelModel(hostelConnection),
    hostelAllowedYear: registerHostelAllowedYearModel(hostelConnection),
    hostelRoomPricing: registerHostelRoomPricingModel(hostelConnection),
    hostelStudent: registerHostelStudentModel(hostelConnection),
    room: registerRoomModel(hostelConnection),
  };
};

const ensureModelsReady = () => {
  if (!registeredModels) {
    throw new Error("Database connections are not initialized");
  }
};

export const connectDatabases = async () => {
  if (authConnection && hostelConnection && registeredModels) {
    return {
      authConnection,
      hostelConnection,
      models: registeredModels,
    };
  }

  authConnection = await createNamedConnection(AUTH_DB_NAME);
  hostelConnection = await createNamedConnection(HOSTEL_DB_NAME);
  registerModels();

  return {
    authConnection,
    hostelConnection,
    models: registeredModels,
  };
};

export const getAuthConnection = () => authConnection;
export const getHostelConnection = () => hostelConnection;

export const startHostelSession = () => {
  if (!hostelConnection) {
    throw new Error("Hostel database connection is not initialized");
  }

  return hostelConnection.startSession();
};

export const getAuthAdminModel = () => {
  ensureModelsReady();
  return registeredModels.authAdmin;
};

export const getAuthStudentModel = () => {
  ensureModelsReady();
  return registeredModels.authStudent;
};

export const getBookingModel = () => {
  ensureModelsReady();
  return registeredModels.booking;
};

export const getBookingWindowModel = () => {
  ensureModelsReady();
  return registeredModels.bookingWindow;
};

export const getCounterModel = () => {
  ensureModelsReady();
  return registeredModels.counter;
};

export const getHostelModel = () => {
  ensureModelsReady();
  return registeredModels.hostel;
};

export const getHostelAllowedYearModel = () => {
  ensureModelsReady();
  return registeredModels.hostelAllowedYear;
};

export const getHostelRoomPricingModel = () => {
  ensureModelsReady();
  return registeredModels.hostelRoomPricing;
};

export const getHostelStudentModel = () => {
  ensureModelsReady();
  return registeredModels.hostelStudent;
};

export const getRoomModel = () => {
  ensureModelsReady();
  return registeredModels.room;
};

export default connectDatabases;
