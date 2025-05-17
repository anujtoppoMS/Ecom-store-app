const bcrypt = require("bcryptjs");
const prisma = require("../utills/db");  // Ensure this points to the singleton Prisma instance

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await prisma.User.findUnique({ where: { email } }); // Using findUnique for clarity
    if (!user) return res.status(401).json({ error: "User not found." });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ error: "Invalid password." });

    res.json({ message: "Login successful", user });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};