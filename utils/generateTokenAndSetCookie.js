import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (res, userId, role) => {
  // Generate a JWT token
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Set the token in a cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

export default generateTokenAndSetCookie;
