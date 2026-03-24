import { JsonLdHome } from "@/components/JsonLdHome";
import HomePage from "@/components/HomePage";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <JsonLdHome locale={locale} />
      <HomePage />
    </>
  );
}
