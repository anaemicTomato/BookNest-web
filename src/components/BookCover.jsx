import "./BookCover.css";

const PALETTE = ["#03A9E0", "#15C9AA", "#4DB6AC", "#1190FF", "#E9CF4A", "#7FD6C2"];

// Placeholder cover. The color comes from the book's id, so a book always keeps its color.
export default function BookCover({ seed = 0, width = "100%", height = 110 }) {
  return (
    <div
      className="book-cover"
      style={{ background: PALETTE[seed % PALETTE.length], width, height }}
      aria-hidden="true"
    />
  );
}