const express = require('express');
const app = express();
const connectDB = require("./config/database");
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger'); 
const cors = require('cors');





app.use(cors({
  origin: '*'
}));


app.use(express.json());

app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const assetRouter = require("./routes/asset");
const assetAssignmentRouter = require("./routes/assetAssignment");
const assetReportingRouter = require("./routes/assetReporting");

app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", assetRouter);
app.use("/api", assetAssignmentRouter);
app.use("/api", assetReportingRouter);
// app.use("/api", index);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

connectDB()
.then(() => {
console.log("Database connected");
app.listen(port, () => console.log(`Listening on port ${port}`));}
)
.catch((err) => console.error("database Connection Error", err) 
);