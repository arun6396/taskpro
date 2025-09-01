const connectDB = require("./src/Config/db");
const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(express.json());

app.use(cors({ origin: "*" }));

const port = process.env.PORT || 3001;
connectDB();
app.get("/", (req, res) => {
  res.send("Hello World!");
});
// Routes
const userRoutes = require("./src/Routes/userRoute");

const slotRoutes = require("./src/Routes/slotRoute");

app.use("/api/user", userRoutes);

app.use("/api/slots", slotRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
