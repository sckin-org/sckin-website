import { notFound } from "next/navigation";

/**
 * Catch-all for unmatched paths *within* a locale. Middleware rewrites an
 * unknown URL like `/nonesuch` to `/en/nonesuch`; without this, that resolves
 * to Next's global not-found, which — since the app's only root layout lives
 * under `[locale]` — would render without the site header/footer. Routing the
 * miss through this page calls `notFound()`, so it renders `[locale]/not-found`
 * inside the locale layout, chrome intact. Real routes take priority over this
 * catch-all.
 */
export default function CatchAllNotFound() {
  notFound();
}
