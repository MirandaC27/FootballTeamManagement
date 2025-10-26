const express = require("express");
const path = require("path");
const { month } = require("../FootballTeamManagement/SpikeWork/Calendar/calendar-config-spike2");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.get("/api/calendar/:year", (req, res) => {
  const year = parseInt(req.params.year);
  if (isNaN(year)) {
    return res.status(400).json({ error: "Invalid year format" });
  }

  const data = month(year);
  res.json({ year, data });
});

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`✅ Calendar backend running on http://localhost:${PORT}`)
);
