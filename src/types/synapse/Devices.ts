export type DevicesResponse = {
  devices: Device[],
  total: number
}

export type Device = {
  device_id: string,
  display_name: string,
  last_seen_ip: string,
  last_seen_user_agent: string,
  last_seen_ts: number,
  user_id: string
}