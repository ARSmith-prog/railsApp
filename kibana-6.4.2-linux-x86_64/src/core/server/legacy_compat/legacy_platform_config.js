"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
/**
 * Represents adapter between config provided by legacy platform and `RawConfig`
 * supported by the current platform.
 */
class LegacyConfigToRawConfigAdapter {
    constructor(legacyConfig) {
        this.legacyConfig = legacyConfig;
        this.newPlatformConfig = new config_1.ObjectToRawConfigAdapter({
            [config_1.NEW_PLATFORM_CONFIG_ROOT]: legacyConfig.get(config_1.NEW_PLATFORM_CONFIG_ROOT) || {},
        });
    }
    static flattenConfigPath(configPath) {
        if (!Array.isArray(configPath)) {
            return configPath;
        }
        return configPath.join('.');
    }
    static transformLogging(configValue) {
        const loggingConfig = {
            appenders: { default: { kind: 'legacy-appender' } },
            root: { level: 'info' },
        };
        if (configValue.silent) {
            loggingConfig.root.level = 'off';
        }
        else if (configValue.quiet) {
            loggingConfig.root.level = 'error';
        }
        else if (configValue.verbose) {
            loggingConfig.root.level = 'all';
        }
        return loggingConfig;
    }
    static transformServer(configValue) {
        // TODO: New platform uses just a subset of `server` config from the legacy platform,
        // new values will be exposed once we need them (eg. customResponseHeaders, cors or xsrf).
        return {
            basePath: configValue.basePath,
            cors: configValue.cors,
            host: configValue.host,
            maxPayload: configValue.maxPayloadBytes,
            port: configValue.port,
            rewriteBasePath: configValue.rewriteBasePath,
            ssl: configValue.ssl,
        };
    }
    static isNewPlatformConfig(configPath) {
        if (Array.isArray(configPath)) {
            return configPath[0] === config_1.NEW_PLATFORM_CONFIG_ROOT;
        }
        return configPath.startsWith(config_1.NEW_PLATFORM_CONFIG_ROOT);
    }
    has(configPath) {
        if (LegacyConfigToRawConfigAdapter.isNewPlatformConfig(configPath)) {
            return this.newPlatformConfig.has(configPath);
        }
        return this.legacyConfig.has(LegacyConfigToRawConfigAdapter.flattenConfigPath(configPath));
    }
    get(configPath) {
        if (LegacyConfigToRawConfigAdapter.isNewPlatformConfig(configPath)) {
            return this.newPlatformConfig.get(configPath);
        }
        configPath = LegacyConfigToRawConfigAdapter.flattenConfigPath(configPath);
        const configValue = this.legacyConfig.get(configPath);
        switch (configPath) {
            case 'logging':
                return LegacyConfigToRawConfigAdapter.transformLogging(configValue);
            case 'server':
                return LegacyConfigToRawConfigAdapter.transformServer(configValue);
            default:
                return configValue;
        }
    }
    set(configPath, value) {
        if (LegacyConfigToRawConfigAdapter.isNewPlatformConfig(configPath)) {
            return this.newPlatformConfig.set(configPath, value);
        }
        this.legacyConfig.set(LegacyConfigToRawConfigAdapter.flattenConfigPath(configPath), value);
    }
    getFlattenedPaths() {
        // This method is only used to detect unused config paths, but when we run
        // new platform within the legacy one then the new platform is in charge of
        // only `__newPlatform` config node and the legacy platform will check the rest.
        return this.newPlatformConfig.getFlattenedPaths();
    }
}
exports.LegacyConfigToRawConfigAdapter = LegacyConfigToRawConfigAdapter;
