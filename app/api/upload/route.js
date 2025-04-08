import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Använd den nya konfigurationssyntaxen
export const runtime = "edge"; // Använd edge runtime om det behövs
export const dynamic = "force-dynamic"; // Tvinga dynamisk rendering

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Ladda upp filen till Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { data, error } = await supabase.storage
      .from("meal-images")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Hämta den publika URL:en för den uppladdade filen
    const { data: publicUrlData, error: urlError } = supabase.storage
      .from("meal-images")
      .getPublicUrl(filePath);

    if (urlError || !publicUrlData?.publicUrl) {
      console.error("URL error:", urlError);
      return NextResponse.json(
        { error: "Failed to get file URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
