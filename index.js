const express = require("express");

const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const PORT = process.env.PORT || 3300;

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

//error handlers
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!!";

  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

//Creating app server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}...`);
});
