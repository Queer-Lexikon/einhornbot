export type User = {
  name: string,
  displayname?: string,
  threepids: {
    medium: 'email' | string,
    address: string,
    added_at: number,
    validated_at: number
  }[],
  avatar_url?: string,
  is_guest: number,
  admin: number,
  deactivated: number,
  erased: boolean,
  shadow_banned: number,
  creation_ts: number,
  appservice_id: any,
  consent_server_notice_sent: any,
  consent_version: any,
  consent_ts: any,
  external_ids: {
    auth_provider: string,
    external_id: string
  }[],
  user_type: any,
  locked: false
}