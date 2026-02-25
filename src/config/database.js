import mysql from 'mysql2/promise';
import { appConfig, databaseConfig } from './env.js';

let connectionPool;

const logSql = (statement, params) => {
  if (!appConfig.enableSqlLogging) {
    return;
  }
  const formattedParams = Array.isArray(params) ? JSON.stringify(params) : String(params);
  // eslint-disable-next-line no-console
  console.debug(`[SQL] ${statement}\n       params: ${formattedParams}`);
};

export const getPool = () => {
  if (!connectionPool) {
    connectionPool = mysql.createPool({
      host: databaseConfig.host,
      port: databaseConfig.port,
      user: databaseConfig.user,
      password: databaseConfig.password,
      database: databaseConfig.database,
      connectionLimit: databaseConfig.connectionLimit,
      connectTimeout: databaseConfig.connectTimeout,
      timezone: '+00:00',
      dateStrings: false,
    });
  }
  return connectionPool;
};

const resolveExecutor = (options = {}) => {
  if (options.connection) {
    return options.connection;
  }
  return getPool();
};

export const query = async (statement, params = [], options = {}) => {
  logSql(statement, params);
  const executor = resolveExecutor(options);
  const [rows] = await executor.execute(statement, params);
  return rows;
};

export const execute = async (statement, params = [], options = {}) => {
  logSql(statement, params);
  const executor = resolveExecutor(options);
  const [result] = await executor.execute(statement, params);
  return result;
};

export const withTransaction = async (handler) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await handler(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
