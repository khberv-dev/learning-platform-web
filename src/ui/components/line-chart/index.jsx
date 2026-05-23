import {LineChart as RLineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid} from 'recharts'

export function LineChart({data, dataKey = 'value', xKey = 'label', height = 220, color = 'var(--it-green)'}) {
    return (
        <div style={{width: '100%', height}}>
            <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={data} margin={{top: 8, right: 8, left: -16, bottom: 0}}>
                    <CartesianGrid stroke="var(--it-border-row)" vertical={false}/>
                    <XAxis dataKey={xKey} stroke="var(--it-text-tertiary)" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis stroke="var(--it-text-tertiary)" fontSize={12} tickLine={false} axisLine={false}/>
                    <Tooltip
                        contentStyle={{
                            background: 'var(--it-surface)',
                            border: '1px solid var(--it-border)',
                            borderRadius: 8,
                            fontSize: 12,
                        }}
                    />
                    <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{r: 3, stroke: color, fill: 'var(--it-surface)'}}/>
                </RLineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default LineChart
