'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Collector = undefined;

var _lib = require('../lib');

class Collector {
  /*
   * @param {Object} server - server object
   * @param {String} options.type - property name as the key for the data
   * @param {Function} options.init (optional) - initialization function
   * @param {Function} options.fetch - function to query data
   */
  constructor(server, { type, init, fetch } = {}) {
    if (type === undefined) {
      throw new Error('Collector must be instantiated with a options.type string property');
    }
    if (typeof fetch !== 'function') {
      throw new Error('Collector must be instantiated with a options.fetch function property');
    }

    this.type = type;
    this.init = init;
    this.fetch = fetch;

    this.log = (0, _lib.getCollectorLogger)(server);
  }

  fetchInternal(callCluster) {
    if (typeof callCluster !== 'function') {
      throw new Error('A `callCluster` function must be passed to the fetch methods of collectors');
    }
    return this.fetch(callCluster);
  }
}
exports.Collector = Collector; /*
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