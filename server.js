const express = require("express"); // web server bnane k liy
const mongoose = require("mongoose"); // MongoDB se bat krne k liy
const cors = require("cors"); // Cross-Origin Resources sharing allow krta h
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require('./model')
const JWT_SECRET = "mysecretkey";

const app = express(); // express server ka object bnaya
const PORT = 5000;

app.use("/uploads", express.static("uploads"));
app.use(cors()); // allow krta ha react(Frontend) ko request bhjne k liy
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/edugram", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo Error", err));



// const User = mongoose.model("User", userSchema);

//Login Route
app.post("/api/login", async (req, res) => {
  console.log("request body=>", req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and Password required" });
  }

  try {
   const user = await User.findOne({ username: { $regex: new RegExp("^" + username.toLowerCase() + "$", "i") } });

    console.log("trying login for ", username);

    if (!user) {
      return res.status(401).json({ message: " User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: " Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res
      .status(200)
      .json({
        message: " Login successful",
        token,
        username: user.username,
        userId: user._id,
      });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//Duplicate User check

app.post("/api/register", async (req, res) => {
  const { username, password, email } = req.body;
  console.log("From Frontend =>", req.body)
  console.log("Received Register Data: ", username, password, email);
  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username Already taken" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ username: username.toLowerCase(), password: hashedPassword, email });
    await newUser.save();
    console.log("user saved successfully",newUser);

    res.status(201).json({ message: "Registration succefully" });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//email add
const transpoter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "edugram.project01@gmail.com",
    pass: "vjqd nufe kepp qidv",
  },
});

let otpStore = {};

app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[email] = otp;

  const mailOption = {
    from: "edugram.project01@gmail.com",
    to: email,
    subject: "Your Otp for Edugram",
    text: `Your Otp is ${otp}`,
  };

  try {
    await transpoter.sendMail(mailOption);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP" });
  }
});

app.get("/api/user/:id", (req, res) => {
  res.json({
    username: "divyanshu",
    bio: "Student | CSE | Learner",
    profilePic: "https://i.pravatar.cc/150?img=3",
    followers: 120,
    following: 150,
  });
});

app.get("/api/posts/:id", (req, res) => {
  res.json([
    {
      type: "note",
      imageUrl: "/uploads/note1.png",
    },
    {
      type: "sell",
      imageUrl: "/uploads/book1.png",
    },
  ]);
});

app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    delete otpStore[email];
    res.status(200).json({ message: "OTP verified" });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
});


app.put('/api/user/:id' , async(req, res)=>{
  try{
    const userId = req.params.id;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new:true
      }
    );
    res.status(200).json(updatedUser)
  }
  catch(err){
    console.log(err);
    res.status(500).json({ error : "Failed to update user profile"});
  }
})

app.listen(PORT, () => {
  console.log(`server runing on https://localhost:${PORT}`);
});
