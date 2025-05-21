"use server";

import { redirect } from "next/navigation";
import { saveMeal } from "./meals";
import { revalidatePath } from "next/cache";

function isInvalidText(text) {
  return !text || text.trim() === "";
}

export const shareMeal = async (prevState, formData) => {
  console.log("Starting shareMeal function...");

  const meal = {
    title: formData.get("title"),
    summary: formData.get("summary"),
    instructions: formData.get("instructions"),
    image: formData.get("image"),
    creator: formData.get("name"),
    creator_email: formData.get("email"),
  };

  console.log("Form data received:", {
    title: meal.title,
    summary: meal.summary,
    instructions: meal.instructions,
    image: meal.image ? "Image present" : "No image",
    creator: meal.creator,
    creator_email: meal.creator_email,
  });

  if (
    isInvalidText(meal.title) ||
    isInvalidText(meal.summary) ||
    isInvalidText(meal.instructions) ||
    isInvalidText(meal.creator) ||
    isInvalidText(meal.creator_email) ||
    !meal.creator_email.includes("@") ||
    !meal.image ||
    meal.image.size === 0
  ) {
    console.log("Validation failed:", {
      title: isInvalidText(meal.title),
      summary: isInvalidText(meal.summary),
      instructions: isInvalidText(meal.instructions),
      creator: isInvalidText(meal.creator),
      creator_email:
        isInvalidText(meal.creator_email) || !meal.creator_email.includes("@"),
      image: !meal.image || meal.image.size === 0,
    });
    return {
      message: "Invalid input",
    };
  }

  try {
    console.log("Attempting to save meal...");
    await saveMeal(meal);
    console.log("Meal saved successfully");
    revalidatePath("/meals");
    redirect("/meals");
  } catch (error) {
    console.error("Error in shareMeal:", error);
    return {
      message: `Failed to save meal: ${error.message}`,
    };
  }
};
