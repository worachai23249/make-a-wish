const net = require('net');

const client = new net.Socket();
client.setTimeout(5000);

client.connect(16629, 'mysql-3662b866-worachai23249-0056.aivencloud.com', () => {
  console.log('✅ Connected successfully to database server!');
  client.destroy();
});

client.on('error', (err) => {
  console.error('❌ Connection error:', err.message);
  client.destroy();
});

client.on('timeout', () => {
  console.error('❌ Connection timeout');
  client.destroy();
});
