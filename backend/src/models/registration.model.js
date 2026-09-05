import mongoose from "mongoose";

const YES_NO = ["Yes", "No"];
const YES_NO_MAYBE = ["Yes", "No", "Maybe"];

const registrationSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
    },

    owners: {
      type: String,
      required: [true, "Please list the owners and their table numbers."],
      trim: true,
      minlength: [2, "Please list the owners and their table numbers."],
      maxlength: [400, "Please keep this under 400 characters."],
    },

    ownersMobile: {
      type: String,
      required: [true, "A contact mobile number is required."],
      trim: true,
      minlength: [6, "A contact mobile number is required."],
      maxlength: [120, "Please keep this under 120 characters."],
      match: [/^[\d\s+(),/-]+$/, "Use digits, spaces and + ( ) , / - only."],
    },

    playerOwner: {
      type: String,
      required: [
        true,
        "Please name the owner who will also register as a player.",
      ],
      trim: true,
      minlength: [
        2,
        "Please name the owner who will also register as a player.",
      ],
      maxlength: [200, "Please keep this under 200 characters."],
    },

    teamName: {
      type: String,
      required: [true, "A proposed team name is required."],
      trim: true,
      minlength: [2, "A proposed team name is required."],
      maxlength: [80, "Please keep the team name under 80 characters."],
    },

    financialCommitment: {
      type: String,
      required: [true, "Please answer the financial commitment question."],
      enum: {
        values: YES_NO,
        message: "Please answer the financial commitment question.",
      },
    },

    mentor: {
      type: String,
      required: [true, "Please answer the mentor question."],
      enum: {
        values: YES_NO,
        message: "Please answer the mentor question.",
      },
    },

    auctionAvailability: {
      type: String,
      required: [true, "Please share your availability for the auction."],
      enum: {
        values: YES_NO_MAYBE,
        message: "Please share your availability for the auction.",
      },
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "waitlisted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

registrationSchema.index(
  { teamName: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export default mongoose.model("Registration", registrationSchema);
