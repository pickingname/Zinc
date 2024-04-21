"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [item, setItem] = useState<string | null>(null);

  useEffect(() => {
    // Perform localStorage action
    const storedItem = localStorage.getItem("app-theme");
    if (storedItem) {
      setItem(storedItem);
    }
  }, []);

  return <p>{item}</p>;
}