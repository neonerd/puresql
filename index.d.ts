export type PuresqlQueryParameters = Record<string, any>;

export type PuresqlAdapter = {
  query: <T = any>(query: string) => Promise<T[]>;
  escape: (parameter: unknown) => string;
  escapeIdentifier: (identifier: unknown) => string;
};

export type PuresqlQuery<T = any> = (parameters: PuresqlQueryParameters, adapter: PuresqlAdapter) => Promise<T>;

export function defineQuery<T = any>(sql: string): PuresqlQuery<T>;

export function loadQueries(filePath): Record<string, PuresqlQuery>; 

export const adapters = {
  mysql: (connection: any, debugFn: (msg: string) => void) => PuresqlAdapter,
  sqlite: (connection: any, debugFn: (msg: string) => void) => PuresqlAdapter,
  mssql: (connection: any, debugFn: (msg: string) => void) => PuresqlAdapter,
  pg: (connection: any, debugFn: (msg: string) => void) => PuresqlAdapter,
};
