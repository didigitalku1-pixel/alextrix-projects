"use client";
import SlugDetail from "@/components/slug-detail";
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <SlugDetail params={params} type="component" />;
}
