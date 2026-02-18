const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/utilisateurs", require("./routes/utilisateurs.routes"));
app.use("/api/salles", require("./routes/salles.routes"));
app.use("/api/reservations", require("./routes/reservations.routes"));
app.use("/api/notifications", require("./routes/notifications.routes"));

app.listen(3000, () => {
  console.log("API démarrée sur http://localhost:3000");
});
