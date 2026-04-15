import mongoose from "mongoose";

const { Schema } = mongoose;

const counterSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        sequence_value: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        versionKey: false,
    }
);

const registerCounterModel = (connection) =>
    connection.models.Counter || connection.model("Counter", counterSchema, "counters");

export default registerCounterModel;
