const router = require("express").Router();
let utilisateurs = require("../data/utilisateurs");

router.get("/", (req, res) => res.json(utilisateurs));

router.post("/", (req, res) => {
  const user = { id: Date.now(), ...req.body };
  utilisateurs.push(user);
  res.status(201).json(user);
});

router.put("/:id", (req, res) => {
  utilisateurs = utilisateurs.map(u =>
    u.id == req.params.id ? { ...u, ...req.body } : u
  );
  res.json({ message: "Utilisateur modifié" });
});

router.delete("/:id", (req, res) => {
  utilisateurs = utilisateurs.filter(u => u.id != req.params.id);
  res.json({ message: "Utilisateur supprimé" });
});

module.exports = router;
