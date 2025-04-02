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
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulerad fördröjning (kan tas bort)

  const { data, error } = await supabase.from("meals").select("*");

  if (error) {
    throw new Error("Failed to fetch meals: " + error.message);
  }

  console.log("Fetched meals:", data);

  return data; // ✅ Returnera alla måltider
}

export async function getMeal(slug) {
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    throw new Error("Failed to fetch meal: " + error.message);
  }

  return data; // ✅ Returnera en specifik måltid
}

export async function saveMeal(meal) {
  console.log("DEBUG: meal.image innan något händer:", meal.image);
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  console.log("Before saving, meal.image:", meal.image);

  let imageUrl = meal.image; // Standard: använd befintlig bild-URL om den finns

  if (meal.image instanceof File) {
    // 🔥 Ny bild har laddats upp via en fil -> Ladda upp till Supabase Storage
    const fileExt = meal.image.name.split(".").pop(); // Hämta filändelsen
    const fileName = `${meal.slug}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("meal-images")
      .upload(filePath, meal.image, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      throw new Error("Failed to upload image: " + uploadError.message);
    }

    // ✅ Hämta den publika URL:en från Supabase Storage
    const { data: publicUrlData, error: urlError } = supabase.storage
      .from("meal-images")
      .getPublicUrl(filePath);

    if (urlError) {
      throw new Error("Failed to get image URL: " + urlError.message);
    }

    imageUrl = publicUrlData.publicUrl; // Uppdatera imageUrl till den uppladdade bilden
  }

  console.log("Final image URL:", imageUrl);

  // 🔥 Spara måltiden i databasen med den publika bild-URL:en
  const { data, error } = await supabase.from("meals").insert([
    {
      title: meal.title,
      summary: meal.summary,
      instructions: meal.instructions,
      creator: meal.creator,
      creator_email: meal.creator_email,
      image: imageUrl, // ✅ Sparar den korrekta URL:en
      slug: meal.slug,
    },
  ]);

  if (error) throw new Error("Failed to save meal: " + error.message);
  return data;
}
