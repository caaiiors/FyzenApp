import React from "react";

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="skeleton h-6 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
      <div className="skeleton h-20 w-full mt-4" />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-4 space-y-2">
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-8 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="glass-card p-6 space-y-3">
      <div className="skeleton h-6 w-1/4 mb-4" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton h-12 flex-1" />
        </div>
      ))}
    </div>
  );
}
