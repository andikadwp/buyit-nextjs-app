"use client"

import * as React from "react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type Item = {
  label: string
  value: number
  // pakai token chart shadcn biar feel-nya sama: "chart-1".."chart-6"
  // nanti dipetakan ke hsl(var(--chart-x))
  chartToken?: 1 | 2 | 3 | 4 | 5 | 6
}

export function SalesByCategoryRadial({
  data,
  subtitle = "Sales",
}: {
  data: Item[]
  subtitle?: string
}) {
  const cleaned = data
    .map((d) => ({ ...d, value: Number(d.value) || 0 }))
    .filter((d) => d.value > 0)

  const total = cleaned.reduce((s, d) => s + d.value, 0)

  // bikin 1 baris data (shadcn pattern)
  // { metrics: "sales", electronics: 3, gaming: 12, ... }
  const chartData = React.useMemo(() => {
    const row: Record<string, any> = { metrics: "sales" }
    for (const d of cleaned) row[d.label] = d.value
    return [row]
  }, [cleaned])

  // config juga dinamis (shadcn pattern)
  const chartConfig = React.useMemo(() => {
    const cfg: Record<string, any> = {}
    cleaned.forEach((d, i) => {
      const token = d.chartToken ?? (((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6)
      cfg[d.label] = {
        label: d.label,
        color: `var(--chart-${token})`,
      }
    })
    return cfg as ChartConfig
  }, [cleaned])

  if (total <= 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No sales yet
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer
        config={chartConfig}
        className="mx-auto w-full min-h-[100px] max-w-[360px]"   // <-- jangan aspect-square
      >
        <RadialBarChart
          data={chartData}
          width={360}
          height={100}
          cx="50%"
          cy="50%"                 // <-- penting: turunkan center untuk semi
          innerRadius={75}
          outerRadius={150}
          startAngle={180}
          endAngle={0}
          barSize={20}            // <-- tebal segmen lebih konsisten
        >
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

          <PolarRadiusAxis tick={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null
                const cx = viewBox.cx
                const cy = viewBox.cy

                return (
                  <text x={cx} y={cy! - 10} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={cx} y={cy! - 14} className="fill-foreground text-3xl font-bold tabular-nums">
                      {total}
                    </tspan>
                    <tspan x={cx} y={cy! + 10} className="fill-muted-foreground text-sm">
                      {subtitle}
                    </tspan>
                  </text>
                )
              }}
            />
          </PolarRadiusAxis>

          {/* “stacked sections” ala shadcn: banyak RadialBar dengan stackId sama */}
          {cleaned.map((d) => (
            <RadialBar
              key={d.label}
              dataKey={d.label}
              stackId="a"
              cornerRadius={10}
              fill={`var(--color-${d.label})`}
            />
          ))}
        </RadialBarChart>
      </ChartContainer>

      {/* Legend yang jelas (dot warna + angka) */}
      <div className="space-y-2">
        {cleaned
          .slice()
          .sort((a, b) => b.value - a.value)
          .map((d, i) => {
            const token = d.chartToken ?? (((cleaned.findIndex((x) => x.label === d.label) % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6)
            return (
              <div key={d.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: `var(--chart-${token})` }}

                  />
                  <span className="font-medium">{d.label}</span>
                </div>
                <span className="tabular-nums font-medium">{d.value}</span>
              </div>
            )
          })}
      </div>
    </div>
  )
}
