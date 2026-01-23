import httpInstance from "@/utils/http";

export const listAPI = () => {
    return httpInstance({
        url: '/user/ip',
        method: 'GET',
    })
}

export const addRuleAPI = (ip: string, port: string) => {
    return httpInstance({
        url: '/user/ip',
        method: 'POST',
        params: {ip, port}
    })
}

export const deleteRuleAPI = (ip: string, port: string) => {
    return httpInstance({
        url: '/user/ip',
        method: 'DELETE',
        params: {ip, port}
    })
}