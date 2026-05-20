import { NextResponse } from "next/server";
import { createInstagramVisitToken } from "@/lib/instagram";

export async function GET() {
  return NextResponse.json({
    status: "success",
    instagram_url: "https://www.instagram.com/parqueturisticoequus/",
    instagram_token: createInstagramVisitToken(),
  });
}
