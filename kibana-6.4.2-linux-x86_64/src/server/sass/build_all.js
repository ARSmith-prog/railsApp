'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildAll = buildAll;

var _build = require('./build');

var _ui_exports = require('../../ui/ui_exports');

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

function buildAll(enabledPluginSpecs, { onSuccess, onError }) {
  const { uiAppSpecs = [] } = (0, _ui_exports.collectUiExports)(enabledPluginSpecs);

  return Promise.all(uiAppSpecs.reduce((acc, uiAppSpec) => {
    if (!uiAppSpec.styleSheetPath) {
      return acc;
    }

    const builder = new _build.Build(uiAppSpec.styleSheetPath, {
      onSuccess,
      onError
    });

    return [...acc, builder.build()];
  }, []));
}