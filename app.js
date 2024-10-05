require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
//middlewares
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "http://localhost:5173", // Frontend origin
        credentials: true, // Allow cookies to be sent
    })
);
app.set("trust proxy", 1);
app.use(morgan("tiny"));
//DB Connection
const connectDB = require("./db/connectDB");
//routes
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const cartRouter = require("./routes/cartRoutes");
const paymentRouter = require("./routes/paymentRouter");
const orderRouter = require("./routes/orderRoutes");
const notFoundMiddleware = require("./middlewares/not-found");
const errorHandlerMiddleware = require("./middlewares/error-handler");

app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/users", userRouter);
app.use("/reviews", reviewRouter);
app.use("/cart", cartRouter);
app.use("/payment", paymentRouter);
app.use("/orders", orderRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}...`);
        });
    } catch (error) {
        console.log(error);
    }
};
start();
