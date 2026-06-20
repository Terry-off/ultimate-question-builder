import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ultimate Question Builder",
  description: "평범한 질문을 AI가 깊게 사고할 수밖에 없는 궁극 질문으로 바꿉니다."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
