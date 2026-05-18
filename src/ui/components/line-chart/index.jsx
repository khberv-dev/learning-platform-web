import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

export default function LineChart({data, dataKey = 'value', xKey = 'label', height = 240, color = '#18C96A'}) {
    return (
        <div style={{width: '100%', height}}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{top: 12, right: 8, left: 0, bottom: 0}}>
                    <defs>
                        <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.25}/>
                            <stop offset="100%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#F3F4F6" vertical={false}/>
                    <XAxis
                        dataKey={xKey}
                        tickLine={false}
                        axisLine={false}
                        tick={{fontSize: 11, fill: '#9CA3AF'}}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{fontSize: 11, fill: '#9CA3AF'}}
                        width={32}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: 8,
                            border: '1px solid var(--it-border)',
                            fontSize: 12,
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2.5}
                        fill="url(#lc-fill)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
