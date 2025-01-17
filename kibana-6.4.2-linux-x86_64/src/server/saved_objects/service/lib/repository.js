'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SavedObjectsRepository = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /*
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

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _mappings = require('../../../mappings');

var _search_dsl = require('./search_dsl');

var _trim_id_prefix = require('./trim_id_prefix');

var _included_fields = require('./included_fields');

var _decorate_es_error = require('./decorate_es_error');

var _errors = require('./errors');

var errors = _interopRequireWildcard(_errors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// BEWARE: The SavedObjectClient depends on the implementation details of the SavedObjectsRepository
// so any breaking changes to this repository are considered breaking changes to the SavedObjectsClient.

class SavedObjectsRepository {
  constructor(options) {
    const {
      index,
      mappings,
      callCluster,
      onBeforeWrite = () => {}
    } = options;

    this._index = index;
    this._mappings = mappings;
    this._type = (0, _mappings.getRootType)(this._mappings);
    this._onBeforeWrite = onBeforeWrite;
    this._unwrappedCallCluster = callCluster;
  }

  /**
   * Persists an object
   *
   * @param {string} type
   * @param {object} attributes
   * @param {object} [options={}]
   * @property {string} [options.id] - force id on creation, not recommended
   * @property {boolean} [options.overwrite=false]
   * @returns {promise} - { id, type, version, attributes }
  */
  async create(type, attributes = {}, options = {}) {
    const {
      id,
      overwrite = false
    } = options;

    const method = id && !overwrite ? 'create' : 'index';
    const time = this._getCurrentTime();

    try {
      const response = await this._writeToCluster(method, {
        id: this._generateEsId(type, id),
        type: this._type,
        index: this._index,
        refresh: 'wait_for',
        body: {
          type,
          updated_at: time,
          [type]: attributes
        }
      });

      return {
        id: (0, _trim_id_prefix.trimIdPrefix)(response._id, type),
        type,
        updated_at: time,
        version: response._version,
        attributes
      };
    } catch (error) {
      if (errors.isNotFoundError(error)) {
        // See "503s from missing index" above
        throw errors.createEsAutoCreateIndexError();
      }

      throw error;
    }
  }

  /**
   * Creates multiple documents at once
   *
   * @param {array} objects - [{ type, id, attributes }]
   * @param {object} [options={}]
   * @property {boolean} [options.overwrite=false] - overwrites existing documents
   * @returns {promise} -  {saved_objects: [[{ id, type, version, attributes, error: { message } }]}
   */
  async bulkCreate(objects, options = {}) {
    const {
      overwrite = false
    } = options;
    const time = this._getCurrentTime();
    const objectToBulkRequest = object => {
      const method = object.id && !overwrite ? 'create' : 'index';

      return [{
        [method]: {
          _id: this._generateEsId(object.type, object.id),
          _type: this._type
        }
      }, {
        type: object.type,
        updated_at: time,
        [object.type]: object.attributes
      }];
    };

    const { items } = await this._writeToCluster('bulk', {
      index: this._index,
      refresh: 'wait_for',
      body: objects.reduce((acc, object) => [...acc, ...objectToBulkRequest(object)], [])
    });

    return {
      saved_objects: items.map((response, i) => {
        const {
          error,
          _id: responseId,
          _version: version
        } = Object.values(response)[0];

        const {
          id = responseId,
          type,
          attributes
        } = objects[i];

        if (error) {
          if (error.type === 'version_conflict_engine_exception') {
            return {
              id,
              type,
              error: { statusCode: 409, message: 'version conflict, document already exists' }
            };
          }
          return {
            id,
            type,
            error: {
              message: error.reason || JSON.stringify(error)
            }
          };
        }

        return {
          id,
          type,
          updated_at: time,
          version,
          attributes
        };
      })
    };
  }

  /**
   * Deletes an object
   *
   * @param {string} type
   * @param {string} id
   * @returns {promise}
   */
  async delete(type, id) {
    const response = await this._writeToCluster('delete', {
      id: this._generateEsId(type, id),
      type: this._type,
      index: this._index,
      refresh: 'wait_for',
      ignore: [404]
    });

    const deleted = response.result === 'deleted';
    if (deleted) {
      return {};
    }

    const docNotFound = response.result === 'not_found';
    const indexNotFound = response.error && response.error.type === 'index_not_found_exception';
    if (docNotFound || indexNotFound) {
      // see "404s from missing index" above
      throw errors.createGenericNotFoundError(type, id);
    }

    throw new Error(`Unexpected Elasticsearch DELETE response: ${JSON.stringify({ type, id, response })}`);
  }

  /**
   * @param {object} [options={}]
   * @property {(string|Array<string>)} [options.type]
   * @property {string} [options.search]
   * @property {Array<string>} [options.searchFields] - see Elasticsearch Simple Query String
   *                                        Query field argument for more information
   * @property {integer} [options.page=1]
   * @property {integer} [options.perPage=20]
   * @property {string} [options.sortField]
   * @property {string} [options.sortOrder]
   * @property {Array<string>} [options.fields]
   * @returns {promise} - { saved_objects: [{ id, type, version, attributes }], total, per_page, page }
   */
  async find(options = {}) {
    const {
      type,
      search,
      searchFields,
      page = 1,
      perPage = 20,
      sortField,
      sortOrder,
      fields
    } = options;

    if (searchFields && !Array.isArray(searchFields)) {
      throw new TypeError('options.searchFields must be an array');
    }

    if (fields && !Array.isArray(fields)) {
      throw new TypeError('options.searchFields must be an array');
    }

    const esOptions = {
      index: this._index,
      size: perPage,
      from: perPage * (page - 1),
      _source: (0, _included_fields.includedFields)(type, fields),
      ignore: [404],
      body: _extends({
        version: true
      }, (0, _search_dsl.getSearchDsl)(this._mappings, {
        search,
        searchFields,
        type,
        sortField,
        sortOrder
      }))
    };

    const response = await this._callCluster('search', esOptions);

    if (response.status === 404) {
      // 404 is only possible here if the index is missing, which
      // we don't want to leak, see "404s from missing index" above
      return {
        page,
        per_page: perPage,
        total: 0,
        saved_objects: []
      };
    }

    return {
      page,
      per_page: perPage,
      total: response.hits.total,
      saved_objects: response.hits.hits.map(hit => {
        const { type, updated_at: updatedAt } = hit._source;
        return _extends({
          id: (0, _trim_id_prefix.trimIdPrefix)(hit._id, type),
          type
        }, updatedAt && { updated_at: updatedAt }, {
          version: hit._version,
          attributes: hit._source[type]
        });
      })
    };
  }

  /**
   * Returns an array of objects by id
   *
   * @param {array} objects - an array ids, or an array of objects containing id and optionally type
   * @returns {promise} - { saved_objects: [{ id, type, version, attributes }] }
   * @example
   *
   * bulkGet([
   *   { id: 'one', type: 'config' },
   *   { id: 'foo', type: 'index-pattern' }
   * ])
   */
  async bulkGet(objects = []) {
    if (objects.length === 0) {
      return { saved_objects: [] };
    }

    const response = await this._callCluster('mget', {
      index: this._index,
      body: {
        docs: objects.map(object => ({
          _id: this._generateEsId(object.type, object.id),
          _type: this._type
        }))
      }
    });

    return {
      saved_objects: response.docs.map((doc, i) => {
        const { id, type } = objects[i];

        if (!doc.found) {
          return {
            id,
            type,
            error: { statusCode: 404, message: 'Not found' }
          };
        }

        const time = doc._source.updated_at;
        return _extends({
          id,
          type
        }, time && { updated_at: time }, {
          version: doc._version,
          attributes: doc._source[type]
        });
      })
    };
  }

  /**
   * Gets a single object
   *
   * @param {string} type
   * @param {string} id
   * @returns {promise} - { id, type, version, attributes }
   */
  async get(type, id) {
    const response = await this._callCluster('get', {
      id: this._generateEsId(type, id),
      type: this._type,
      index: this._index,
      ignore: [404]
    });

    const docNotFound = response.found === false;
    const indexNotFound = response.status === 404;
    if (docNotFound || indexNotFound) {
      // see "404s from missing index" above
      throw errors.createGenericNotFoundError(type, id);
    }

    const { updated_at: updatedAt } = response._source;

    return _extends({
      id,
      type
    }, updatedAt && { updated_at: updatedAt }, {
      version: response._version,
      attributes: response._source[type]
    });
  }

  /**
   * Updates an object
   *
   * @param {string} type
   * @param {string} id
   * @param {object} [options={}]
   * @property {integer} options.version - ensures version matches that of persisted object
   * @returns {promise}
   */
  async update(type, id, attributes, options = {}) {
    const time = this._getCurrentTime();
    const response = await this._writeToCluster('update', {
      id: this._generateEsId(type, id),
      type: this._type,
      index: this._index,
      version: options.version,
      refresh: 'wait_for',
      ignore: [404],
      body: {
        doc: {
          updated_at: time,
          [type]: attributes
        }
      }
    });

    if (response.status === 404) {
      // see "404s from missing index" above
      throw errors.createGenericNotFoundError(type, id);
    }

    return {
      id,
      type,
      updated_at: time,
      version: response._version,
      attributes
    };
  }

  async _writeToCluster(method, params) {
    try {
      await this._onBeforeWrite();
      return await this._callCluster(method, params);
    } catch (err) {
      throw (0, _decorate_es_error.decorateEsError)(err);
    }
  }

  async _callCluster(method, params) {
    try {
      return await this._unwrappedCallCluster(method, params);
    } catch (err) {
      throw (0, _decorate_es_error.decorateEsError)(err);
    }
  }

  _generateEsId(type, id) {
    return `${type}:${id || _uuid2.default.v1()}`;
  }

  _getCurrentTime() {
    return new Date().toISOString();
  }
}
exports.SavedObjectsRepository = SavedObjectsRepository;