'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

exports.readFieldCapsResponse = readFieldCapsResponse;

var _lodash = require('lodash');

var _utils = require('../../../../../utils');

var _should_read_field_from_doc_values = require('./should_read_field_from_doc_values');

/**
 *  Read the response from the _field_caps API to determine the type and
 *  "aggregatable"/"searchable" status of each field.
 *
 *  For reference, the _field_caps response should look like this:
 *
 *  {
 *    "fields": {
 *      "<fieldName>": {
 *        "<esType>": {
 *          "type": "<esType>",
 *          "searchable": true,
 *          "aggregatable": false,
 *          // "indices" is only included when multiple
 *          // types are found for a single field
 *          "indices": [
 *            "<index>"
 *          ]
 *        },
 *        "<esType2>": {
 *          "type": "<esType2>",
 *          "searchable": true,
 *          ...
 *
 *  Returned array includes an object for each field in the _field_caps
 *  response. When the field uses the same configuration across all indices
 *  it should look something like this:
 *
 *    {
 *      "name": "<fieldName>"
 *      "type": "<kbnType>",
 *      "aggregatable": <bool>,
 *      "searchable": <bool>,
 *    }
 *
 *  If the field has different data types in indices it will be of type
 *  "conflict" and include a description of where conflicts can be found
 *
 *    {
 *      "name": "<fieldName>",
 *      "type": "conflict",
 *      "aggregatable": false,
 *      "searchable": false,
 *      conflictDescriptions: {
 *        "<esType1>": [
 *          "<index1>"
 *        ],
 *        "<esType2>": [
 *          "<index2>"
 *        ]
 *      }
 *    }
 *
 *  @param {FieldCapsResponse} fieldCapsResponse
 *  @return {Promise<Array<FieldInfo>>}
 */
function readFieldCapsResponse(fieldCapsResponse) {
  const capsByNameThenType = fieldCapsResponse.fields;
  return Object.keys(capsByNameThenType).map(fieldName => {
    const capsByType = capsByNameThenType[fieldName];
    const types = Object.keys(capsByType);

    // If a single type is marked as searchable or aggregatable, all the types are searchable or aggregatable
    const isSearchable = types.some(type => {
      return !!capsByType[type].searchable || !!capsByType[type].non_searchable_indices && capsByType[type].non_searchable_indices.length > 0;
    });

    const isAggregatable = types.some(type => {
      return !!capsByType[type].aggregatable || !!capsByType[type].non_aggregatable_indices && capsByType[type].non_aggregatable_indices.length > 0;
    });

    // If there are multiple types but they all resolve to the same kibana type
    // ignore the conflict and carry on (my wayward son)
    const uniqueKibanaTypes = (0, _lodash.uniq)(types.map(_utils.castEsToKbnFieldTypeName));
    if (uniqueKibanaTypes.length > 1) {
      return {
        name: fieldName,
        type: 'conflict',
        searchable: isSearchable,
        aggregatable: isAggregatable,
        readFromDocValues: false,
        conflictDescriptions: types.reduce((acc, esType) => _extends({}, acc, {
          [esType]: capsByType[esType].indices
        }), {})
      };
    }

    const esType = types[0];
    return {
      name: fieldName,
      type: (0, _utils.castEsToKbnFieldTypeName)(esType),
      searchable: isSearchable,
      aggregatable: isAggregatable,
      readFromDocValues: (0, _should_read_field_from_doc_values.shouldReadFieldFromDocValues)(isAggregatable, esType)
    };
  });
}