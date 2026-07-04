"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LearnView from "./learn-view";

export default function LearnIndexPage() {
  return (
    <Suspense fallback={<div className="app"><main className="main"><div className="loading-spinner"><div className="spinner" /></div></main></div>}>
      <LearnIndexInner />
    </Suspense>
  );
}

function LearnIndexInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // If user visits /learn with ?page=introduction (legacy URL form),
  // redirect to /learn/introduction for clean URL.
  useEffect(() => {
    const page = searchParams.get("page");
    if (page) {
      router.replace(`/learn/${page}`);
    }
  }, [router, searchParams]);

  // No params prop — LearnView falls back to "introduction"
  return <LearnView />;
}
