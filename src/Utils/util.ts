import fetch from "node-fetch"

export async function fetchRecommendedShards(token?: string): Promise<number> {
    const headers = {
        'Content-Type': 'application./json',
        'Authorization': `Bot ${token}`,
    }
    const r = await fetch("https://discord.com/api/v8/gateway/bot", { headers, method: "GET" })
    const res = await r.json()
    console.log(res)
    return res.shards
}


export async function delayFor(time: number = 5000) {
    await new Promise((resolve, reject) => setTimeout((e) => resolve(e), time))
}