import "dotenv/config";
import { connectDB, disconnectDB } from "./mongodb";
import { Product } from "../models";

async function query() {
  await connectDB();
  const product = await Product.findOne({ id: "DW2DD-1112" });
  console.log("Product DW2DD-1112:", product);
}

query().finally(() => disconnectDB());
