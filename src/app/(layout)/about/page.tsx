export const metadata = {
  title: "Про нас",
  description: "Інформація про нашу компанію.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Про нас</h1>
      <div className="prose max-w-none text-muted-foreground">
        <p>Інформація про нашу компанію знаходиться в стадії розробки.</p>
      </div>
    </div>
  );
}
