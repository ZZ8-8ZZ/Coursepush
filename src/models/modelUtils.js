export const buildUpdateStatement = (payload, columnMap) => {
  const entries = Object.entries(columnMap)
    .filter(([key]) => Object.hasOwn(payload, key) && payload[key] !== undefined)
    .map(([key, column]) => ({ column, value: payload[key] }));

  if (entries.length === 0) {
    throw new Error('未提供可更新的字段');
  }

  const clause = entries.map((entry) => `${entry.column} = ?`).join(', ');
  const values = entries.map((entry) => entry.value);
  return { clause, values };
};

export const mapDbRowToCamelCase = (row) => {
  if (!row || typeof row !== 'object') {
    return row;
  }
  return Object.entries(row).reduce((acc, [key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = value;
    return acc;
  }, {});
};

export const mapRows = (rows) => rows.map(mapDbRowToCamelCase);
