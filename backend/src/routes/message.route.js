import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessage,
  getUserforsidebar,
  sendMessage,
} from "../controllers/message.controller.js";
const messageroute = express.Router();

messageroute.get("/user", protectRoute, getUserforsidebar);
messageroute.get("/:id", protectRoute, getMessage);

messageroute.post("/send/:id", protectRoute, sendMessage);

export default messageroute;
