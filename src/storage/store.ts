// Deliberately shared by Expo SQLite and real node:sqlite tests.
export interface SQL {
  execSync(sql: string): void;
  runSync(sql: string, ...params: (string | number | null)[]): unknown;
  getFirstSync<T>(sql: string, ...params: (string | number | null)[]): T | null;
  getAllSync<T>(sql: string, ...params: (string | number | null)[]): T[];
}
export class Store {
  constructor(private db: SQL) {
    db.execSync('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT NOT NULL);');
  }
  read<T>(key: string): T | null {
    const row = this.db.getFirstSync<{ value: string }>('SELECT value FROM kv WHERE key=?', key);
    return row ? JSON.parse(row.value) as T : null;
  }
  commit(key: string, value: unknown, event?: unknown) {
    this.db.execSync('BEGIN IMMEDIATE');
    try {
      this.db.runSync('INSERT INTO kv(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', key, JSON.stringify(value));
      if (event) this.db.runSync('INSERT INTO events(value) VALUES(?)', JSON.stringify(event));
      this.db.execSync('DELETE FROM events WHERE seq <= (SELECT COALESCE(MAX(seq),0)-10000 FROM events); COMMIT');
    } catch (error) { this.db.execSync('ROLLBACK'); throw error; }
  }
  events() { return this.db.getAllSync<{ seq: number; value: string }>('SELECT seq,value FROM events ORDER BY seq').map(r => ({ seq: r.seq, ...JSON.parse(r.value) })); }
  clearLogs() { this.db.execSync('DELETE FROM events'); }
}
