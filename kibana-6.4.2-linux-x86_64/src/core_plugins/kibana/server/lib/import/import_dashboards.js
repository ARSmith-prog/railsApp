'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importDashboards = importDashboards;

var _lodash = require('lodash');

async function importDashboards(req) {
  const { payload } = req;
  const overwrite = 'force' in req.query && req.query.force !== false;
  const exclude = (0, _lodash.flatten)([req.query.exclude]);

  const savedObjectsClient = req.getSavedObjectsClient();

  const docs = payload.objects.filter(item => !exclude.includes(item.type));

  const results = await savedObjectsClient.bulkCreate(docs, { overwrite });
  return { objects: results.saved_objects };
} /*
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