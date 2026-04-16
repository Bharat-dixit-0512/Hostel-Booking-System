import { MAX_ROOM_CAPACITY } from "../constants.js";
import { getHostelRoomPricingModel } from "../db/index.js";

const withSession = (query, session) =>
  session ? query.session(session) : query;

export const getPricingCategoryKey = ({ capacity, acType }) =>
  `${capacity}bed_${acType ? "ac" : "non_ac"}`;

export const getDefaultPricingRows = (hostelId) => {
  const rows = [];

  for (let capacity = 1; capacity <= MAX_ROOM_CAPACITY; capacity += 1) {
    rows.push({
      hostel_id: hostelId,
      capacity,
      ac_type: true,
      price: 0,
    });
    rows.push({
      hostel_id: hostelId,
      capacity,
      ac_type: false,
      price: 0,
    });
  }

  return rows;
};

export const ensureHostelPricingRows = async (hostelId, session = null) => {
  const HostelRoomPricing = getHostelRoomPricingModel();
  const defaultRows = getDefaultPricingRows(hostelId);

  await HostelRoomPricing.bulkWrite(
    defaultRows.map((row) => ({
      updateOne: {
        filter: {
          hostel_id: row.hostel_id,
          capacity: row.capacity,
          ac_type: row.ac_type,
        },
        update: {
          $setOnInsert: row,
        },
        upsert: true,
      },
    })),
    session ? { session } : undefined,
  );
};

export const getNormalizedHostelPricing = async (hostelId, session = null) => {
  await ensureHostelPricingRows(hostelId, session);

  const HostelRoomPricing = getHostelRoomPricingModel();
  const pricingRows = await withSession(
    HostelRoomPricing.find({ hostel_id: hostelId })
      .sort({ capacity: 1, ac_type: -1 })
      .lean(),
    session,
  );

  return pricingRows.map((row) => ({
    capacity: row.capacity,
    ac_type: row.ac_type,
    price: row.price,
    category: getPricingCategoryKey({
      capacity: row.capacity,
      acType: row.ac_type,
    }),
  }));
};

export const getHostelPricingValueMap = async (hostelId, session = null) => {
  const pricingRows = await getNormalizedHostelPricing(hostelId, session);

  return new Map(
    pricingRows.map((row) => [
      getPricingCategoryKey({
        capacity: row.capacity,
        acType: row.ac_type,
      }),
      row.price,
    ]),
  );
};
