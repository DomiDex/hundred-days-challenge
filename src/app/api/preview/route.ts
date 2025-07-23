import { redirectToPreviewURL } from "@prismicio/next";
import { createClient } from "@/prismicio";

export async function GET(request: Request) {
  const client = createClient();

  return await redirectToPreviewURL({ client, request });
}