import mongoose from "mongoose";

/**
 * A named running total. `players` holds how many player places have been
 * handed out; it only moves through single atomic updates, which is what
 * makes the entry cap exact.
 */
const counterSchema = new mongoose.Schema(
  {
    _id: { type: String },
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false }
);

export default mongoose.model("Counter", counterSchema);
