import pool from "./db";
import slugify from "slugify";
import xss from "xss";
import cloudinary from "./cloudinary";

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log("Fetching meals...");

  try {
    const result = await pool.query(
      "SELECT id, title, summary, instructions, creator, creator_email, image, slug FROM meals"
    );
    return result.rows;
  } catch (error) {
    throw new Error("Failed to fetch meals: " + error.message);
  }
}

export async function getMeal(slug) {
  try {
    const result = await pool.query("SELECT * FROM meals WHERE slug = $1", [
      slug,
    ]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Failed to fetch meal: " + error.message);
  }
}

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  let imageUrl = meal.image;

  if (meal.image instanceof File) {
    try {
      // Konvertera File till base64
      const bytes = await meal.image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString("base64");
      const dataURI = `data:${meal.image.type};base64,${base64Image}`;

      // Ladda upp till Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "foodies",
        public_id: meal.slug,
      });

      imageUrl = result.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Failed to upload image to Cloudinary");
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO meals (title, summary, instructions, creator, creator_email, image, slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        meal.title,
        meal.summary,
        meal.instructions,
        meal.creator,
        meal.creator_email,
        imageUrl,
        meal.slug,
      ]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error("Failed to save meal: " + error.message);
  }
}
