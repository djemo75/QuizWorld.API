const extractSqlError = (error) => {
  return {
    message: error?.sqlMessage ? error.sqlMessage : error ? error : 'SQL ERROR',
  };
};

module.exports = extractSqlError;
