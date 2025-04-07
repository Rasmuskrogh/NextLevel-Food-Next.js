import { supabase } from "@/lib/supabase";
import slugify from "slugify";
import xss from "xss";

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000)); 
  console.log("Fetching meals...");
  const fields = [
    "id",
    "title",
    "summary",
    "instructions",
    "creator",
    "creator_email",
    "image",
    "slug",
  ].join(",");
  console.log("SELECT fields:", fields);
  const { data, error } = await supabase.from("meals").select(fields);
  console.log("Fetched meals:", data, error);

  if (error) {
    throw new Error("Failed to fetch meals: " + error.message);
  }

  console.log("Fetched meals:", data);

  return data; 
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

  return data; 
}

export async function saveMeal(meal) {
  console.log("DEBUG: meal.image innan något händer:", meal.image);

  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  console.log("Before saving, meal.image:", meal.image);

  let imageUrl = meal.image;


  if (meal.image instanceof File) {
    const fileExt = meal.image.name.split(".").pop();
    const fileName = `${meal.slug}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("meal-images")
      .upload(filePath, meal.image, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("❌ Failed to upload image:", uploadError.message);
      throw new Error("Failed to upload image: " + uploadError.message);
    }

    const { data: publicUrlData, error: urlError } = supabase.storage
      .from("meal-images")
      .getPublicUrl(filePath);

    if (urlError || !publicUrlData?.publicUrl) {
      console.error("❌ Failed to get public image URL:", urlError?.message);
      throw new Error("Failed to get image URL: " + urlError?.message);
    }

    imageUrl = publicUrlData.publicUrl;
  }

  else if (
    typeof meal.image === "string" &&
    meal.image.startsWith("/images/")
  ) {
    imageUrl = meal.image;
  }

  console.log("✅ Final image URL ready:", imageUrl);


  const debugMeal = {
    title: meal.title,
    summary: meal.summary,
    instructionsLength: meal.instructions.length,
    instructionsPreview: meal.instructions.slice(0, 50) + "...",
    creator: meal.creator,
    creator_email: meal.creator_email,
    image: imageUrl,
    imageLength: imageUrl?.length || 0,
    slug: meal.slug,
  };

  console.log("📝 Meal object about to be inserted:", debugMeal);

  const { data, error } = await supabase.from("meals").insert([
    {
      title: meal.title,
      summary: meal.summary,
      instructions: meal.instructions,
      creator: meal.creator,
      creator_email: meal.creator_email,
      image: imageUrl,
      slug: meal.slug,
    },
  ]);

  if (error) {
    console.error("❌ Insert failed:", error.message);
    console.error("🛠 Full error object:", error);
    throw new Error("Failed to save meal: " + error.message);
  }

  console.log("✅ Insert successful:", data);
  return data;
}
