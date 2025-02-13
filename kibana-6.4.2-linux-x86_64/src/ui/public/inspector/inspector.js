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
const tslib_1 = require("tslib");
const events_1 = require("events");
const react_1 = tslib_1.__importDefault(require("react"));
const react_dom_1 = tslib_1.__importDefault(require("react-dom"));
const inspector_panel_1 = require("./ui/inspector_panel");
const view_registry_1 = require("./view_registry");
let activeSession = null;
const CONTAINER_ID = 'inspector-container';
function getOrCreateContainerElement() {
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
        container = document.createElement('div');
        container.id = CONTAINER_ID;
        document.body.appendChild(container);
    }
    return container;
}
/**
 * An InspectorSession describes the session of one opened inspector. It offers
 * methods to close the inspector again. If you open an inspector you should make
 * sure you call {@link InspectorSession#close} when it should be closed.
 * Since an inspector could also be closed without calling this method (e.g. because
 * the user closes it), you must listen to the "closed" event on this instance.
 * It will be emitted whenever the inspector will be closed and you should throw
 * away your reference to this instance whenever you receive that event.
 * @extends EventEmitter
 */
class InspectorSession extends events_1.EventEmitter {
    /**
     * Binds the current inspector session to an Angular scope, meaning this inspector
     * session will be closed as soon as the Angular scope gets destroyed.
     * @param {object} scope - And angular scope object to bind to.
     */
    bindToAngularScope(scope) {
        const removeWatch = scope.$on('$destroy', () => this.close());
        this.on('closed', () => removeWatch());
    }
    /**
     * Closes the opened inspector as long as it's stil the open one.
     * If this is not the active session anymore, this method won't do anything.
     * If this session was still active and an inspector was closed, the 'closed'
     * event will be emitted on this InspectorSession instance.
     */
    close() {
        if (activeSession === this) {
            const container = document.getElementById(CONTAINER_ID);
            if (container) {
                react_dom_1.default.unmountComponentAtNode(container);
                this.emit('closed');
            }
        }
    }
}
/**
 * Checks if a inspector panel could be shown based on the passed adapters.
 *
 * @param {object} adapters - An object of adapters. This should be the same
 *    you would pass into `open`.
 * @returns {boolean} True, if a call to `open` with the same adapters
 *    would have shown the inspector panel, false otherwise.
 */
function isAvailable(adapters) {
    return view_registry_1.viewRegistry.getVisible(adapters).length > 0;
}
/**
 * Opens the inspector panel for the given adapters and close any previously opened
 * inspector panel. The previously panel will be closed also if no new panel will be
 * opened (e.g. because of the passed adapters no view is available). You can use
 * {@link InspectorSession#close} on the return value to close that opened panel again.
 *
 * @param {object} adapters - An object of adapters for which you want to show
 *    the inspector panel.
 * @param {InspectorOptions} options - Options that configure the inspector. See InspectorOptions type.
 * @return {InspectorSession} The session instance for the opened inspector.
 */
function open(adapters, options = {}) {
    // If there is an active inspector session close it before opening a new one.
    if (activeSession) {
        activeSession.close();
    }
    const views = view_registry_1.viewRegistry.getVisible(adapters);
    // Don't open inspector if there are no views available for the passed adapters
    if (!views || views.length === 0) {
        throw new Error(`Tried to open an inspector without views being available.
      Make sure to call Inspector.isAvailable() with the same adapters before to check
      if an inspector can be shown.`);
    }
    const container = getOrCreateContainerElement();
    const session = (activeSession = new InspectorSession());
    react_dom_1.default.render(react_1.default.createElement(inspector_panel_1.InspectorPanel, { views: views, adapters: adapters, onClose: () => session.close(), title: options.title }), container);
    return session;
}
const Inspector = {
    isAvailable,
    open,
};
exports.Inspector = Inspector;
