'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uiNavLinksMixin = uiNavLinksMixin;

var _ui_nav_link = require('./ui_nav_link');

function uiNavLinksMixin(kbnServer, server, config) {
  const uiApps = server.getAllUiApps();

  const { navLinkSpecs = [] } = kbnServer.uiExports;
  const urlBasePath = config.get('server.basePath');

  const fromSpecs = navLinkSpecs.map(navLinkSpec => new _ui_nav_link.UiNavLink(urlBasePath, navLinkSpec));

  const fromApps = uiApps.map(app => app.getNavLink()).filter(Boolean);

  const uiNavLinks = fromSpecs.concat(fromApps).sort((a, b) => a.getOrder() - b.getOrder());

  server.decorate('server', 'getUiNavLinks', () => uiNavLinks.slice(0));
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