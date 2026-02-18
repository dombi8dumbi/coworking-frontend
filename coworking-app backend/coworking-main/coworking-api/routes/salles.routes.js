const router = require("express").Router();
let salles = require("../data/salles");

router.get("/", (req, res) => res.json(salles));

router.post("/", (req, res) => {
  const salle = { id: Date.now(), ...req.body };
  salles.push(salle);
  res.status(201).json(salle);
});

router.put("/:id", (req, res) => {
  salles = salles.map(s =>
    s.id == req.params.id ? { ...s, ...req.body } : s
  );
  res.json({ message: "Salle modifiée" });
});

router.delete("/:id", (req, res) => {
  salles = salles.filter(s => s.id != req.params.id);
  res.json({ message: "Salle supprimée" });
});

module.exports = router;
