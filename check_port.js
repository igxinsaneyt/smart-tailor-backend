const net = require('net');
const host = '3.109.136.255';
const port = 27017;

const client = new net.Socket();
client.setTimeout(5000);

console.log(`Checking TCP connection to ${host}:${port}...`);

client.connect(port, host, () => {
  console.log('SUCCESS: TCP connection established to MongoDB Atlas port 27017');
  client.destroy();
  process.exit(0);
});

client.on('error', (err) => {
  console.error('FAILURE: Could not establish TCP connection');
  console.error(err);
  client.destroy();
  process.exit(1);
});

client.on('timeout', () => {
  console.error('FAILURE: TCP connection timed out after 5 seconds');
  client.destroy();
  process.exit(1);
});
