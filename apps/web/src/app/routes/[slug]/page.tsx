import { fetchRouteBySlug, type Route } from "@/lib/api";
import { notFound } from "next/navigation";
import RouteDetailClient from "./client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const route = await fetchRouteBySlug(slug);
    return {
      title: `${route.title} - ${route.duration}天${route.nights}晚`,
      description: route.subtitle,
    };
  } catch {
    return { title: "路线详情" };
  }
}

export default async function RouteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let route: Route | null = null;
  try {
    route = await fetchRouteBySlug(slug);
  } catch {
    notFound();
  }
  if (!route) notFound();

  return <RouteDetailClient route={route} />;
}
