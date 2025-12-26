import React from "react";

export default function Container({ children, className = "" }) {
  return (
<div className={`max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
