import type { ReactNode } from "react";

export function PhonePreview({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-[300px] rounded-[2.5rem] border-8 border-foreground/90 bg-background shadow-2xl">
      <div className="h-[600px] overflow-y-auto rounded-[1.8rem]">{children}</div>
    </div>
  );
}
