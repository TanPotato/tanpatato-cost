import { cn } from "@/lib/utils";

/** 적는 동안에도 결과가 보이도록 화면 위에 붙어 따라오는 합계. */
export function SummaryStrip({
  cells,
}: {
  cells: { label: string; value: string; negative?: boolean }[];
}) {
  return (
    <dl className="sticky top-0 z-10 grid grid-cols-3 gap-px overflow-hidden rounded-xl border bg-border">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-card px-3 py-2.5">
          <dt className="text-xs text-muted-foreground">{cell.label}</dt>
          <dd
            className={cn(
              "mt-0.5 text-sm font-semibold tracking-tight tabular-nums sm:text-lg",
              cell.negative && "text-destructive"
            )}
          >
            {cell.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
