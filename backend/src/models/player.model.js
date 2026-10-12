import mongoose from "mongoose";
import { PLAYER_PHASES } from "../config/playerPhases.js";

export const PLAYING_ROLES = ["Batsman", "Bowler", "All-rounder", "Wicketkeeper"];

export const T_SHIRT_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];

export const MEMBERSHIP_TYPES = ["Tabler", "41er"];

export const BATTING_STYLES = ["Right-handed", "Left-handed"];

export const BOWLING_STYLES = ["Pace", "Spin", "Does not bowl"];

/** RTPL 7.0's sides, plus "Uncapped" for anyone who did not play last season. */
export const LAST_YEAR_TEAMS = [
  "Eastern Legends",
  "Gully Boys",
  "Master Blasters",
  "Super Warrior",
  "Toofani Panther",
  "Uncapped",
];

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

    city: {
      type: String,
      required: [true, "A city is required."],
      trim: true,
      maxlength: [80, "Please keep this under 80 characters."],
    },

    lastYearTeam: {
      type: String,
      required: [true, "Please select last year's team, or Uncapped."],
      enum: {
        values: LAST_YEAR_TEAMS,
        message: "Please select a valid team from last season.",
      },
    },

    membershipType: {
      type: String,
      required: [true, "Please select Tabler or 41er."],
      enum: {
        values: MEMBERSHIP_TYPES,
        message: "Please select a valid membership type.",
      },
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

    battingStyle: {
      type: String,
      required: [true, "Please select a type of batsman."],
      enum: {
        values: BATTING_STYLES,
        message: "Please select a valid type of batsman.",
      },
    },

    bowlingStyle: {
      type: String,
      required: [true, "Please select a type of bowler."],
      enum: {
        values: BOWLING_STYLES,
        message: "Please select a valid type of bowler.",
      },
    },

    /** Set by the server from entry order, never by the form. */
    phase: {
      type: String,
      required: true,
      enum: PLAYER_PHASES.map((phase) => phase.key),
    },

    fee: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "waitlisted", "rejected"],
      default: "pending",
    },

    /** Cloudinary asset for the screenshot the player uploaded with the entry. */
    paymentScreenshot: {
      publicId: { type: String },
      format: { type: String },
    },

    /** Recorded by an admin when they confirm the payment by hand. */
    utr: {
      type: String,
      trim: true,
    },

    paymentConfirmedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Player", playerSchema);
