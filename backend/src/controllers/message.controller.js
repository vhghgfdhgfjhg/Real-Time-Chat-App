import Message from "../models/message.model.js";
import user from "../models/user.model.js";

export const getUserforsidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const fliterUsers = await user
      .find({
        _id: { $ne: loggedInUserId },
      })
      .select("-password");
    res.status(200).json(fliterUsers);
  } catch (error) {
    console.log("Error in getUsersForsidebar", error.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const message = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in getMessage", error.message);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    let imageUrl;
    if (image) {
      //Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();
    //realtime functionality goes here => socket.io
  } catch (error) {
    console.log("Error in sendMessage", error.message);
    res.status(500).json({ message: "Failed to send message" });

  }
};
