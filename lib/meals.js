import { Pool } from "pg";
import slugify from "slugify";
import xss from "xss";
import cloudinary from "./cloudinary";

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log("Fetching meals...");

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    const result = await pool.query(
      "SELECT id, title, summary, instructions, creator, creator_email, image, slug FROM meals"
    );
    await pool.end();
    return result.rows;
  } catch (error) {
    throw new Error("Failed to fetch meals: " + error.message);
  }
}

export async function getMeal(slug) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    const result = await pool.query("SELECT * FROM meals WHERE slug = $1", [
      slug,
    ]);
    await pool.end();
    return result.rows[0];
  } catch (error) {
    throw new Error("Failed to fetch meal: " + error.message);
  }
}

export async function saveMeal(meal) {
  try {
    // Konvertera bilden till base64
    const imageBuffer = await meal.image.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const dataURI = `data:${meal.image.type};base64,${base64Image}`;

    // Ladda upp till Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "meals",
    });

    // Generera slug från titeln
    const slug = slugify(meal.title, { lower: true });

    // Spara måltiden med Cloudinary URL och slug
    const mealWithImage = {
      ...meal,
      image: result.secure_url,
      slug: slug,
    };

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await pool.query(
      `INSERT INTO meals (title, summary, instructions, image, creator, creator_email, slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        mealWithImage.title,
        mealWithImage.summary,
        mealWithImage.instructions,
        mealWithImage.image,
        mealWithImage.creator,
        mealWithImage.creator_email,
        mealWithImage.slug,
      ]
    );

    await pool.end();
  } catch (error) {
    throw new Error(`Failed to save meal: ${error.message}`);
  }
}
