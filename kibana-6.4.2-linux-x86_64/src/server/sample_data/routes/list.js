'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createListRoute = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _create_index_name = require('./lib/create_index_name');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
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

const NOT_INSTALLED = 'not_installed';
const INSTALLED = 'installed';
const UNKNOWN = 'unknown';

const createListRoute = exports.createListRoute = () => ({
  path: '/api/sample_data',
  method: 'GET',
  config: {
    handler: async (request, reply) => {
      const { callWithRequest } = request.server.plugins.elasticsearch.getCluster('data');

      const sampleDatasets = request.server.getSampleDatasets().map(sampleDataset => {
        return {
          id: sampleDataset.id,
          name: sampleDataset.name,
          description: sampleDataset.description,
          previewImagePath: sampleDataset.previewImagePath,
          overviewDashboard: sampleDataset.overviewDashboard,
          defaultIndex: sampleDataset.defaultIndex
        };
      });

      const isInstalledPromises = sampleDatasets.map(async sampleDataset => {
        const index = (0, _create_index_name.createIndexName)(request.server, sampleDataset.id);
        try {
          const indexExists = await callWithRequest(request, 'indices.exists', { index: index });
          if (!indexExists) {
            sampleDataset.status = NOT_INSTALLED;
            return;
          }

          const { count } = await callWithRequest(request, 'count', { index: index });
          if (count === 0) {
            sampleDataset.status = NOT_INSTALLED;
            return;
          }
        } catch (err) {
          sampleDataset.status = UNKNOWN;
          sampleDataset.statusMsg = err.message;
          return;
        }

        try {
          await request.getSavedObjectsClient().get('dashboard', sampleDataset.overviewDashboard);
        } catch (err) {
          // savedObjectClient.get() throws an boom error when object is not found.
          if (_lodash2.default.get(err, 'output.statusCode') === 404) {
            sampleDataset.status = NOT_INSTALLED;
            return;
          }

          sampleDataset.status = UNKNOWN;
          sampleDataset.statusMsg = err.message;
          return;
        }

        sampleDataset.status = INSTALLED;
      });

      await Promise.all(isInstalledPromises);
      reply(sampleDatasets);
    }
  }
});