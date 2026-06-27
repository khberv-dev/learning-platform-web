import {api} from '@/services/api.js'

export async function getStatsSummary() {
    const res = await api.get('stats/summary')
    return res.data
}

export async function getStatsTimeseries({period = 30} = {}) {
    const res = await api.get('stats/timeseries', {params: {period}})
    return res.data
}
