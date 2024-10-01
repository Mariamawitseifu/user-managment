const mongoose = require("mongoose");

exports.mongoConnect = (mongoUrl) => {
    // connect to mongodb
    mongoose.connect(mongoUrl || "mongodb://mongo:27017/crm", {});
    return mongoose;
}
