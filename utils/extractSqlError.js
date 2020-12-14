const extractSqlError = (error) => {
  return {
    message: error?.sqlMessage || 'SQL ERROR',
  };
};

module.exports = extractSqlError;
