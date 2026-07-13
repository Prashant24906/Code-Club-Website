import { v2 as cloudinary } from "cloudinary";
import { checkAuth } from "@/lib/auth-check";

export async function POST(request: Request) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  // Configure inside the handler so Next.js env vars are guaranteed to be loaded
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const { dataUrl } = await request.json();

  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    return new Response(JSON.stringify({ error: "Invalid image data" }), { status: 400 });
  }

  // Rough size guard: base64 is ~33% larger than binary; 10MB binary = ~13.3MB base64
  if (dataUrl.length > 14_000_000) {
    return new Response(JSON.stringify({ error: "Image too large (max ~10MB)" }), { status: 413 });
  }

  try {
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "code-club/events",
      resource_type: "image",
    });

    return new Response(JSON.stringify({ url: result.secure_url }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("Cloudinary upload error:", message);
    return new Response(JSON.stringify({ error: "Upload failed", detail: message }), { status: 500 });
  }
}
