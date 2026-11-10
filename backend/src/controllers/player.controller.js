import Player from "../models/player.model.js";
import Counter from "../models/counter.model.js";
import { PLAYER_PHASES, PLAYER_FEE, MAX_PLAYERS } from "../config/playerPhases.js";
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

/** Case, spacing and punctuation never decide a match. */
const normalizeName = (name) =>
  String(name ?? "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Names that are told registrations are closed. Add more to this list. */
const BLOCKED_PLAYER_NAMES = ["Ronak Harlalka"].map(normalizeName);

function isBlockedName(fullName) {
  return BLOCKED_PLAYER_NAMES.includes(normalizeName(fullName));
}

const REGISTRATIONS_FULL_MESSAGE = "Player registrations are full for this season.";
const PLAYER_COUNTER = "players";

/**
 * Creates the place counter the first time it is needed, starting from the
 * entries already saved. $setOnInsert never touches an existing counter, and
 * if two requests race to create it, the loser's duplicate-key error is the
 * proof that it now exists.
 */
let counterReady = null;
function ensurePlayerCounter() {
  counterReady ??= (async () => {
    const existing = await Player.countDocuments();
    try {
      await Counter.updateOne(
        { _id: PLAYER_COUNTER },
        { $setOnInsert: { seq: existing } },
        { upsert: true }
      );
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  })().catch((err) => {
    counterReady = null;
    throw err;
  });
  return counterReady;
}

/**
 * Takes one of the MAX_PLAYERS places, or returns null when none are left.
 *
 * The check and the increment are one atomic MongoDB update on one document,
 * so two entries arriving together cannot both take the last place: only one
 * update can see seq at 74 and move it to 75. Counting entries and then
 * saving, as this used to, left a gap between the two steps for a 76th.
 */
async function claimPlayerPlace() {
  await ensurePlayerCounter();

  const counter = await Counter.findOneAndUpdate(
    { _id: PLAYER_COUNTER, seq: { $lt: MAX_PLAYERS } },
    { $inc: { seq: 1 } },
    { new: true }
  );

  return counter ? counter.seq : null;
}

/** Hands a claimed place back when its entry did not get saved. */
function releasePlayerPlace() {
  Counter.updateOne({ _id: PLAYER_COUNTER, seq: { $gt: 0 } }, { $inc: { seq: -1 } }).catch(
    (err) => console.error("[rtpl] could not release a player place", err)
  );
}

async function placesTaken() {
  await ensurePlayerCounter();
  const counter = await Counter.findById(PLAYER_COUNTER);
  return counter?.seq ?? 0;
}

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

  // First, so nothing is validated, uploaded or saved for this entry. 403
  // rather than 5xx: the site shows a 4xx message to the player as written.
  if (isBlockedName(fullName)) {
    return res.status(403).json({
      error: "Blocked name",
      message: "Registrations are temporarily closed!",
    });
  }

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

  // Check the fields before claiming a place or uploading, so a typo in the
  // form neither holds a place nor leaves images behind in Cloudinary. Phase,
  // fee and reference are the server's to set, so placeholders stand in.
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

  // Claimed before anything is uploaded, so a full season costs no uploads.
  let place;
  try {
    place = await claimPlayerPlace();
  } catch (err) {
    console.error("[rtpl] could not claim a player place", err);

    return res.status(500).json({
      error: err.message,
      message: "We could not save your entry just now. Please try again in a moment.",
    });
  }

  if (place === null) {
    return res.status(409).json({
      error: "Registrations full",
      message: REGISTRATIONS_FULL_MESSAGE,
    });
  }

  let saved = false;
  /** Every image uploaded for this entry, so a failure can remove them all. */
  const uploaded = [];

  try {
    // Settled, not Promise.all: if one upload fails, the other still has to
    // finish so it can be cleaned up instead of being left in Cloudinary.
    const [photoUpload, screenshotUpload] = await Promise.allSettled([
      uploadPlayerPhoto(photoFile.buffer),
      uploadPaymentScreenshot(screenshotFile.buffer),
    ]);

    if (photoUpload.status === "fulfilled") uploaded.push(photoUpload.value);
    if (screenshotUpload.status === "fulfilled") uploaded.push(screenshotUpload.value);

    if (photoUpload.status === "rejected") {
      console.error("[rtpl] could not upload player picture", photoUpload.reason);

      return res.status(502).json({
        error: photoUpload.reason?.message,
        message: "We could not upload your picture. Please try again in a moment.",
      });
    }

    if (screenshotUpload.status === "rejected") {
      console.error("[rtpl] could not upload payment screenshot", screenshotUpload.reason);

      return res.status(502).json({
        error: screenshotUpload.reason?.message,
        message: "We could not upload your payment screenshot. Please try again in a moment.",
      });
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const player = await Player.create({
          ...entry,
          phase: PLAYER_PHASES[0].key,
          fee: PLAYER_FEE,
          reference: makeReference(),
          paymentScreenshot: screenshotUpload.value,
          playerPhoto: photoUpload.value,
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
    // Every way out except a saved entry hands the place back and removes
    // the images, which now belong to nothing.
    if (!saved) {
      releasePlayerPlace();
      for (const image of uploaded) deleteEntryImage(image.publicId);
    }
  }
};

/** Whether the form should be open — the registration page asks this. */
export const getPlayerAvailability = async (_req, res) => {
  try {
    const taken = await placesTaken();

    res.json({ open: taken < MAX_PLAYERS, max: MAX_PLAYERS });
  } catch (err) {
    console.error("[rtpl] could not read player availability", err);

    res.status(500).json({ error: err.message, message: "Could not check availability." });
  }
};

/** Players as the dashboard needs them: with signed links to their images. */
function withImageUrls(player) {
  const plain = player.toObject();
  return {
    ...plain,
    paymentScreenshotUrl: entryImageUrl(player.paymentScreenshot),
    playerPhotoUrl: entryImageUrl(player.playerPhoto),
    // Only the id, signed link and date leave the server.
    extraPaymentScreenshots: (plain.extraPaymentScreenshots ?? []).map((image) => ({
      _id: String(image._id),
      url: entryImageUrl(image),
      uploadedAt: image.uploadedAt,
    })),
  };
}

/** Admin adds one or more payment screenshots to an existing player. */
export const addPaymentScreenshots = async (req, res) => {
  const { id } = req.params;
  const files = req.files ?? [];

  if (files.length === 0) {
    return res.status(400).json({
      error: "No files",
      message: "Choose at least one screenshot to upload.",
    });
  }

  try {
    // Checked first, so nothing is uploaded for a player who is not there.
    if (!(await Player.exists({ _id: id }))) {
      return res.status(404).json({ error: "Not found", message: "No player with that id." });
    }
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: err.message, message: "That is not a valid player id." });
    }
    console.error("[rtpl] could not look up player for screenshots", err);
    return res.status(500).json({ error: err.message, message: "Could not upload the screenshots." });
  }

  const uploads = await Promise.allSettled(
    files.map((file) => uploadPaymentScreenshot(file.buffer))
  );
  const images = [];
  for (const u of uploads) {
    if (u.status === "fulfilled") images.push({ ...u.value, uploadedAt: new Date() });
    else console.error("[rtpl] could not upload admin screenshot", u.reason);
  }

  if (images.length === 0) {
    return res.status(502).json({
      error: "Upload failed",
      message: "The screenshots could not be uploaded. Please try again.",
    });
  }

  try {
    const player = await Player.findByIdAndUpdate(
      id,
      { $push: { extraPaymentScreenshots: { $each: images } } },
      { new: true }
    );

    if (!player) {
      for (const image of images) deleteEntryImage(image.publicId);
      return res.status(404).json({ error: "Not found", message: "No player with that id." });
    }

    res.status(201).json({
      player: withImageUrls(player),
      added: images.length,
      failed: uploads.length - images.length,
    });
  } catch (err) {
    for (const image of images) deleteEntryImage(image.publicId);
    console.error("[rtpl] could not save admin screenshots", err);
    res.status(500).json({ error: err.message, message: "Could not save the screenshots." });
  }
};

/** Admin removes one screenshot they added. The player's own is untouched. */
export const deletePaymentScreenshot = async (req, res) => {
  const { id, imageId } = req.params;

  try {
    // Returns the document as it was, so the removed image's Cloudinary id
    // is known and can be deleted too.
    const before = await Player.findOneAndUpdate(
      { _id: id, "extraPaymentScreenshots._id": imageId },
      { $pull: { extraPaymentScreenshots: { _id: imageId } } },
      { new: false }
    );

    if (!before) {
      return res.status(404).json({ error: "Not found", message: "That screenshot is already gone." });
    }

    const removed = before.extraPaymentScreenshots.find((image) => String(image._id) === imageId);
    if (removed) deleteEntryImage(removed.publicId);

    res.json({ ok: true });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: err.message, message: "That is not a valid id." });
    }
    console.error("[rtpl] could not delete admin screenshot", err);
    res.status(500).json({ error: err.message, message: "Could not delete the screenshot." });
  }
};

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
