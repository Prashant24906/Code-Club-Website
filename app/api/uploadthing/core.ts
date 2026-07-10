import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerAuth } from "@/lib/auth";

const f = createUploadthing();

const auth = async (req: Request) => {
  // Verify next-auth JWT token from the request (cookies/headers)
  const token = await getServerAuth(req);
  if (!token) return null;
  // token.sub or token.email can be used as a stable id
  return { id: token.sub || token?.email || "admin" };
};

export const ourFileRouter = {
  memberImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // Use next-auth token to authorize uploads
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Member image upload complete");
      console.log("Upload URL:", file.url);
      // Return the public URL to be stored in MongoDB
      return { 
        uploadedBy: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
