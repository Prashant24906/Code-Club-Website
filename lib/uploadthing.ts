import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

/**
 * Upload an image to UploadThing
 * @param file The image file to upload
 * @returns The URL of the uploaded image
 */
export async function uploadMemberImage(file: File): Promise<string> {
  try {
    const result = await uploadFiles("memberImageUploader", {
      files: [file],
    });

    if (result && result.length > 0) {
      return result[0].url;
    }

    throw new Error("No upload result returned");
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
