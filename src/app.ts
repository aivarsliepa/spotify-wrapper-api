import express from "express";
import compression from "compression";
import bodyParser from "body-parser";

const app = express();

app.set("port", process.env.PORT || 9000);
app.use(compression());
app.use(bodyParser.json());

export default app;
