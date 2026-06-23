const defaultSiteUrl = "https://ultimate-question-builder.vercel.app";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl).replace(/\/+$/, "");

export const siteMetadata = {
  name: "RealQuestion",
  title: "RealQuestion - AI에게 물어보는 궁극의 질문",
  description: "처음 떠올린 질문을 AI가 더 깊게 답할 수밖에 없는 궁극의 질문으로 바꿔주는 도구입니다.",
  url: siteUrl,
  openGraphImage: {
    path: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "RealQuestion이 궁극의 질문을 만들어주는 화면"
  }
} as const;
