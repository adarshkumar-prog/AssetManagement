const express = require('express');
const app = express();
const connectDB = require("./config/database");
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const assetRouter = require("./routes/asset");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", assetRouter);

connectDB()
.then(() => {
console.log("Database connected");
app.listen(port, () => console.log(`Listening on port ${port}`));}
)
.catch((err) => console.error("database Connection Error", err) 
);