import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: { user: process.env.MONGO_USER, password: process.env.MONGO_PW },
    dbName: process.env.MONGO_DB_NAME,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log("connected to db..."))
  .catch(err => console.log("failed to connect to db", err));
