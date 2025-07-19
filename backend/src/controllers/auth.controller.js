import { generateToken } from "../lib/utils.js";
import user from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinay from "../lib/cloudinary.js";
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 charaters" });
    }

    const User = await user.findOne({ email });
    if (User) return res.status(400).json({ message: "Email already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newuser = new user({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newuser) {
      generateToken(newuser._id, res);
      await newuser.save();
      res.status(201).json({
        _id: newuser._id,
        fullName: newuser.fullName,
        email: newuser.email,
        profilePic: newuser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "Failed to create user" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
  res.send("Signup route");
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const User = await user.findOne({ email });
    if (!User) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const ispasswordCorrect = await bcrypt.compare(password, User.password);
    if (!ispasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    generateToken(User._id, res);
    res.status(200).json({
      _id: User._id,
      fullName: User.fullName,
      email: User.email,
      profilePic: User.profilePic,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateprofile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res
        .status(400)
        .json({ message: "Please provide a profile picture." });
    }
    const uploadResponse = await cloudinay.uploader.upload(profilePic);
    const updateuser = await user.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Profile updated successfully", updateuser });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
