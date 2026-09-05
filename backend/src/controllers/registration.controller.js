import Registration from "../models/registration.model.js";

function makeReference() {
  const season = process.env.LEAGUE_SEASON || 8;
  return `RTPL${season}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export const createRegistration = async (req, res) => {
  const {
    owners,
    ownersMobile,
    playerOwner,
    teamName,
    financialCommitment,
    mentor,
    auctionAvailability,
  } = req.body;

  const entry = {
    owners,
    ownersMobile,
    playerOwner,
    teamName,
    financialCommitment,
    mentor,
    auctionAvailability,
  };

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const registration = await Registration.create({
        ...entry,
        reference: makeReference(),
      });

      return res.status(201).json({ registration });
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
          message:
            "A team is already entered under that name. Pick another, or contact the tournament desk if this was you.",
        });
      }

      console.error("[rtpl] could not save registration", err);

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

export const getRegistrations = async (_req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });

    res.json({ count: registrations.length, registrations });
  } catch (err) {
    console.error("[rtpl] could not list registrations", err);

    res.status(500).json({ error: err.message, message: "Could not load the entries." });
  }
};

export const getRegistrationById = async (req, res) => {
  const { id } = req.params;

  try {
    const registration = await Registration.findById(id);

    if (!registration) {
      return res.status(404).json({
        error: "Not found",
        message: "No entry with that id.",
      });
    }

    res.json({ registration });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        error: err.message,
        message: "That is not a valid entry id.",
      });
    }

    console.error("[rtpl] could not load registration", err);

    res.status(500).json({ error: err.message, message: "Could not load the entry." });
  }
};
