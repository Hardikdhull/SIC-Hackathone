import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart3, Activity } from "lucide-react";
import type { Sector } from "@/hooks/useReefGrid";

interface DataVisualizationProps {
  grid: number[][];
  sortedSectors: Sector[];
  hasSorted: boolean;
  stats: {
    avg: number;
    mostCritical: { row: number; col: number; value: number };
    distribution: Record<string, number>;
  } | null;
}

const DIST_COLORS = ["#e84855", "#f9a03f", "#3a86a5", "#2db87d", "#19b4a0"];

export default function DataVisualization({ grid, sortedSectors, hasSorted, stats }: DataVisualizationProps) {
  if (!stats || grid.length === 0) return null;

  const worst10 = hasSorted
    ? sortedSectors.slice(0, 10).map((s, i) => ({
        name: `[${s.row},${s.col}]`,
        health: s.health,
      }))
    : [];

  const distData = [
    { name: "Critical", value: stats.distribution.critical, color: DIST_COLORS[0] },
    { name: "Warning", value: stats.distribution.warning, color: DIST_COLORS[1] },
    { name: "Moderate", value: stats.distribution.moderate, color: DIST_COLORS[2] },
    { name: "Healthy", value: stats.distribution.healthy, color: DIST_COLORS[3] },
    { name: "Pristine", value: stats.distribution.pristine, color: DIST_COLORS[4] },
  ];

  return (
    <section className="py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 text-gradient-ocean">
            Data Visualization
          </h2>
        </motion.div>

        {/* Stats Panel */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Average Reef Health", value: `${stats.avg}/100`, icon: Activity },
            { label: "Most Critical Zone", value: `[${stats.mostCritical.row}, ${stats.mostCritical.col}]`, icon: BarChart3 },
            { label: "Critical Score", value: stats.mostCritical.value, icon: BarChart3 },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <s.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-display font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Bar chart */}
          {worst10.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="glass-card p-6"
            >
              <h3 className="font-display font-semibold mb-4">Worst 10 Sectors</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={worst10}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(200 20% 55%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(200 20% 55%)", fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(210 60% 10%)",
                      border: "1px solid hsl(210 40% 18%)",
                      borderRadius: "8px",
                      color: "hsl(190 60% 92%)",
                    }}
                  />
                  <Bar dataKey="health" radius={[4, 4, 0, 0]}>
                    {worst10.map((_, i) => (
                      <Cell key={i} fill={i < 3 ? "#e84855" : i < 6 ? "#f9a03f" : "#3a86a5"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Pie chart */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass-card p-6"
          >
            <h3 className="font-display font-semibold mb-4">Health Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {distData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(210 60% 10%)",
                    border: "1px solid hsl(210 40% 18%)",
                    borderRadius: "8px",
                    color: "hsl(190 60% 92%)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
