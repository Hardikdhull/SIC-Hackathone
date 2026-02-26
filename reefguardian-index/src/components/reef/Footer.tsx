import { Waves } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="section-container text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Waves className="w-5 h-5 text-primary" />
          <span className="font-display font-semibold text-lg">Reef-Guard</span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          Supporting <span className="text-primary font-medium">SDG 14 — Life Below Water</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Built for the Ocean Conservation Hackathon • © 2026 Reef-Guard Team
        </p>
      </div>
    </footer>
  );
}
