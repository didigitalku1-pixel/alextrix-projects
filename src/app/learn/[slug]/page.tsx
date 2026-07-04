"use client";
import { Suspense } from "react";
import LearnView from "../learn-view";

export default function LearnSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="app"><main className="main"><div className="loading-spinner"><div className="spinner" /></div></main></div>}>
      <LearnView params={params} />
    </Suspense>
  );
}
