'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createFindRoute = undefined;

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _case_conversion = require('../../../utils/case_conversion');

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

const createFindRoute = exports.createFindRoute = prereqs => ({
  path: '/api/saved_objects/_find',
  method: 'GET',
  config: {
    pre: [prereqs.getSavedObjectsClient],
    validate: {
      query: _joi2.default.object().keys({
        per_page: _joi2.default.number().min(0).default(20),
        page: _joi2.default.number().min(0).default(1),
        type: _joi2.default.array().items(_joi2.default.string()).single(),
        search: _joi2.default.string().allow('').optional(),
        search_fields: _joi2.default.array().items(_joi2.default.string()).single(),
        sort_field: _joi2.default.array().items(_joi2.default.string()).single(),
        fields: _joi2.default.array().items(_joi2.default.string()).single()
      }).default()
    },
    handler(request, reply) {
      const options = (0, _case_conversion.keysToCamelCaseShallow)(request.query);
      reply(request.pre.savedObjectsClient.find(options));
    }
  }
});