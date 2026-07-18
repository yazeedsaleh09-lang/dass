export function serverLog(event: string, fields: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ service: 'dass', event, at: new Date().toISOString(), ...fields }));
}
