'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /*
                                                                                                                                                                                                                                                                   * Licensed to Elasticsearch B.V. under one or more contributor
                                                                                                                                                                                                                                                                   * license agreements. See the NOTICE file distributed with
                                                                                                                                                                                                                                                                   * this work for additional information regarding copyright
                                                                                                                                                                                                                                                                   * ownership. Elasticsearch B.V. licenses this file to you under
                                                                                                                                                                                                                                                                   * the Apache License, Version 2.0 (the "License"); you may
                                                                                                                                                                                                                                                                   * not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                   * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                   *    http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                   * Unless required by applicable law or agreed to in writing,
                                                                                                                                                                                                                                                                   * software distributed under the License is distributed on an
                                                                                                                                                                                                                                                                   * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
                                                                                                                                                                                                                                                                   * KIND, either express or implied.  See the License for the
                                                                                                                                                                                                                                                                   * specific language governing permissions and limitations
                                                                                                                                                                                                                                                                   * under the License.
                                                                                                                                                                                                                                                                   */

exports.registerStatsApi = registerStatsApi;

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _boom = require('boom');

var _wrap_auth_config = require('../../wrap_auth_config');

var _constants = require('../../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * API for Kibana meta info and accumulated operations stats
 * Including ?extended in the query string fetches Elasticsearch cluster_uuid and server.usage.collectorSet data
 * - Requests to set isExtended = true
 *      GET /api/stats?extended=true
 *      GET /api/stats?extended
 * - No value or 'false' is isExtended = false
 * - Any other value causes a statusCode 400 response (Bad Request)
 */
function registerStatsApi(kbnServer, server, config) {
  const wrapAuth = (0, _wrap_auth_config.wrapAuthConfig)(config.get('status.allowAnonymous'));
  const { collectorSet } = server.usage;

  const getClusterUuid = async callCluster => {
    const { cluster_uuid: uuid } = await callCluster('info', { filterPath: 'cluster_uuid' });
    return uuid;
  };

  const getUsage = async callCluster => {
    const usage = await collectorSet.bulkFetchUsage(callCluster);
    return collectorSet.toObject(usage);
  };

  server.route(wrapAuth({
    method: 'GET',
    path: '/api/stats',
    config: {
      validate: {
        query: {
          extended: _joi2.default.string().valid('', 'true', 'false')
        }
      },
      tags: ['api']
    },
    async handler(req, reply) {
      const isExtended = req.query.extended !== undefined && req.query.extended !== 'false';

      let extended;
      if (isExtended) {
        const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('admin');
        const callCluster = (...args) => callWithRequest(req, ...args);
        try {
          const [usage, clusterUuid] = await Promise.all([getUsage(callCluster), getClusterUuid(callCluster)]);
          extended = collectorSet.toApiFieldNames({ usage, clusterUuid });
        } catch (e) {
          return reply((0, _boom.boomify)(e));
        }
      }

      /* kibana_stats gets singled out from the collector set as it is used
       * for health-checking Kibana and fetch does not rely on fetching data
       * from ES */
      const kibanaStatsCollector = collectorSet.getCollectorByType(_constants.KIBANA_STATS_TYPE);
      let kibanaStats = await kibanaStatsCollector.fetch();
      kibanaStats = collectorSet.toApiFieldNames(kibanaStats);

      reply(_extends({}, kibanaStats, extended));
    }
  }));
}