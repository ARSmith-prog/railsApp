'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.netflowSpecProvider = netflowSpecProvider;

var _tutorial_category = require('../../../common/tutorials/tutorial_category');

var _on_prem = require('./on_prem');

var _elastic_cloud = require('./elastic_cloud');

var _on_prem_elastic_cloud = require('./on_prem_elastic_cloud');

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

function netflowSpecProvider() {
  return {
    id: 'netflow',
    name: 'Netflow',
    category: _tutorial_category.TUTORIAL_CATEGORY.SECURITY,
    shortDescription: 'Collect Netflow records sent by a Netflow exporter.',
    longDescription: 'The Logstash Netflow module collects and parses network flow data, ' + ' indexes the events into Elasticsearch, and installs a suite of Kibana dashboards.' + ' This module support Netflow Version 5 and 9.' + ' [Learn more]({config.docs.logstash}/netflow-module.html).',
    artifacts: {
      dashboards: [{
        id: '653cf1e0-2fd2-11e7-99ed-49759aed30f5', // Taken from https://github.com/elastic/logstash/blob/master/modules/netflow/configuration/kibana/6.x/dashboard/653cf1e0-2fd2-11e7-99ed-49759aed30f5.json
        linkLabel: 'Netflow: Overview dashboard',
        isOverview: true
      }]
    },
    completionTimeMinutes: 10,
    //previewImagePath: 'kibana-apache.png', TODO
    onPrem: _on_prem.ON_PREM_INSTRUCTIONS,
    elasticCloud: _elastic_cloud.ELASTIC_CLOUD_INSTRUCTIONS,
    onPremElasticCloud: _on_prem_elastic_cloud.ON_PREM_ELASTIC_CLOUD_INSTRUCTIONS
  };
}