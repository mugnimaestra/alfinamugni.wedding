import { component$, useSignal } from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type ChartData = {
  label: string;
  value: number;
  color?: string;
};

type ChartProps = {
  data: ChartData[];
  type: "bar" | "pie" | "line" | "doughnut";
  width?: number;
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  class?: string;
  title?: string;
};

// Color palette for charts
const defaultColors = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // yellow
  "#EF4444", // red
  "#8B5CF6", // purple
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
  "#EC4899", // pink
  "#6B7280", // gray
];

export const Chart = component$<ChartProps>(
  ({
    data,
    type,
    width = 400,
    height = 300,
    showLabels = true,
    showValues = false,
    class: className,
    title,
  }) => {
    const chartRef = useSignal<HTMLDivElement>();

    // Assign colors to data if not provided
    const dataWithColors = data.map((item, index) => ({
      ...item,
      color: item.color || defaultColors[index % defaultColors.length],
    }));

    const renderBarChart = () => {
      const maxValue = Math.max(...dataWithColors.map((d) => d.value));
      const barWidth = (width - 60) / dataWithColors.length;
      const chartHeight = height - 60;

      return (
        <svg width={width} height={height} class="overflow-visible">
          {/* Title */}
          {title && (
            <text
              x={width / 2}
              y={20}
              text-anchor="middle"
              class="text-lg font-semibold fill-foreground"
            >
              {title}
            </text>
          )}

          {/* Bars */}
          {dataWithColors.map((item, index) => {
            const barHeight = (item.value / maxValue) * (chartHeight - 40);
            const x = 40 + index * barWidth;
            const y = height - 40 - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth * 0.8}
                  height={barHeight}
                  fill={item.color}
                  class="transition-all duration-300 hover:opacity-80"
                  rx="4"
                />
                {showValues && (
                  <text
                    x={x + barWidth * 0.4}
                    y={y - 5}
                    text-anchor="middle"
                    class="text-xs fill-foreground font-medium"
                  >
                    {item.value}
                  </text>
                )}
                {showLabels && (
                  <text
                    x={x + barWidth * 0.4}
                    y={height - 20}
                    text-anchor="middle"
                    class="text-xs fill-muted-foreground"
                    transform={`rotate(-45, ${x + barWidth * 0.4}, ${height - 20})`}
                  >
                    {item.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      );
    };

    const renderPieChart = () => {
      const total = dataWithColors.reduce((sum, item) => sum + item.value, 0);
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 40;

      let currentAngle = -Math.PI / 2; // Start from top

      return (
        <svg width={width} height={height} class="overflow-visible">
          {/* Title */}
          {title && (
            <text
              x={width / 2}
              y={20}
              text-anchor="middle"
              class="text-lg font-semibold fill-foreground"
            >
              {title}
            </text>
          )}

          {/* Pie slices */}
          {dataWithColors.map((item, index) => {
            const angle = (item.value / total) * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            // Calculate path for pie slice
            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const largeArcFlag = angle > Math.PI ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              "Z",
            ].join(" ");

            currentAngle = endAngle;

            // Calculate label position
            const labelAngle = startAngle + angle / 2;
            const labelX = centerX + (radius + 20) * Math.cos(labelAngle);
            const labelY = centerY + (radius + 20) * Math.sin(labelAngle);

            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={item.color}
                  class="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  stroke="white"
                  stroke-width="2"
                />
                {showLabels && (
                  <text
                    x={labelX}
                    y={labelY}
                    text-anchor={labelX > centerX ? "start" : "end"}
                    dominant-baseline="middle"
                    class="text-xs fill-foreground font-medium"
                  >
                    {item.label}
                  </text>
                )}
                {showValues && (
                  <text
                    x={centerX + radius * 0.5 * Math.cos(labelAngle)}
                    y={centerY + radius * 0.5 * Math.sin(labelAngle)}
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="text-xs fill-white font-bold"
                  >
                    {Math.round((item.value / total) * 100)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      );
    };

    const renderLineChart = () => {
      const maxValue = Math.max(...dataWithColors.map((d) => d.value));
      const chartWidth = width - 80;
      const chartHeight = height - 80;
      const points = dataWithColors
        .map((item, index) => {
          const x = 40 + (index / (dataWithColors.length - 1)) * chartWidth;
          const y = height - 40 - (item.value / maxValue) * chartHeight;
          return `${x},${y}`;
        })
        .join(" ");

      return (
        <svg width={width} height={height} class="overflow-visible">
          {/* Title */}
          {title && (
            <text
              x={width / 2}
              y={20}
              text-anchor="middle"
              class="text-lg font-semibold fill-foreground"
            >
              {title}
            </text>
          )}

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <line
              key={index}
              x1="40"
              y1={height - 40 - ratio * chartHeight}
              x2={width - 40}
              y2={height - 40 - ratio * chartHeight}
              stroke="#E5E7EB"
              stroke-width="1"
              opacity="0.5"
            />
          ))}

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={dataWithColors[0]?.color || defaultColors[0]}
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          {/* Data points */}
          {dataWithColors.map((item, index) => {
            const x = 40 + (index / (dataWithColors.length - 1)) * chartWidth;
            const y = height - 40 - (item.value / maxValue) * chartHeight;

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="6"
                fill={item.color}
                stroke="white"
                stroke-width="2"
                class="transition-all duration-300 hover:r-8"
              />
            );
          })}

          {/* Labels */}
          {showLabels &&
            dataWithColors.map((item, index) => {
              const x = 40 + (index / (dataWithColors.length - 1)) * chartWidth;

              return (
                <text
                  key={index}
                  x={x}
                  y={height - 20}
                  text-anchor="middle"
                  class="text-xs fill-muted-foreground"
                >
                  {item.label}
                </text>
              );
            })}

          {/* Values */}
          {showValues &&
            dataWithColors.map((item, index) => {
              const x = 40 + (index / (dataWithColors.length - 1)) * chartWidth;
              const y = height - 40 - (item.value / maxValue) * chartHeight;

              return (
                <text
                  key={index}
                  x={x}
                  y={y - 15}
                  text-anchor="middle"
                  class="text-xs fill-foreground font-medium"
                >
                  {item.value}
                </text>
              );
            })}
        </svg>
      );
    };

    const renderChart = () => {
      switch (type) {
        case "bar":
          return renderBarChart();
        case "pie":
        case "doughnut":
          return renderPieChart();
        case "line":
          return renderLineChart();
        default:
          return (
            <div class="flex items-center justify-center h-full text-muted-foreground">
              Chart type not supported
            </div>
          );
      }
    };

    return (
      <div
        ref={chartRef}
        class={cn("relative", className)}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {renderChart()}
      </div>
    );
  }
);

// Wedding-specific chart components
type RSVPChartProps = {
  attending: number;
  pending: number;
  declined: number;
  class?: string;
};

export const RSVPChart = component$<RSVPChartProps>(
  ({ attending, pending, declined, class: className }) => {
    const data = [
      { label: "Attending", value: attending, color: "#10B981" },
      { label: "Pending", value: pending, color: "#F59E0B" },
      { label: "Declined", value: declined, color: "#EF4444" },
    ];

    return (
      <Chart
        data={data}
        type="pie"
        width={300}
        height={300}
        showLabels={true}
        showValues={true}
        title="RSVP Status"
        class={className}
      />
    );
  }
);

type BudgetChartProps = {
  spent: number;
  remaining: number;
  class?: string;
};

export const BudgetChart = component$<BudgetChartProps>(
  ({ spent, remaining, class: className }) => {
    const data = [
      { label: "Spent", value: spent, color: "#EF4444" },
      { label: "Remaining", value: remaining, color: "#10B981" },
    ];

    return (
      <Chart
        data={data}
        type="doughnut"
        width={250}
        height={250}
        showLabels={true}
        showValues={true}
        title="Budget Overview"
        class={className}
      />
    );
  }
);

type TimelineChartProps = {
  data: Array<{ date: string; guests: number }>;
  class?: string;
};

export const TimelineChart = component$<TimelineChartProps>(
  ({ data, class: className }) => {
    const chartData = data.map((item) => ({
      label: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: item.guests,
    }));

    return (
      <Chart
        data={chartData}
        type="line"
        width={400}
        height={250}
        showLabels={true}
        showValues={true}
        title="RSVP Timeline"
        class={className}
      />
    );
  }
);
