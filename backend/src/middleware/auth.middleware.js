import jwt from "jsonwebtoken";
import user from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // console.log("Cookies received:", req.cookies); 
    const token = req.cookies.jwt; // fixed here
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const User = await user.findById(decoded.userId).select("-password");
    if (!User) {
      return res.status(401).json({ message: "Unauthorized - User Not Found" });
    }

    req.user = User;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
