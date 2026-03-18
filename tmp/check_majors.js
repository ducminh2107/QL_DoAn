const mongoose = require("mongoose");
const User = require("c:/Users/minh/OneDrive/Desktop/QL_DoAn/backend/src/models/User");
require("dotenv").config({
  path: "c:/Users/minh/OneDrive/Desktop/QL_DoAn/backend/.env",
});

async function check() {
  try {
    const uri = process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log("Connected to DB");

    const students = await User.find({ role: "student" }).populate(
      "user_major",
    );
    console.log("Found", students.length, "students");

    for (const s of students) {
      console.log(`Student: ${s.user_name} (${s.email})`);
      console.log(
        `  Major: ${s.user_major ? s.user_major.major_title : "NULL"}`,
      );
      console.log(`  Major ID: ${s.user_major ? s.user_major._id : "NULL"}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
