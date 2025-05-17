
const { console } = require("inspector");
const prisma = require("../utills/db");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

async function getNanoid() {
    const { nanoid } = await import("nanoid");
    return nanoid();
  }

// Remove `NextResponse`, use Express response (`res`)
module.exports.handleRegister = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findFirst({ where: { email } });

        if (existingUser) {
            console.log(res.status);
            return res.status(400).json({ message: "Email is already in use" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 5);
        // const id = await getNanoid();

        // Create user
        await prisma.User.create({
            data: {
                // id: id,
                email,
                password: hashedPassword,
            },
        });

        return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
