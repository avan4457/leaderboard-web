export interface Stats {
  kill_count: number;
  death_count: number;
}

export interface User {
  id: number;
  username: string;
  stats: Stats;
}
