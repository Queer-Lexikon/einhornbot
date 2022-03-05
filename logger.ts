
export default class Logger {
  log(...args): void {
    console.log(new Date().toISOString(), '[INFO]', ...args);
  }

  error(...args): void {
    console.error(new Date().toISOString(), '[INFO]', ...args);
  }
}