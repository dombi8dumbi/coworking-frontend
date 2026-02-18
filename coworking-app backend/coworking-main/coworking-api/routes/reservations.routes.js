const router = require("express").Router();
let reservations = require("../data/reservations");

router.get("/", (req, res) => res.json(reservations));

router.post("/", (req, res) => {
  const reservation = { id: Date.now(), ...req.body };
  reservations.push(reservation);
  res.status(201).json(reservation);
});

router.delete("/:id", (req, res) => {
  reservations = reservations.filter(r => r.id != req.params.id);
  res.json({ message: "Réservation supprimée" });
});

module.exports = router;
