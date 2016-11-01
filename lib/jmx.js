/* eslint no-console: 0 */
'use strict';
module.exports = function (config, logger) {
  const jmx     = require("jmx"),
        Promise = require('bluebird');

  function connect(url) {
    return new Promise((resolve, reject) => {
      logger.info('connecting to %s', url);
      const client = jmx.createClient({
        service: url
      }); 
      client.connect();
      client.on("connect", () => {
        logger.debug('connected to %s', url);
        resolve(client);
      });
    });
  }

  function info(client) {
    return new Promise((resolve, reject) => {
      client.getAttribute("akka:type=Cluster", "ClusterStatus", data => {
        resolve(JSON.parse(data));
      });
    });
  }

  function status(client) {
    return new Promise((resolve, reject) => {
      client.getAttribute("akka:type=Cluster", "MemberStatus", data => {
        resolve(data);
      });
    });
  }

  function leave(client) {
    return new Promise((resolve, reject) => {
      info(client).then(info => {
        client.invoke("akka:type=Cluster", "leave", [info['self-address']], data => {
          if (data === null) {
            resolve(`[Left]\t\t${info['self-address']}`);
          } else {
            reject(data);
          }
        });
      });
    });
  }

  return {
    connect: connect,
    info:    info,
    status:  status,
    leave:   leave
  };
};
