const sql = require('mssql/msnodesqlv8');

const dbConfig = {
    connectionString: 'Server=.\\SQLEXPRESS;Database=SchoolTripDB;Trusted_Connection=yes;Driver={ODBC Driver 17 for SQL Server};'
};

const connectDB = async () => {
    await sql.connect(dbConfig);
};

module.exports = { sql, connectDB };
