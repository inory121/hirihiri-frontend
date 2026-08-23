export enum MESSAGE_API {
  UNREAD = '/message/unread',
  SESSIONS = '/message/sessions',
  CREATE_SESSION = '/message/session/private',
  SESSION_MESSAGES = '/message/session',
  SEND_PRIVATE = '/message/private/send',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  SESSION_READ = '/message/session',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  DELETE_SESSION = '/message/session',
  NOTICES = '/message/notices',
  NOTICE_READ = '/message/notice',
  NOTICE_READ_ALL = '/message/notice/read-all',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  NOTICE_DELETE = '/message/notice',
}
