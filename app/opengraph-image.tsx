import { ImageResponse } from "next/og";
import { siteMetadata } from "@/lib/siteMetadata";

export const alt = siteMetadata.openGraphImage.alt;
export const size = {
  width: siteMetadata.openGraphImage.width,
  height: siteMetadata.openGraphImage.height
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #05070a 0%, #111820 52%, #040608 100%)",
          color: "#f8fbff",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            opacity: 0.42
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            right: -120,
            top: -130,
            display: "flex",
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(114,247,255,0.36) 0%, rgba(24,220,233,0.16) 42%, rgba(24,220,233,0) 72%)",
            filter: "blur(2px)"
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            left: -110,
            bottom: -140,
            display: "flex",
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(114,247,255,0.11) 38%, rgba(114,247,255,0) 72%)"
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18
            }}
          >
            <div
              style={{
                width: 66,
                height: 66,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 20,
                border: "1px solid rgba(114,247,255,0.62)",
                background: "linear-gradient(135deg, rgba(114,247,255,0.24), rgba(255,255,255,0.08))",
                boxShadow: "0 20px 80px rgba(24,220,233,0.32)",
                color: "#72f7ff",
                fontSize: 26,
                fontWeight: 900
              }}
            >
              RQ
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{ fontSize: 30, fontWeight: 900, color: "#ffffff" }}>{siteMetadata.name}</div>
              <div style={{ marginTop: 4, fontSize: 17, fontWeight: 800, color: "rgba(248,251,255,0.62)" }}>
                AI 질문을 더 깊게 만드는 콘솔
              </div>
            </div>
          </div>

          <div
            style={{
              width: 760,
              display: "flex",
              flexDirection: "column",
              gap: 18
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: 250,
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid rgba(114,247,255,0.36)",
                background: "rgba(7,10,14,0.62)",
                color: "#72f7ff",
                fontSize: 16,
                fontWeight: 900
              }}
            >
              궁극의 질문 생성
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 58,
                fontWeight: 900,
                lineHeight: 1.08,
                color: "#ffffff",
                letterSpacing: 0
              }}
            >
              처음 질문을 AI가 답하고 싶게 바꿉니다
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 660,
                color: "rgba(248,251,255,0.72)",
                fontSize: 24,
                fontWeight: 800,
                lineHeight: 1.45
              }}
            >
              짧게, 깊게, 전문가처럼 물어볼 수 있는 최종 질문을 만들어보세요.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "flex-end"
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10
              }}
            >
              {["질문 읽기", "맥락 찾기", "최종 문장"].map((label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    padding: "11px 15px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(248,251,255,0.78)",
                    fontSize: 16,
                    fontWeight: 800
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                color: "#72f7ff",
                fontSize: 18,
                fontWeight: 900
              }}
            >
              {siteMetadata.url.replace("https://", "")}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
