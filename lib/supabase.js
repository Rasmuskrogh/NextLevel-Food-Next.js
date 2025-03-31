import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadImage(file) {
  if (!file) return null;

  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("meal-images")
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading image", error);
    return null;
  }

  const { data: publicUrlData } = await supabase.storage
    .from("meal-images")
    .getPublicUrl(fileName);

  return publicUrlData?.publicUrl || null;
}
