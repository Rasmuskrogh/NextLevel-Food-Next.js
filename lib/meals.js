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

export async function saveMeal(mealData) {
  const { title, summary, instructions, creator, creator_email, image } =
    mealData;

  try {
    let imageUrl = "/images/placeholder.jpg";

    if (image instanceof File) {
      // Konvertera File till base64
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString("base64");
      const dataURI = `data:${image.type};base64,${base64Image}`;

      // Ladda upp till Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "foodies",
        public_id: slugify(title, { lower: true }),
      });

      imageUrl = result.secure_url;
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Skapa slug från titeln
    const slug = slugify(title, { lower: true });

    // Sanera instructions med xss
    const sanitizedInstructions = xss(instructions);

    await pool.query(
      `INSERT INTO meals (title, summary, instructions, creator, creator_email, image, slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        title,
        summary,
        sanitizedInstructions,
        creator,
        creator_email,
        imageUrl,
        slug,
      ]
    );

    await pool.end();
  } catch (error) {
    console.error("Error saving meal:", error);
    throw new Error(`Failed to save meal: ${error.message}`);
  }
}
