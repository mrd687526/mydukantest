import React from "react";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

interface ProductReviewsProps {
  reviews: Review[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < rating ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

export default function ProductReviews({ reviews }: ProductReviewsProps) {
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
      {avgRating && (
        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={Math.round(Number(avgRating))} />
          <span className="text-gray-600">{avgRating} / 5</span>
          <span className="text-gray-400">({reviews.length} reviews)</span>
        </div>
      )}
      {reviews.length === 0 ? (
        <div className="text-gray-500 mb-4">No reviews yet. Be the first to review this product!</div>
      ) : (
        <ul className="space-y-4 mb-6">
          {reviews.map((r) => (
            <li key={r.id} className="border-b pb-2">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={r.rating} />
                <span className="font-medium">{r.name}</span>
                <span className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</span>
              </div>
              <div className="text-gray-700">{r.comment}</div>
            </li>
          ))}
        </ul>
      )}
      {/* Placeholder for review submission form */}
      <div className="bg-gray-50 p-4 rounded">
        <div className="text-gray-400 italic text-sm">Review submission coming soon...</div>
      </div>
    </section>
  );
} 