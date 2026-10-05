import mongoose from "mongoose";

/**
 * The five chapter sides a player can register under. Mirrored by hand in
 * frontend/lib/teams.ts (derived there from the logo filenames in
 * frontend/public/teams) — same duplication the YES_NO enums below already
 * use between this file and frontend/lib/registration.ts. Keep the two lists
 * in step if a side is ever renamed.
 */
export const TEAMS = [
  "Eastern Legends",
  "Gully Boys",
  "Master Blasters",
  "Super Warrior",
  "Toofani Panther",
];

export const PLAYING_ROLES = ["Batsman", "Bowler", "All-rounder", "Wicketkeeper"];

export const T_SHIRT_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];

const playerSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: [true, "Please enter the player's full name."],
      trim: true,
      minlength: [2, "Please enter the player's full name."],
      maxlength: [120, "Please keep this under 120 characters."],
    },

    mobile: {
      type: String,
      required: [true, "A contact mobile number is required."],
      trim: true,
      minlength: [6, "A contact mobile number is required."],
      maxlength: [20, "Please keep this under 20 characters."],
      match: [/^[\d\s+(),/-]+$/, "Use digits, spaces and + ( ) , / - only."],
    },

    email: {
      type: String,
      required: [true, "An email address is required."],
      trim: true,
      lowercase: true,
      maxlength: [160, "Please keep this under 160 characters."],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."],
    },

    dateOfBirth: {
      type: Date,
      required: [true, "A date of birth is required."],
    },

    team: {
      type: String,
      required: [true, "Please select a team."],
      enum: { values: TEAMS, message: "Please select a valid team." },
    },

    playingRole: {
      type: String,
      required: [true, "Please select a playing role."],
      enum: {
        values: PLAYING_ROLES,
        message: "Please select a valid playing role.",
      },
    },

    tShirtSize: {
      type: String,
      required: [true, "Please select a T-shirt size."],
      enum: {
        values: T_SHIRT_SIZES,
        message: "Please select a valid T-shirt size.",
      },
    },

    /** Round Table table number, where the player is also a member. Not
     *  every player will have one, so this is the one optional field. */
    tableNumber: {
      type: String,
      trim: true,
      maxlength: [40, "Please keep this under 40 characters."],
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "waitlisted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Player", playerSchema);
