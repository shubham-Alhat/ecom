import express from "express";
import cookieParser from "cookie-parser";

const app = express();

// default middlewares
app.use(express.json({ limit: "16kb" })); // Allow express to take json data as well.
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Allow express to encode the url. eg " " = %20 or +. @ = %40
app.use(express.static("public")); // to store temp files on server. such files which are not imp.
app.use(cookieParser()); // allow express to set and read client's browser cookies.

export default app;
