import { serializeJsonLd } from "@/lib/seo";

/**
 * Emits schema.org structured data as a native `<script type="application/ld+json">`.
 * `serializeJsonLd` escapes `<` so user-editable fields can't close the tag.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
