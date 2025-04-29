import { Learner, validateLearner } from "../models/learnerModel.js";
import { sendVerificationEmail } from "../sendgrid/sendgridConfig.js";
import { VERIFICATION_LEARNER_TEMPLATE } from "../sendgrid/emailTemplates.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { User } from "../models/userModel.js";
import { APP_ORIGIN } from "../constant/env.js";
import { BAD_REQUEST } from "../constant/http.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import generateRandomPassword from "../utils/generateRandomPassword.js";
import { sendLearnerCredentials } from "../sendgrid/sendgridConfig.js";

// Create a new learner
export const createLearner = async (req, res) => {
  try {
    const validatedData = validateLearner(req.body);
    // Check if the learner exists
    const learner = await Learner.findOne({ email: validatedData.email });
    const user = await User.findOne({ email: validatedData.email });
    console.log(user);
    if (learner) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "Learner already exist" });
    }
    const password = generateRandomPassword()
    let hashedPassword = ''
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    // const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    // Generate a 6-digit verification code
    // const verificationToken = generateVerificationToken();
    //create new Learner
    const newLearner = new Learner({
      ...validatedData,
      created_by: {
        role: req.role,
        user_id: req.userId,
      },
      
    });
    //create new user if doesn't exist
    console.log(req.role);
    // If the user is an admin and the user does not exist, create a new user
    if (req.role === "Admin" && !user) {
      // console.log(user)
      const newUser = new User({
        email: validatedData.email,
        password: hashedPassword,
        isVerified:true,
        verificationToken:undefined,
        verificationTokenExpiresAt: undefined
      });
      //save new user
      await newUser.save();
    }
    //save new learner
    await newLearner.save();
  
    // Send verification email
    await sendLearnerCredentials(
      newLearner.email,
      password,
      VERIFICATION_LEARNER_TEMPLATE
    );

    res
      .status(201)
      .json({ message: "Learner created successfully", learner: newLearner });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all learners
export const getLearners = async (req, res) => {
  try {
    const learners = await Learner.find();
    res.status(200).json(learners);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a learner by ID
export const getLearnerById = async (req, res) => {
  try {
    const learner = await Learner.findById(req.params.id);
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }
    res.status(200).json(learner);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a learner by ID
export const updateLearner = async (req, res) => {
  try {
    const validatedData = validateLearner(req.body);
    const updatedLearner = await Learner.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true }
    );
    if (!updatedLearner) {
      return res.status(404).json({ message: "Learner not found" });
    }
    res.status(200).json({
      message: "Learner updated successfully",
      learner: updatedLearner,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a learner by ID
export const deleteLearner = async (req, res) => {
  try {
    const deletedLearner = await Learner.findByIdAndDelete(req.params.id);
    if (!deletedLearner) {
      return res.status(404).json({ message: "Learner not found" });
    }
    res.status(200).json({ message: "Learner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
