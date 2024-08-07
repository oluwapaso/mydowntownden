import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.NEXT_PUBLIC_DB_HOST,
    user: process.env.NEXT_PUBLIC_DB_USER,
    password: process.env.NEXT_PUBLIC_DB_PWORD,
    database: process.env.NEXT_PUBLIC_DB_NAME,
    waitForConnections: true,
    connectionLimit: 250,
    port: 3306,
    queueLimit: 0,
})

export default pool