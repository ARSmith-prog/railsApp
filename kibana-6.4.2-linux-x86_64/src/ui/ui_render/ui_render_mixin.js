'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uiRenderMixin = uiRenderMixin;

var _lodash = require('lodash');

var _bluebird = require('bluebird');

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _path = require('path');

var _bootstrap = require('./bootstrap');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function uiRenderMixin(kbnServer, server, config) {

  function replaceInjectedVars(request, injectedVars) {
    const { injectedVarsReplacers = [] } = kbnServer.uiExports;

    return (0, _bluebird.reduce)(injectedVarsReplacers, async (acc, replacer) => await replacer(acc, request, kbnServer.server), injectedVars);
  }

  let defaultInjectedVars = {};
  kbnServer.afterPluginsInit(() => {
    const { defaultInjectedVarProviders = [] } = kbnServer.uiExports;
    defaultInjectedVars = defaultInjectedVarProviders.reduce((allDefaults, { fn, pluginSpec }) => (0, _lodash.defaults)(allDefaults, fn(kbnServer.server, pluginSpec.readConfigValue(kbnServer.config, []))), {});
  });

  // render all views from ./views
  server.setupViews((0, _path.resolve)(__dirname, 'views'));

  server.route({
    path: '/bundles/app/{id}/bootstrap.js',
    method: 'GET',
    config: { auth: false },
    async handler(request, reply) {
      try {
        const { id } = request.params;
        const app = server.getUiAppById(id) || server.getHiddenUiAppById(id);
        if (!app) {
          throw _boom2.default.notFound(`Unknown app: ${id}`);
        }

        const basePath = config.get('server.basePath');
        const bootstrap = new _bootstrap.AppBootstrap({
          templateData: {
            appId: app.getId(),
            bundlePath: `${basePath}/bundles`,
            styleSheetPath: app.getStyleSheetUrlPath() ? `${basePath}/${app.getStyleSheetUrlPath()}` : null
          },
          translations: await request.getUiTranslations()
        });

        const body = await bootstrap.getJsFile();
        const etag = await bootstrap.getJsFileHash();

        reply(body).header('cache-control', 'must-revalidate').header('content-type', 'application/javascript').etag(etag);
      } catch (err) {
        reply(err);
      }
    }
  });

  server.route({
    path: '/app/{id}',
    method: 'GET',
    async handler(req, reply) {
      const id = req.params.id;
      const app = server.getUiAppById(id);
      if (!app) return reply(_boom2.default.notFound('Unknown app ' + id));

      try {
        if (kbnServer.status.isGreen()) {
          await reply.renderApp(app);
        } else {
          await reply.renderStatusPage();
        }
      } catch (err) {
        reply(_boom2.default.wrap(err));
      }
    }
  });

  async function getLegacyKibanaPayload({ app, request, includeUserProvidedConfig, injectedVarsOverrides }) {
    const uiSettings = request.getUiSettingsService();
    const translations = await request.getUiTranslations();

    return {
      app: app,
      bundleId: `app:${app.getId()}`,
      nav: server.getUiNavLinks(),
      version: kbnServer.version,
      branch: config.get('pkg.branch'),
      buildNum: config.get('pkg.buildNum'),
      buildSha: config.get('pkg.buildSha'),
      basePath: config.get('server.basePath'),
      serverName: config.get('server.name'),
      devMode: config.get('env.dev'),
      translations: translations,
      uiSettings: await (0, _bluebird.props)({
        defaults: uiSettings.getDefaults(),
        user: includeUserProvidedConfig && uiSettings.getUserProvided()
      }),
      vars: await replaceInjectedVars(request, (0, _lodash.defaults)(injectedVarsOverrides, (await server.getInjectedUiAppVars(app.getId())), defaultInjectedVars))
    };
  }

  async function renderApp({ app, reply, includeUserProvidedConfig = true, injectedVarsOverrides = {} }) {
    try {
      const request = reply.request;
      const translations = await request.getUiTranslations();
      const basePath = config.get('server.basePath');

      return reply.view('ui_app', {
        uiPublicUrl: `${basePath}/ui`,
        bootstrapScriptUrl: `${basePath}/bundles/app/${app.getId()}/bootstrap.js`,
        i18n: key => (0, _lodash.get)(translations, key, ''),

        injectedMetadata: {
          legacyMetadata: await getLegacyKibanaPayload({
            app,
            request,
            includeUserProvidedConfig,
            injectedVarsOverrides
          })
        }
      });
    } catch (err) {
      reply(err);
    }
  }

  server.decorate('reply', 'renderApp', function (app, injectedVarsOverrides) {
    return renderApp({
      app,
      reply: this,
      includeUserProvidedConfig: true,
      injectedVarsOverrides
    });
  });

  server.decorate('reply', 'renderAppWithDefaultConfig', function (app) {
    return renderApp({
      app,
      reply: this,
      includeUserProvidedConfig: false
    });
  });
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