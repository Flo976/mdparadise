"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Server } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Instance {
  port: number;
  baseDir: string;
  url: string;
  isCurrent: boolean;
}

export function InstanceSwitcher() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const response = await fetch('/api/instances');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Adapt URLs to use the current hostname instead of localhost
            const currentHostname = window.location.hostname;
            const currentProtocol = window.location.protocol;

            const adaptedInstances = data.instances.map((instance: Instance) => ({
              ...instance,
              url: `${currentProtocol}//${currentHostname}:${instance.port}`
            }));

            setInstances(adaptedInstances);
          }
        }
      } catch (error) {
        console.error('Failed to fetch instances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();

    // Refresh instances every 10 seconds
    const interval = setInterval(fetchInstances, 10000);
    return () => clearInterval(interval);
  }, []);

  // Don't show if there's only one instance or still loading
  if (loading || instances.length <= 1) {
    return null;
  }

  return (
    <div className="mt-auto">
      <Separator className="my-2" />
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
          <Server className="h-3 w-3" />
          <span>Instances actives ({instances.length})</span>
        </div>
        <div className="space-y-1">
          {instances.map((instance) => (
            <a
              key={instance.port}
              href={instance.url}
              target={instance.isCurrent ? undefined : "_blank"}
              rel={instance.isCurrent ? undefined : "noopener noreferrer"}
              className={`
                flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs
                transition-colors
                ${instance.isCurrent
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                }
              `}
              onClick={(e) => {
                if (instance.isCurrent) {
                  e.preventDefault();
                }
              }}
            >
              <div className="flex flex-col min-w-0 flex-1">
                {instance.baseDir ? (
                  <>
                    <span className="truncate font-medium">
                      {instance.baseDir.split('/').filter(Boolean).pop() || 'root'}
                      {instance.isCurrent && " ✓"}
                    </span>
                    <span className="truncate text-[10px] opacity-70 font-mono">
                      :{instance.port}
                    </span>
                  </>
                ) : (
                  <span className="truncate font-mono">
                    :{instance.port}
                    {instance.isCurrent && " (actuel)"}
                  </span>
                )}
              </div>
              {!instance.isCurrent && (
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
