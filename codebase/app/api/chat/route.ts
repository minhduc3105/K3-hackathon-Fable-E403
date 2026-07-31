import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  message: string;
  sourceFileName: string;
  history: ChatMessage[];
};

async function getPdfText(filename: string): Promise<string> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/pdf-text/${encodeURIComponent(filename)}`);

    if (!response.ok) {
      console.error("PDF text extraction failed:", response.status);
      return "";
    }

    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("Error fetching PDF text:", error);
    return "";
  }
}

export async function POST(request: NextRequest) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as ChatRequest;
    const { message, sourceFileName, history } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get full PDF text
    const slideContext = await getPdfText(sourceFileName);

    if (!slideContext) {
      return NextResponse.json({
        reply: "Xin lỗi, tôi không thể đọc được nội dung slide này. Hãy đảm bảo file PDF có text layer (không phải scan).",
      });
    }

    const systemPrompt = `Bạn là VLearn Tutor, trợ lý AI giúp sinh viên học tập từ slide bài giảng.

NHIỆM VỤ:
- Trả lời câu hỏi dựa trên nội dung slide được cung cấp
- Giải thích khái niệm một cách rõ ràng, dễ hiểu
- Đưa ra ví dụ thực tế khi cần
- Khuyến khích người học suy nghĩ sâu hơn

QUY TẮC:
- CHỈ dùng thông tin từ slide được cung cấp
- Nếu câu hỏi ngoài phạm vi slide, lịch sự từ chối và gợi ý học viên đọc thêm
- Trả lời ngắn gọn (2-4 câu), trừ khi được yêu cầu chi tiết
- Dùng tiếng Việt, giọng thân thiện như đồng học`;

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "system",
        content: `NỘI DUNG SLIDE "${sourceFileName}":\n\n${slideContext.slice(0, 12000)}`,
      },
      ...history.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": request.headers.get("referer") || "http://localhost:3000",
        "X-Title": "VLearn AI Tutor",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return NextResponse.json(
        { error: "Failed to get response from AI model" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Xin lỗi, tôi không thể trả lời lúc này.";

    return NextResponse.json({
      reply,
      model: OPENROUTER_MODEL,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
