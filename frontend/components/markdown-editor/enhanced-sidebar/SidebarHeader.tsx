"use client";

import { SidebarHeader as SidebarHeaderUI } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarHeaderProps {
  baseDir: string;
}

export function SidebarHeader({ baseDir }: SidebarHeaderProps) {
  return (
    <SidebarHeaderUI className="border-b px-4 py-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="MDParadise" className="h-8 w-8" />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs text-muted-foreground truncate cursor-help">
                {baseDir}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-md break-all">{baseDir}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </SidebarHeaderUI>
  );
}
