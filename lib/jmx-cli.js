/* eslint no-console: 0 */
'use strict';
const bunyan  = require('bunyan'),
      parser  = require('node-options'),
      config  = {
        "url"     : process.env.JMX_URL || 'service:jmx:rmi:///jndi/rmi://localhost:1099/jmxrmi',
        "verbose" : false
      };

const options = parser.parse(process.argv.slice(2), config);
const logger  = bunyan.createLogger({
                  name:  "jmx-cli",
                  level: (config.verbose ? 'DEBUG' : 'WARN')
                });
const jmx = require('./jmx')(config, logger);

switch(options.args[0]) {
  case 'status':
    jmx.connect(config.url).then(jmx.status)
                           .then(console.log);
    break;
  case 'nodes':
    jmx.connect(config.url).then(jmx.info)
                           .then(info => {
                              info.members.forEach(node => {
                                console.log(`[${node.status}]\t\t${node.address==info['self-address']?'*':' '}${node.address}\t${node.roles.join(',')}`);
                              });
                           });
    break;
  case 'leave':
    jmx.connect(config.url).then(jmx.leave)
                           .then(console.log);
    break;
  default:
    console.log('USAGE: jmx-cli {--url=service:jmx:rmi:///jndi/rmi://localhost:1099/jmxrmi} {--verbose} [status|nodes|leave]');
    console.log(`               unknow option '${options.args.join(', ')}'`);
    process.exit(2);
    break;
}
