export interface Media {
  id: number;
  type: "photo" | "video";
  url: string;
  title: string;
  caption: string;
  thumbnail: string;
}
export { api } from "./api";
