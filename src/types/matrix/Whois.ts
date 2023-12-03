export type WhoisResponse = {
  user_id: string,
  devices: {
    '': {
      sessions: { connections: Connection[] }[]
    }
  }
}

export type Connection = {
  ip: string,
  last_seen: number,
  user_agent: string
}
