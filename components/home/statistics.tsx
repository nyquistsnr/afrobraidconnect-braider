import type { Dictionary } from "@/app/[lang]/dictionaries";

export function Statistics({ dict }: { dict: Dictionary["home"] }) {
  return (
    <section className="py-20 bg-brand text-primary-foreground border-y border-border">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-primary-foreground/20">
          {dict.statistics.stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center py-4 md:py-0">
              <span className="text-4xl md:text-5xl font-black mb-2">{stat.value}</span>
              <span className="text-lg font-medium text-primary-foreground/80 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
