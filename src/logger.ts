
export default class Logger {
  log(...args: any[]): void {
    console.log(new Date().toISOString(), '[INFO]', ...args);
  }

  error(...args: any[]): void {
    console.error(new Date().toISOString(), '[INFO]', ...args);
  }
}