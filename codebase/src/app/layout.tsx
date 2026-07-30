import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VLearn · Học liệu & Trợ lý học tập",
  description:
    "Không gian học tập VLearn: đọc slide, và tạo câu hỏi trắc nghiệm ôn tập cùng VLearn Tutor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="bg-surface-sunken text-brand-800 antialiased">{children}</body>
    </html>
  );
}
