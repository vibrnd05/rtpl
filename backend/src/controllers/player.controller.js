import Player from "../models/player.model.js";

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
    battingStyle,
    bowlingStyle,
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
    battingStyle,
    bowlingStyle,
  };

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const player = await Player.create({
        ...entry,
        reference: makeReference(),
      });

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
};

export const getPlayers = async (_req, res) => {
  try {
    const players = await Player.find().sort({ createdAt: -1 });

    res.json({ count: players.length, players });
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

    res.json({ player });
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
