const dns = require('dns');
dns.resolveSrv('_mongodb._tcp.cluster0.jx3mhi4.mongodb.net', (err, addresses) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(JSON.stringify(addresses, null, 2));
});
