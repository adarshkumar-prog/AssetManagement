const express = require('express');
const app = express();
const connectDB = require("./config/database");
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger'); 
const cors = require('cors');

const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'https://assetmanagement.setside.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));



app.use(express.json());

app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const assetRouter = require("./routes/asset");
const assetAssignmentRouter = require("./routes/assetAssignment");
const assetReportingRouter = require("./routes/assetReporting");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", assetRouter);
app.use("/", assetAssignmentRouter);
app.use("/", assetReportingRouter);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

connectDB()
.then(() => {
console.log("Database connected");
app.listen(port, () => console.log(`Listening on port ${port}`));}
)
.catch((err) => console.error("database Connection Error", err) 
);