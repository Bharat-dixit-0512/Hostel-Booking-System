import { HOSTEL_COUNTER_KEY } from "../constants.js";
import { getCounterModel, getHostelModel } from "../db/index.js";

export const getNextHostelId = async (session = null) => {
    const Counter = getCounterModel();
    const Hostel = getHostelModel();

    const lastHostelQuery = Hostel.findOne({}, { hostel_id: 1, _id: 0 }).sort({
        hostel_id: -1,
    });

    if (session) {
        lastHostelQuery.session(session);
    }

    const lastHostel = await lastHostelQuery;
    const lastExistingHostelId = lastHostel?.hostel_id ?? 0;
    const nextHostelId = lastExistingHostelId + 1;

    const counter = await Counter.findOneAndUpdate(
        {
            name: HOSTEL_COUNTER_KEY,
        },
        {
            $set: {
                sequence_value: nextHostelId,
            },
        },
        {
            new: true,
            upsert: true,
            ...(session ? { session } : {}),
        }
    );

    return counter.sequence_value;
};
