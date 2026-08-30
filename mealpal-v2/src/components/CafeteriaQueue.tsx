import { Clock, Users } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Cafeteria } from "@/lib/mock-data";

interface CafeteriaQueueProps {
  cafeteria: Cafeteria;
}

export function CafeteriaQueue({ cafeteria }: CafeteriaQueueProps) {
  return (
    <div className="flex gap-3 p-3 bg-card rounded-xl border border-border min-w-[240px]">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <Image src={cafeteria.image} alt={cafeteria.name} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-foreground truncate">{cafeteria.name}</h4>
          <Badge variant={cafeteria.isOpen ? "default" : "secondary"} className="text-[9px] h-5">
            {cafeteria.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {cafeteria.queueLength} in queue
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            ~{cafeteria.waitTime} min
          </span>
        </div>
      </div>
    </div>
  );
}
