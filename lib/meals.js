// import fs from "node:fs";

// import sql from "better-sqlite3";
// import slugify from "slugify";
// import xss from "xss";

// const db = sql("meals.db");

// export async function getMeals() {
//   await new Promise((resolve) => setTimeout(resolve, 2000));

//   //throw new Error("Loading meals failed");
//   return db.prepare("SELECT * FROM meals").all();
// }

// export function getMeal(slug) {
//   return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
// }

// export async function saveMeal(meal) {
//   meal.slug = slugify(meal.title, { lower: true });
//   meal.instructions = xss(meal.instructions);

//   const extension = meal.image.name.split(".").pop();
//   const fileName = `${meal.slug}.${extension}`;

//   const stream = fs.createWriteStream(`public/images/${fileName}`);
//   const bufferedImage = await meal.image.arrayBuffer();

//   stream.write(Buffer.from(bufferedImage), (error) => {
//     if (error) {
//       throw new Error("Saving image failed");
//     }
//   });

//   meal.image = `/images/${fileName}`;

//   db.prepare(
//     `
//       INSERT INTO meals
//         (title, summary, instructions, creator, creator_email, image, slug)
//       VALUES (
//         @title,
//         @summary,
//         @instructions,
//         @creator,
//         @creator_email,
//         @image,
//         @slug
//       )
//     `
//   ).run(meal);
// }

import { supabase } from "@/lib/supabase";
import slugify from "slugify";
import xss from "xss";

export async function getMeals() {
  const { data, error } = await supabase.from("meals").select("*");
  if (error) throw new Error("Failed to fetch meals: " + error.message);
  return data;
}

export async function getMeal(slug) {
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw new Error("Failed to fetch meal: " + error.message);
  return data;
}

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  // Hantera bilduppladdning till Supabase Storage
  const fileExt = meal.image.name.split(".").pop();
  const fileName = `${meal.slug}.${fileExt}`;
  const filePath = `images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("meal-images")
    .upload(filePath, meal.image, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Failed to upload image: " + uploadError.message);
  }

  // Generera URL till den uppladdade bilden
  const { publicURL, error: urlError } = supabase.storage
    .from("meal-images")
    .getPublicUrl(filePath);

  if (urlError) {
    throw new Error("Failed to get image URL: " + urlError.message);
  }

  // Spara måltiden i databasen med URL
  const { data, error } = await supabase.from("meals").insert([
    {
      title: meal.title,
      summary: meal.summary,
      instructions: meal.instructions,
      creator: meal.creator,
      creator_email: meal.creator_email,
      image: publicURL, // Spara URL istället för filens sökväg
      slug: meal.slug,
    },
  ]);

  if (error) throw new Error("Failed to save meal: " + error.message);
  return data;
}
