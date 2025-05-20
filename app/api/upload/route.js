import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

// Använd den nya konfigurationssyntaxen
export const runtime = "edge"; // Använd edge runtime om det behövs
export const dynamic = "force-dynamic"; // Tvinga dynamisk rendering

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Spara filen i public/images mappen
    const fileName = file.name;
    const filePath = path.join(process.cwd(), "public", "images", fileName);
    await writeFile(filePath, buffer);

    // Returnera den publika sökvägen till filen
    return NextResponse.json({
      url: `/images/${fileName}`,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
