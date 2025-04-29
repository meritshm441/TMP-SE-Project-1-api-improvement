import { Revenue,validateRevenue } from "../models/revenueModel.js";

// Get all revenues
export const getRevenues = async (req, res) => {
  try {
    const revenues = await Revenue.find();
    res.status(200).json(revenues);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a revenue by ID
export const getRevenueById = async (req, res) => {
  try {
    const revenue = await Revenue.findById(req.params.id);
    if (!revenue) {
      return res.status(404).json({ message: "Revenue not found" });
    }
    res.status(200).json(revenue);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new revenue
export const createRevenue = async (req, res) => {
  try {
    const validatedData = validateRevenue(req.body);
    const newRevenue = new Revenue(validatedData);
    await newRevenue.save();
    res.status(201).json({ message: "Revenue created successfully", revenue: newRevenue });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};