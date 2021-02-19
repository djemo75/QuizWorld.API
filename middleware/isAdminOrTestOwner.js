const mysql = require('../database/config');

const isAdminOrTestOwner = async (req, res, next) => {
  const testId = req.params.id || req.params.testId;
  const connection = await mysql.connection();
  if (testId && req.userRole === 'user') {
    try {
      const test = await connection.query('SELECT * FROM tests WHERE id=?', [
        testId,
      ]);
      if (test.length) {
        if (test[0].userId !== req.userId) {
          return res
            .status(403)
            .send({ message: 'Access denied for this test!' });
        } else {
          next();
        }
      } else {
        return res
          .status(404)
          .send({ message: `Not found Test with id ${testId}.` });
      }
    } catch (e) {
      return res.status(500).send();
    } finally {
      await connection.release();
    }
  } else {
    next();
  }
};

module.exports = isAdminOrTestOwner;
