const dns = require('dns').promises;
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

async function test() {
  try {
    const shards = [
        'cluster0-shard-00-00.jx3mhi4.mongodb.net',
        'cluster0-shard-00-01.jx3mhi4.mongodb.net',
        'cluster0-shard-00-02.jx3mhi4.mongodb.net'
    ];
    for (const host of shards) {
        console.log(`Testing resolution for ${host}...`);
        try {
            const addresses = await dns.resolve4(host);
            console.log(`Resolved ${host} to:`, addresses);
        } catch (e) {
            console.log(`Failed to resolve ${host}:`, e.message);
        }
    }
    
    console.log('\nTesting SRV for the SRV string...');
    const srv = await dns.resolveSrv('_mongodb._tcp.cluster0.jx3mhi4.mongodb.net');
    console.log('SRV Result:', JSON.stringify(srv, null, 2));

  } catch (err) {
    console.error('ERROR:', err);
  }
}

test();
