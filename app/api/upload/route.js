export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Sätt storleksgräns här
    },
  },
};

export async function POST(req) {
  // Hantera uppladdning här
  const formData = await req.formData();
  // Gör något med formData, t.ex. ladda upp till Supabase

  return new Response(JSON.stringify({ message: "File uploaded!" }), {
    status: 200,
  });
}
