import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "VLearn | Tự kiểm tra bài học",
  description: "Prototype VLearn AI Tutor cho luồng ôn tập trong reader hiện có.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <div id="app">{children}</div>
      </body>
    </html>
  );
}
