import Player from "../models/player.model.js";
import { PLAYER_PHASES, phaseForPosition } from "../config/playerPhases.js";
import {
  uploadPaymentScreenshot,
  uploadPlayerPhoto,
  deleteEntryImage,
  entryImageUrl,
} from "../config/cloudinary.js";
import {
  sendEntryReceivedEmail,
  sendPaymentConfirmedEmail,
} from "../services/email.js";

/** UPI UTRs are 12 digits; NEFT/IMPS references run longer and mix letters. */
const UTR_PATTERN = /^[A-Za-z0-9]{6,30}$/;

function makeReference() {
  const season = process.env.LEAGUE_SEASON || 8;
  return `RTPL${season}-P${Math.floor(1000 + Math.random() * 9000)}`;
}

export const createPlayer = async (req, res) => {
  const {
    fullName,
    mobile,
    email,
    dateOfBirth,
    city,
    lastYearTeam,
    membershipType,
    playingRole,
    tShirtSize,
    jerseyNumber,
    battingStyle,
    bowlingStyle,
    availabilityConfirmed,
  } = req.body;

  const entry = {
    fullName,
    mobile,
    email,
    dateOfBirth,
    city,
    lastYearTeam,
    membershipType,
    playingRole,
    tShirtSize,
    jerseyNumber,
    battingStyle,
    bowlingStyle,
    availabilityConfirmed,
  };

  const photoFile = req.files?.playerPhoto?.[0];
  const screenshotFile = req.files?.paymentScreenshot?.[0];

  if (!photoFile) {
    return res.status(400).json({
      error: "No picture",
      message: "Please upload a picture of yourself.",
    });
  }

  if (!screenshotFile) {
    return res.status(400).json({
      error: "No screenshot",
      message: "Please upload a screenshot of your payment.",
    });
  }

  // Check the fields before uploading, so a typo in the form does not leave
  // images behind in Cloudinary. Phase, fee and reference are the server's
  // to set, so placeholders stand in for them here.
  try {
    await new Player({
      ...entry,
      phase: PLAYER_PHASES[0].key,
      fee: 0,
      reference: "pending",
    }).validate();
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: err.message,
        message: Object.values(err.errors)[0].message,
      });
    }

    console.error("[rtpl] could not validate player", err);

    return res.status(500).json({
      error: err.message,
      message: "We could not save your entry just now. Please try again in a moment.",
    });
  }

  // Settled, not Promise.all: if one upload fails, the other still has to
  // finish so it can be cleaned up instead of being left in Cloudinary.
  const [photoUpload, screenshotUpload] = await Promise.allSettled([
    uploadPlayerPhoto(photoFile.buffer),
    uploadPaymentScreenshot(screenshotFile.buffer),
  ]);

  if (photoUpload.status === "rejected") {
    console.error("[rtpl] could not upload player picture", photoUpload.reason);

    if (screenshotUpload.status === "fulfilled") {
      deleteEntryImage(screenshotUpload.value.publicId);
    }

    return res.status(502).json({
      error: photoUpload.reason?.message,
      message: "We could not upload your picture. Please try again in a moment.",
    });
  }

  if (screenshotUpload.status === "rejected") {
    console.error("[rtpl] could not upload payment screenshot", screenshotUpload.reason);

    deleteEntryImage(photoUpload.value.publicId);

    return res.status(502).json({
      error: screenshotUpload.reason?.message,
      message: "We could not upload your payment screenshot. Please try again in a moment.",
    });
  }

  const playerPhoto = photoUpload.value;
  const paymentScreenshot = screenshotUpload.value;

  let saved = false;

  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        // Entries are placed by how many already exist, so the phase and fee
        // follow the order of registration and the form cannot choose them.
        const phase = phaseForPosition(await Player.countDocuments());

        if (!phase) {
          return res.status(409).json({
            error: "Registrations full",
            message: "Player registrations are full for this season.",
          });
        }

        const player = await Player.create({
          ...entry,
          phase: phase.key,
          fee: phase.fee,
          reference: makeReference(),
          paymentScreenshot,
          playerPhoto,
        });

        saved = true;

        // Not awaited: the entry is saved, and the player should not wait on
        // the mail provider to see their confirmation.
        sendEntryReceivedEmail(player);

        return res.status(201).json({ player });
      } catch (err) {
        if (err.name === "ValidationError") {
          return res.status(400).json({
            error: err.message,
            message: Object.values(err.errors)[0].message,
          });
        }

        if (err.code === 11000) {
          if (err.keyPattern && err.keyPattern.reference) continue;

          return res.status(409).json({
            error: err.message,
            message: "That entry could not be saved. Please try again.",
          });
        }

        console.error("[rtpl] could not save player", err);

        return res.status(500).json({
          error: err.message,
          message: "We could not save your entry just now. Please try again in a moment.",
        });
      }
    }

    return res.status(503).json({
      error: "Reference allocation failed",
      message: "Could not allocate an entry reference. Please submit again.",
    });
  } finally {
    // Every way out of the loop except a saved entry leaves both images
    // belonging to nothing.
    if (!saved) {
      deleteEntryImage(paymentScreenshot.publicId);
      deleteEntryImage(playerPhoto.publicId);
    }
  }
};

/** Players as the dashboard needs them: with signed links to their images. */
function withImageUrls(player) {
  return {
    ...player.toObject(),
    paymentScreenshotUrl: entryImageUrl(player.paymentScreenshot),
    playerPhotoUrl: entryImageUrl(player.playerPhoto),
  };
}

export const getPlayers = async (_req, res) => {
  try {
    const players = await Player.find().sort({ createdAt: -1 });

    res.json({ count: players.length, players: players.map(withImageUrls) });
  } catch (err) {
    console.error("[rtpl] could not list players", err);

    res.status(500).json({ error: err.message, message: "Could not load the players." });
  }
};

export const getPlayerById = async (req, res) => {
  const { id } = req.params;

  try {
    const player = await Player.findById(id);

    if (!player) {
      return res.status(404).json({
        error: "Not found",
        message: "No player with that id.",
      });
    }

    res.json({ player: withImageUrls(player) });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        error: err.message,
        message: "That is not a valid player id.",
      });
    }

    console.error("[rtpl] could not load player", err);

    res.status(500).json({ error: err.message, message: "Could not load the player." });
  }
};

/**
 * An admin has matched the player's payment by hand. Records the UTR, marks
 * the entry confirmed and emails the player.
 */
export const confirmPlayerPayment = async (req, res) => {
  const { id } = req.params;
  const utr = String(req.body?.utr ?? "").trim().toUpperCase();

  if (!UTR_PATTERN.test(utr)) {
    return res.status(400).json({
      error: "Invalid UTR",
      message: "Enter the transaction UTR — 6 to 30 letters or digits, no spaces.",
    });
  }

  try {
    // The status filter makes this a one-shot: a double click or a second
    // admin cannot confirm twice and send the player two emails.
    const player = await Player.findOneAndUpdate(
      { _id: id, status: { $ne: "confirmed" } },
      { status: "confirmed", utr, paymentConfirmedAt: new Date() },
      { new: true }
    );

    if (!player) {
      const exists = await Player.exists({ _id: id });

      return exists
        ? res.status(409).json({
            error: "Already confirmed",
            message: "This player's payment has already been confirmed.",
          })
        : res.status(404).json({
            error: "Not found",
            message: "No player with that id.",
          });
    }

    const email = await sendPaymentConfirmedEmail(player);

    res.json({ player, emailSent: email.ok });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        error: err.message,
        message: "That is not a valid player id.",
      });
    }

    console.error("[rtpl] could not confirm payment", err);

    res.status(500).json({ error: err.message, message: "Could not confirm the payment." });
  }
};
