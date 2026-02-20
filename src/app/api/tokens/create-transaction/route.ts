import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.TOKEN_LAYER_API_URL || "https://api.tokenlayer.network/functions/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const apiKey = process.env.TOKEN_LAYER_API_KEY;
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${API_BASE_URL}/create-token-transaction`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data?.error || "Failed to create token transaction." },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating token transaction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create token transaction." },
      { status: 500 }
    );
  }
}
