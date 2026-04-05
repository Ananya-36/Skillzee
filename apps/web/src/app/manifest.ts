import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkillSwap",
    short_name: "SkillSwap",
    description: "Where skills create value",
    start_url: "/",
    display: "standalone",
    background_color: "#07111f",
    theme_color: "#0b1220",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml"
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml"
      }
    ]
  };
}
