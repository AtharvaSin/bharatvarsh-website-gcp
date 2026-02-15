
const { Client } = require('pg');

async function testConnection() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'bharatvarsh',
        password: 'bharatvarshdb',
        port: 5433,
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully!');

        console.log('Fetching users...');
        const res = await client.query('SELECT id, name, email, role, "createdAt" FROM "User"');
        console.log('--- Users ---');
        console.table(res.rows);

    } catch (err) {
        console.error('Connection error:', err.stack);

        console.log('Trying with password "postgres"...');
        const client2 = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'bharatvarsh',
            password: 'postgres',
            port: 5433,
        });
        try {
            await client2.connect();
            console.log('Connected successfully with "postgres" password!');
            const res = await client2.query('SELECT id, name, email, role, "createdAt" FROM "User"');
            console.table(res.rows);
            await client2.end();
        } catch (err2) {
            console.error('Second attempt failed:', err2.stack);
        }
    } finally {
        try { await client.end(); } catch (e) { }
    }
}

testConnection();
