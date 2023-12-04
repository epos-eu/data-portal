/*
         Copyright 2021 EPOS ERIC

 Licensed under the Apache License, Version 2.0 (the License); you may not
 use this file except in compliance with the License.  You may obtain a copy
 of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an AS IS BASIS, WITHOUT
 WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 License for the specific language governing permissions and limitations under
 the License.
 */
import { DistributionDetails } from '../distributionDetails.interface';
import { ObjectAccessUtility } from 'api/webApi/utility/objectAccessUtility';
import { DistributionType } from '../distributionType.enum';
import { SpatialRange } from '../spatialRange.interface';
import { TemporalRange } from '../temporalRange.interface';
import { SimpleDistributionDetails } from './simpleDistributionDetails';
import { ParameterDefinition } from '../parameterDefinition.interface';
import { ParameterType } from '../parameterType.enum';
import { ParameterProperty } from '../parameterProperty.enum';
import { SimpleParameterDefinition } from './simpleParameterDefinition';
import { SimpleSpatialRange } from './simpleSpatialRange';
import { SimpleTemporalRange } from './simpleTemporalRange';
import * as moment from 'moment';
import { DistributionFormat } from '../distributionFormat.interface';
import { SimpleDistributionSummary } from './simpleDistributionSummary';
import { SimpleDistributionFormat } from './simpleDistributionFormat';
import { DistributionSummary } from '../distributionSummary.interface';
import { Optional } from 'api/webApi/utility/optional';
import { Confirm } from 'api/webApi/utility/preconditions';
import { ParameterDefinitions } from '../parameterDefinitions.interface';
import { SimpleParameterDefinitions } from './simpleParameterDefinitions';
import { SimpleDataProvider } from './simpleDataProvider';
import { DataProvider } from '../dataProvider.interface';
import { DistributionContactPoint } from '../distributionContactPoint.interface';
import { DistributionCategories } from '../distributionCategories.interface';

export class JSONDistributionFactory {

  public static jsonToOriginalUrl(json: Record<string, unknown>): Optional<null | string> {

    const url = ObjectAccessUtility.getObjectValueString(json, 'url', true, null);

    return Optional.ofNullable(url);
  }

  public static jsonToDistributionDetails(distributionObj: Record<string, unknown>): Optional<null | DistributionDetails> {

    // read the summary part first
    const summary: Optional<null | DistributionSummary> = JSONDistributionFactory.jsonToDistributionSummary(distributionObj);

    // If summary is good map else return empty optional
    return summary.map(sum => {
      // details
      const documentation = ObjectAccessUtility.getObjectValueString(distributionObj, 'serviceDocumentation', false, '');
      // serviceDescription
      const webServiceDescription = ObjectAccessUtility.getObjectValueString(distributionObj, 'serviceDescription', false, '');
      // serviceProvider
      const webServiceProvider = JSONDistributionFactory.jsonToDataProvider(distributionObj, 'serviceProvider');
      const webServiceName = ObjectAccessUtility.getObjectValueString(distributionObj, 'serviceName', false);
      const webServiceEndpoint = ObjectAccessUtility.getObjectValueString(distributionObj, 'serviceEndpoint', false);
      const description = ObjectAccessUtility.getObjectValueString(distributionObj, 'description', true);
      const license = ObjectAccessUtility.getObjectValueString(distributionObj, 'license', false, '');
      const endpoint = ObjectAccessUtility.getObjectValueString(distributionObj, 'endpoint', true);
      const typeString = ObjectAccessUtility.getObjectValueString(distributionObj, 'type', true);
      const typeEnum = DistributionType[typeString.toUpperCase()] as DistributionType;
      const dataProvider = JSONDistributionFactory.jsonToArrayDataProvider(distributionObj, 'dataProvider');
      // DDSS ID for internal usage/check during implementation phase
      const internalID = ObjectAccessUtility.getObjectArray<string>(distributionObj, 'internalID', false);
      const doi = ObjectAccessUtility.getObjectArray<string>(distributionObj, 'DOI', false);
      const downloadURL = ObjectAccessUtility.getObjectValueString(distributionObj, 'downloadURL', false, '');
      const contactPoints = ObjectAccessUtility.getObjectArray<string>(distributionObj, 'contactPoints', false);
      const keywords = ObjectAccessUtility.getObjectArray<string>(distributionObj, 'keywords', false);
      const frequencyUpdate = ObjectAccessUtility.getObjectValueString(distributionObj, 'frequencyUpdate', false, '');
      // temporal
      const temporalRange: Optional<TemporalRange> = JSONDistributionFactory.jsonToTemporalRange(distributionObj, 'temporalCoverage');
      const webServiceTemporalCoverage = JSONDistributionFactory.jsonToTemporalRange(distributionObj, 'serviceTemporalCoverage');

      // spatial
      const spatialRange = JSONDistributionFactory.jsonToSpatialRange(distributionObj, 'spatial');
      const webServiceSpatialRange = JSONDistributionFactory.jsonToSpatialRange(distributionObj, 'serviceSpatial');
      // params
      const params = JSONDistributionFactory.jsonToParameters(distributionObj, 'serviceParameters');

      const hasQualityAnnotation = ObjectAccessUtility.getObjectValueString(distributionObj, 'hasQualityAnnotation', false, '');

      const level = [];
      const domainCode = '';

      const categories = ObjectAccessUtility.getObjectValue<DistributionCategories>(distributionObj, 'categories');

      // available contact point
      const availableContactPoints = ObjectAccessUtility.getObjectArray<DistributionContactPoint>(
        distributionObj, 'availableContactPoints'
      );

      // If all inputs valid create 'details' else null
      if (
        // objects
        Confirm.isValid(params) && //
        Confirm.isValid(temporalRange) && //
        Confirm.isValid(spatialRange)   // &&

      ) {

        // make details
        return SimpleDistributionDetails.makeUnsafeNullsAbound(
          sum, //
          documentation, //
          webServiceDescription,
          webServiceProvider, //
          webServiceName,
          webServiceSpatialRange.orElse(SimpleSpatialRange.makeUnknown()),
          webServiceTemporalCoverage.orElse(SimpleTemporalRange.makeUnbounded()),
          webServiceEndpoint,
          description, //
          license, //
          endpoint, //
          typeEnum, //
          dataProvider, //
          doi, //
          internalID, //
          params, //
          temporalRange.orElse(SimpleTemporalRange.makeUnbounded()), //
          spatialRange.orElse(SimpleSpatialRange.makeUnknown()),
          downloadURL, //
          contactPoints,
          keywords,
          frequencyUpdate,
          hasQualityAnnotation,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          level,
          domainCode,
          availableContactPoints,
          categories
        );
      } else {
        return null;
      }
    });
  }

  public static jsonToDataProvider(jsonWithParams: Record<string, unknown>, value: string): DataProvider | null {
    const providerObject = ObjectAccessUtility.getObjectValue<Record<string, unknown>>(jsonWithParams, value, true);

    if (providerObject != null) {
      // check required fields
      const dataProviderLegalName = ObjectAccessUtility.getObjectValueString(providerObject, 'dataProviderLegalName', false, null);
      const dataProviderUrl = ObjectAccessUtility.getObjectValueString(providerObject, 'dataProviderUrl', false, null);
      const relatedDataProvider = ObjectAccessUtility.getObjectArray<DataProvider>(providerObject, 'relatedDataServiceProvider', false);

      // Create parameter

      const provider = SimpleDataProvider.make(
        dataProviderLegalName,
        dataProviderUrl,
        relatedDataProvider
      );

      return provider;
    }

    return null;

  }

  public static jsonToArrayDataProvider(jsonWithParams: Record<string, unknown>, value: string): Array<DataProvider> {
    const providers = new Array<DataProvider>();
    const providerObjects = ObjectAccessUtility.getObjectArray<Record<string, unknown>>(jsonWithParams, value, true);

    if (providerObjects != null) {
      providerObjects.forEach((providerObj: Record<string, unknown>) => {
        // check required fields
        const dataProviderLegalName = ObjectAccessUtility.getObjectValueString(providerObj, 'dataProviderLegalName', false, null);
        const dataProviderUrl = ObjectAccessUtility.getObjectValueString(providerObj, 'dataProviderUrl', false, null);
        const relatedDataProvider = ObjectAccessUtility.getObjectArray<DataProvider>(providerObj, 'relatedDataServiceProvider', false);
        if ((dataProviderLegalName == null)
        ) {
          console.log('Data Provider no name', providerObj);
        } else {
          // Create parameter

          const createdParam = SimpleDataProvider.make(
            dataProviderLegalName,
            dataProviderUrl,
            relatedDataProvider
          );

          providers.push(createdParam);
        }
      });
    }

    return providers;
  }

  public static jsonToParameters(jsonWithParams: Record<string, unknown>, value: string): ParameterDefinitions {
    const params = new Array<ParameterDefinition>();
    const parameterObjects = ObjectAccessUtility.getObjectArray<Record<string, unknown>>(jsonWithParams, value, true);

    if (parameterObjects != null) {
      parameterObjects.forEach((paramObj: Record<string, unknown>) => {
        // check required fields
        const paramName = ObjectAccessUtility.getObjectValueString(paramObj, 'name', true, null);
        const paramType = ObjectAccessUtility.getObjectValueString(paramObj, 'type', true, null);
        const paramLabel = ObjectAccessUtility.getObjectValueString(paramObj, 'label', true, null);
        const paramRequired = ObjectAccessUtility.getObjectValueBoolean(paramObj, 'required', true, true);
        const paramTypeEnum = ParameterType[paramType.toUpperCase()] as ParameterType || ParameterType.UNKNOWN;
        const paramProperty = ObjectAccessUtility.getObjectValueString(paramObj, 'property', false, null);
        const paramPropertyEnum = ParameterProperty.fromProperty(paramProperty);

        // empty value -> false
        const paramFree = !!ObjectAccessUtility.getObjectValue(paramObj, 'free', false);

        if ((paramName == null) || (paramLabel == null)
        ) {
          console.log('Distribution Parameter no name or label', paramObj);
        } else {
          // Create parameter

          const createdParam = SimpleParameterDefinition.make(
            paramName,
            paramLabel,
            paramTypeEnum,
            paramPropertyEnum,
            !paramRequired,
            //
            ObjectAccessUtility.getObjectValueString(paramObj, 'minValue', false, null),
            ObjectAccessUtility.getObjectValueString(paramObj, 'maxValue', false, null),
            ObjectAccessUtility.getObjectValueString(paramObj, 'regex', false, null),
            ObjectAccessUtility.getObjectValueString(paramObj, 'valuePattern', false, null),
            ObjectAccessUtility.getObjectArray(paramObj, 'Enum', false),
            paramFree,
            ObjectAccessUtility.getObjectValueString(paramObj, 'readOnlyValue', false, ''),
            ObjectAccessUtility.getObjectValueString(paramObj, 'multipleValue', false, ''),
            ObjectAccessUtility.getObjectValue(paramObj, 'defaultValue', false),
          );

          params.push(createdParam);
        }
      });
    }

    return SimpleParameterDefinitions.make(params);
  }

  public static jsonToSpatialRange(jsonWithSpatial: Record<string, unknown>, value: string): Optional<SpatialRange> {

    // SPATIAL {}
    const spatial = ObjectAccessUtility.getObjectValue<Record<string, unknown>>(jsonWithSpatial, value, false);
    // If no spatial - unbounded
    if (spatial == null) {
      return Optional.ofNonNullable(SimpleSpatialRange.makeUnknown());
    }

    // POINT
    const x = ObjectAccessUtility.getObjectValueNumber(spatial, 'x', false);
    const y = ObjectAccessUtility.getObjectValueNumber(spatial, 'y', false);
    if (x != null && isFinite(x) && y != null && isFinite(y)) {
      return Optional.ofNonNullable(SimpleSpatialRange.makePoint(x, y));
    }

    // OK we have a spatial object, but it's not a point, lets try to extract number[][][] from paths

    // PATH {}
    const pathsArray: Array<Array<Array<number>>> = ObjectAccessUtility.getObjectArray(spatial, 'paths', false);
    const validatedPathsArray: Array<Array<Array<number>>> = [];


    // Paths arrays is present and has length > 0
    if (pathsArray != null && pathsArray.length > 0) {

      // Check each path/point-array
      pathsArray.forEach((pathPointsArray: Array<Array<number>>) => {
        const validatedPathPointsArray: Array<Array<number>> = [];

        // Path/point-array is present and has length > 3 (need at least 3 points)
        if (pathPointsArray != null && pathPointsArray.length >= 3) {

          // Check each point
          pathPointsArray.forEach((pointValues: Array<number>) => {
            const validatedPointValues: Array<number> = [];


            //  Point is present and has length > 2
            if (pointValues != null && pointValues.length >= 2) {
              const a = pointValues[0];
              const b = pointValues[1];

              // Check that point is made up of sensible numbers
              if (a != null && isFinite(a) && b != null && isFinite(b)) {
                validatedPointValues.push(a);
                validatedPointValues.push(b);
              }
            }

            // Push validated point, need at least 2 dimensions x and y
            if (validatedPointValues.length >= 2) {
              validatedPathPointsArray.push(validatedPointValues);
            }
          });
        }

        // Push validated points, need at least 3 valid points
        if (validatedPathPointsArray.length >= 3) {

          // Also, push a copy of the first to end to ensure poly is closed
          validatedPathPointsArray.push(validatedPathPointsArray[0].slice());

          // Push validated path of points (i.e. poly) to paths array
          validatedPathsArray.push(validatedPathPointsArray);
        }
      });
    }

    if (validatedPathsArray.length > 0) {
      return Optional.ofNonNullable(SimpleSpatialRange.makeNPoly(validatedPathsArray));
    }

    return Optional.ofNonNullable(SimpleSpatialRange.makeUnknown());
  }

  public static jsonToTemporalRange(jsonWithDate: Record<string, unknown>, value: string): Optional<TemporalRange> {
    const temporalCoverage = ObjectAccessUtility.getObjectValue<Record<string, unknown>>(jsonWithDate, value, false);
    let temporalRange = SimpleTemporalRange.makeUnbounded();
    if (null != temporalCoverage) {
      const momentFormat = 'YYYY-MM-DDThh:mm:ssZ'; // this format is an assumption
      const startDate = ObjectAccessUtility.hasKey(temporalCoverage, 'startDate') ?
        moment.utc(ObjectAccessUtility.getObjectValueString(temporalCoverage, 'startDate', true), momentFormat) : null;
      const endDate = ObjectAccessUtility.hasKey(temporalCoverage, 'endDate') ?
        moment.utc(ObjectAccessUtility.getObjectValueString(temporalCoverage, 'endDate', true), momentFormat) : null;
      if (startDate == null && endDate == null) {
        temporalRange = SimpleTemporalRange.makeUnbounded();
      } else if (startDate != null && endDate == null) {
        temporalRange = SimpleTemporalRange.makeWithoutUpperBound(startDate);
      } else if (startDate == null && endDate != null) {
        temporalRange = SimpleTemporalRange.makeWithoutLowerBound(endDate);
      } else if (startDate != null && endDate != null) {
        temporalRange = SimpleTemporalRange.makeBounded(startDate, endDate);
      }
    }
    return Optional.ofNonNullable(temporalRange);
  }


  public static jsonToDistributionSummary(distJson: Record<string, unknown>): Optional<null | DistributionSummary> {

    // Extract from JSON
    const title = ObjectAccessUtility.getObjectValueString(distJson, 'title', true);
    const id = ObjectAccessUtility.getObjectValueString(distJson, 'id', true);
    const availableFormatsJSONArray = ObjectAccessUtility.getObjectArray<Record<string, unknown>>(distJson, 'availableFormats', false);
    const status = ObjectAccessUtility.getObjectValueNumber(distJson, 'status', false);
    const statusTimestamp = ObjectAccessUtility.getObjectValueString(distJson, 'statusTimestamp', false);

    const formatsAppendTo: Array<DistributionFormat> = [];

    // If there is a formats array iterate over it
    if (availableFormatsJSONArray != null) {
      availableFormatsJSONArray.forEach(availableFormatJSON => {
        if (availableFormatJSON != null) {
          const format = JSONDistributionFactory.jsonToDistributionFormat(availableFormatJSON);
          if (format != null) {
            format.ifPresent(f => formatsAppendTo.push(f!));
          }
        }
      });
    }

    if (Confirm.isValidString(id) && //
      Confirm.isValidString(title)) {
      return Optional.ofNonNullable(SimpleDistributionSummary.make(id, title, formatsAppendTo, status, statusTimestamp));
    } else {
      return Optional.empty();
    }
  }

  /**
   * Create DistributionFormat, null if fails
   * @param formatJson
   * @param formatsAppendTo
   */
  public static jsonToDistributionFormat(formatJson: Record<string, unknown>): Optional<null | DistributionFormat> {

    // Extract from JSON
    const label = ObjectAccessUtility.getObjectValueString(formatJson, 'label', true);
    const format = ObjectAccessUtility.getObjectValueString(formatJson, 'format', true);
    const originalFormat = ObjectAccessUtility.getObjectValueString(formatJson, 'originalFormat', true);
    const type = ObjectAccessUtility.getObjectValueString(formatJson, 'type', true);
    const href = ObjectAccessUtility.getObjectValueString(formatJson, 'href', true);


    if (Confirm.isValidString(label) && //
      Confirm.isValidString(format) && //
      Confirm.isValidString(originalFormat) && //
      Confirm.isValidString(label) && //
      Confirm.isValidString(href) && //
      Confirm.isValidString(type)) {

      return Optional.ofNonNullable(SimpleDistributionFormat.make(label, format, originalFormat, href, type));
    } else {
      return Optional.empty();
    }
  }
}
