import User from "../models/user.js";
import Doctor from "../models/doctor.js";
import bcrypt from "bcrypt";

export const addDoctor = async (req, res) => {
    try {
        const { name, email, phone, password, department, experience } = req.body;

        if (!name || !email || !phone || !password || !department || !experience) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: "doctor"
        });
        await newUser.save();

        const newDoctor = new Doctor({
            user: newUser._id,
            department,
            experience
        });
        await newDoctor.save();

        return res.status(201).json({
            success: true,
            message: "Doctor added successfully",
            user: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                phone: newUser.phone,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const registerAdmin = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10); 

        const admin = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role: "admin",
        });

        await admin.save();

        return res.status(201).json({
            success: true,
            message: "Admin created successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        })
    }
};