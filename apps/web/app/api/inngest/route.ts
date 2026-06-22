import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Inngest worker API endpoint" });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    return NextResponse.json({ received: true, payload });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
