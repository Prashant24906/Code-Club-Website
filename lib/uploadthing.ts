// uploadthing.ts — removed. Images are now stored as base64 data URLs in MongoDB.
// This file is kept as a stub to avoid import errors during transition.
export async function uploadMemberImage(_file: File): Promise<string> {
  throw new Error("UploadThing has been removed. Images are stored as base64 in MongoDB.")
}
