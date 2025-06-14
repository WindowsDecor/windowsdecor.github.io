const MongoClient = require("mongodb").MongoClient;
const state = {
  db: null,
};
module.exports.connect = function (done) {
  const url = process.env.MONGODB_URL;
  const dbname = process.env.MONGODB_DBNAME;

  const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  };

  MongoClient.connect(url, options, function (err, data) {
    if (err) {
      console.error("MongoDB Connection Error:", err);
      return done(err);
    }
    state.db = data.db(dbname);
    console.log("MongoDB Connected Successfully");
    done();
  });
};

module.exports.get = function () {
  return state.db;
};
