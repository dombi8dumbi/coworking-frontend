const router = require("express").Router();
let notifications = require("../data/notifications");

// Ajouter une notification (NoSQL)
router.post("/", (req, res) => {
  const notification = {
    id: Date.now(),
    utilisateur_id: req.body.utilisateur_id,
    message: req.body.message,
    date_notification: new Date(),
    lu: false
  };

  notifications.unshift(notification);
  res.status(201).json(notification);
});

// Récupérer les 10 dernières notifications d’un utilisateur
router.get("/:utilisateur_id", (req, res) => {
  const result = notifications
    .filter(n => n.utilisateur_id == req.params.utilisateur_id)
    .slice(0, 10);

  res.json(result);
});

module.exports = router;
