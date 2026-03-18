const mongoose = require("mongoose");
const User = require("c:/Users/minh/OneDrive/Desktop/QL_DoAn/backend/src/models/User");
require("dotenv").config({
  path: "c:/Users/minh/OneDrive/Desktop/QL_DoAn/backend/.env",
});

async function check() {
  try {
    const uri = process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
    console.log("Connecting to:", uri.substring(0, 20) + "...");
    await mongoose.connect(uri);
    console.log("Connected to DB");

    const users = await User.find({ role: "student" });
    console.log("Found", users.length, "students");

    for (const user of users) {
      console.log(
        `Student: ${user.user_name} (${user.email}) - Role: "${user.role}" - Status: ${user.user_status} - ID: ${user._id}`,
      );
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
