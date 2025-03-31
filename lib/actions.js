// "use server";

// import { redirect } from "next/navigation";

// import { saveMeal } from "./meals";
// import { revalidatePath } from "next/cache";

// function isInvalidText(text) {
//   return !text || text.trim === "";
// }

// export const shareMeal = async (prevState, formData) => {
// const meal = {
//   title: formData.get("title"),
//   summary: formData.get("summary"),
//   instructions: formData.get("instructions"),
//   image: formData.get("image"),
//   creator: formData.get("name"),
//   creator_email: formData.get("email"),
// };

//   if (
//     isInvalidText(meal.title) ||
//     isInvalidText(meal.summary) ||
//     isInvalidText(meal.instructions) ||
//     isInvalidText(meal.creator) ||
//     isInvalidText(meal.creator_email) ||
//     !meal.creator_email.includes("@") ||
//     !meal.image ||
//     meal.image.size === 0
//   ) {
//     return {
//       message: "Invalid input",
//     };
//   }

//   await saveMeal(meal);
//   revalidatePath("/meals");
//   redirect("/meals");
// };

"use server";

import { redirect } from "next/navigation";
import { saveMeal } from "./meals";
import { revalidatePath } from "next/cache";
import { supabase } from "./supabase"; // Se till att denna import finns

function isInvalidText(text) {
  return !text || text.trim() === "";
}

export const shareMeal = async (formData) => {
  console.log("Received formData:", Object.fromEntries(formData));

  if (!formData) {
    return { message: "Form data is missing!" };
  }

  // 🖼 Hämta filen från formData
  const file = formData.get("image");

  if (!file || file.size === 0) {
    return { message: "Image is required!" };
  }

  // 🔥 Ladda upp bild till Supabase
  const { data, error } = await supabase.storage
    .from("meal-images")
    .upload(`public/${file.name}`, file);

  if (error) {
    console.error("Upload error:", error);
    return { message: "Image upload failed!" };
  }

  // ✅ Hämta bildens URL från Supabase
  const imageUrl = `https://your-supabase-url/storage/v1/object/public/meal-images/${data.path}`;

  // ✅ Skapa meal-objektet med rätt data
  const meal = {
    title: formData.get("title"),
    summary: formData.get("summary"),
    instructions: formData.get("instructions"),
    image: imageUrl, // ✅ Spara URL, inte filen!
    creator: formData.get("name"),
    creator_email: formData.get("email"),
  };

  console.log("Saving meal:", meal);

  // 🔥 Skicka till databasen
  const { error: insertError } = await supabase.from("meals").insert([meal]);

  if (insertError) {
    console.error("Insert error:", insertError);
    return { message: "Failed to save meal!" };
  }

  return { message: "Meal shared successfully!", image: meal.image };
};
