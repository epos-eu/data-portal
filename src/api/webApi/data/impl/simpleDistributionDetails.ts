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
import { Confirm } from '../../utility/preconditions';
import { DistributionType } from '../distributionType.enum';
import { DistributionDetails } from '../distributionDetails.interface';
import { TemporalRange } from '../temporalRange.interface';
import { SpatialRange } from '../spatialRange.interface';
import { DistributionSummary } from '../distributionSummary.interface';
import { DistributionFormat } from '../distributionFormat.interface';
import { ParameterDefinitions } from '../parameterDefinitions.interface';
import { DataProvider } from '../dataProvider.interface';
import { DistributionLevel } from '../distributionLevel.interface';
import { DistributionContactPoint } from '../distributionContactPoint.interface';
import { DistributionCategories } from '../distributionCategories.interface';

export class SimpleDistributionDetails implements DistributionDetails {
  public readonly isDownloadable: boolean;
  public readonly isMappable: boolean;
  public readonly isGraphable: boolean;
  public readonly isTabularable: boolean;
  public readonly isOnlyDownloadable: boolean;
  public readonly statusNumber: number;
  public readonly statusTimestamp: string;

  private constructor( //
    private readonly summary: DistributionSummary, //
    private readonly documentation: string, //
    private readonly webServiceDescription: string, //
    private readonly webServiceProvider: DataProvider | null, //
    private readonly webServiceName: string,
    private readonly webServiceSpatialRange: null | SpatialRange,
    private readonly webServiceTemporalCoverage: null | TemporalRange,
    private readonly webServiceEndpoint: string,
    private readonly description: string, //
    private readonly license: string, //
    private readonly endpoint: string, //
    private readonly type: DistributionType, //
    private readonly dataProvider: Array<DataProvider>, //
    private readonly doi: Array<string>,
    private readonly internalID: Array<string>, //
    private readonly paramDefs: ParameterDefinitions, //
    private readonly temporalRange: TemporalRange, //
    private readonly spatialRange: SpatialRange,
    private readonly downloadURL: string,
    private readonly contactPoints: Array<string>,
    private readonly keywords: Array<string>,
    private readonly frequencyUpdate: string,
    private readonly hasQualityAnnotation: string,
    private readonly level: Array<DistributionLevel>,
    private readonly domainCode: string,
    private readonly availableContactPoints: Array<DistributionContactPoint>,
    private readonly categories: DistributionCategories | null
  ) {
    this.isMappable = this.summary.isMappable;
    this.isGraphable = this.summary.isGraphable;
    this.isDownloadable = this.summary.isDownloadable;
    this.isTabularable = this.summary.isTabularable;
    this.isOnlyDownloadable = this.getType() === DistributionType.DOWNLOADABLE_FILE ? true : false;
    this.statusNumber = this.summary.getStatus();
    this.statusTimestamp = this.summary.getStatusTimestamp();
  }

  public static makeUnsafeNullsAbound(
    summary: null | DistributionSummary, //
    documentation: string, //
    webServiceDescription: string, //
    webServiceProvider: DataProvider | null, //
    webServiceName: string,
    webServiceSpatialRange: null | SpatialRange,
    webServiceTemporalCoverage: null | TemporalRange,
    webServiceEndpoint: string,
    description: string, //
    license: string, //
    endpoint: string, //
    type: DistributionType, //
    dataProvider: Array<DataProvider>, //
    doi: Array<string>, //
    internalID: Array<string>, //
    paramDefs: ParameterDefinitions, //
    temporalRange: null | TemporalRange, //
    spatialRange: null | SpatialRange,
    downloadURL: string,
    contactPoints: Array<string>,
    keywords: Array<string>,
    frequencyUpdate: string,
    hasQualityAnnotation: string,
    level: Array<DistributionLevel>,
    domainCode: string,
    availableContactPoints: Array<DistributionContactPoint>,
    categories: DistributionCategories | null
  ): DistributionDetails {
    // objects
    Confirm.requiresValid(summary);
    Confirm.requiresValid(temporalRange);
    Confirm.requiresValid(spatialRange);

    return new SimpleDistributionDetails(
      summary!, //
      documentation, //
      webServiceDescription, //
      webServiceProvider, //
      webServiceName,
      webServiceSpatialRange,
      webServiceTemporalCoverage,
      webServiceEndpoint,
      description, //
      license, //
      endpoint, //
      type, //
      dataProvider, //
      doi,
      internalID, //
      paramDefs, //
      temporalRange!, //
      spatialRange!,
      downloadURL,
      contactPoints,
      keywords,
      frequencyUpdate,
      hasQualityAnnotation,
      level,
      domainCode,
      availableContactPoints,
      categories
    );
  }

  public static makeStrict(
    summary: DistributionSummary, //
    documentation: string, //
    webServiceDescription: string, //
    webServiceProvider: DataProvider | null, //
    webServiceName: string,
    webServiceSpatialRange: SpatialRange,
    webServiceTemporalCoverage: TemporalRange,
    webServiceEndpoint: string,
    webServiceParameters: ParameterDefinitions,
    description: string, //
    license: string, //
    endpoint: string, //
    type: DistributionType, //
    dataProvider: Array<DataProvider>, //
    doi: Array<string>, //
    internalID: Array<string>, //
    paramDefs: ParameterDefinitions, //
    temporalRange: TemporalRange, //
    spatialRange: SpatialRange,
    downloadURL: string,
    contactPoints: Array<string>,
    keywords: Array<string>,
    frequencyUpdate: string,
    hasQualityAnnotation: string,
    level: Array<DistributionLevel>,
    domainCode: string,
    availableContactPoints: Array<DistributionContactPoint>,
    categories: DistributionCategories
  ): DistributionDetails {
    // objects
    Confirm.requiresValid(summary);
    Confirm.requiresValid(type);
    Confirm.requiresValid(internalID);
    Confirm.requiresValid(dataProvider);
    Confirm.requiresValid(paramDefs);
    Confirm.requiresValid(temporalRange);
    Confirm.requiresValid(spatialRange);
    Confirm.requiresValid(level);
    Confirm.requiresValid(availableContactPoints);

    // strings
    Confirm.requiresValidString(documentation, true);
    Confirm.requiresValidString(webServiceDescription, true);
    Confirm.requiresValidString(description, true);
    Confirm.requiresValidString(license, true);
    Confirm.requiresValidString(endpoint, true);
    Confirm.requiresValidString(hasQualityAnnotation, true);
    Confirm.requiresValidString(domainCode, true);

    return new SimpleDistributionDetails(
      summary, //
      documentation, //
      webServiceDescription, //
      webServiceProvider, //
      webServiceName,
      webServiceSpatialRange,
      webServiceTemporalCoverage,
      webServiceEndpoint,
      description, //
      license, //
      endpoint, //
      type, //
      dataProvider, //
      doi,
      internalID, //
      paramDefs, //
      temporalRange, //
      spatialRange,
      downloadURL,
      contactPoints,
      keywords,
      frequencyUpdate,
      hasQualityAnnotation,
      level,
      domainCode,
      availableContactPoints,
      categories
    );
  }


  // FROM SUMMARY
  getName(): string {
    return this.summary.getName();
  }

  getIdentifier(): string {
    return this.summary.getIdentifier();
  }

  getFormats(): Array<DistributionFormat> {
    return this.summary.getFormats();
  }
  getMappableFormats(): Array<DistributionFormat> {
    return this.summary.getMappableFormats();
  }
  getGraphableFormats(): Array<DistributionFormat> {
    return this.summary.getGraphableFormats();
  }
  getDownloadableFormats(): Array<DistributionFormat> {
    return this.summary.getDownloadableFormats();
  }
  getTabularableFormats(): Array<DistributionFormat> {
    return this.summary.getTabularableFormats();
  }

  // ADDITIONAL
  getDataProvider(): Array<DataProvider> {
    return this.dataProvider;
  }

  getDocumentation(): string {
    return this.documentation;
  }

  getWebServiceDescription(): string {
    return this.webServiceDescription;
  }

  getWebServiceProvider(): DataProvider | null {
    return this.webServiceProvider;
  }
  getWebServiceName(): string {
    return this.webServiceName;
  }
  getWebServiceSpatialRange(): null | SpatialRange {
    return this.webServiceSpatialRange;
  }

  getWebServiceTemporalCoverage(): null | TemporalRange {
    return this.webServiceTemporalCoverage;
  }

  getWebServiceEndpoint(): string {
    return this.webServiceEndpoint;
  }
  getDescription(): string {
    return this.description;
  }
  getEndPoint(): string {
    return this.endpoint;
  }

  getLicense(): string {
    return this.license;
  }

  getType(): DistributionType {
    return this.type;
  }
  getTypeString(): string {
    return DistributionType[this.type];
  }

  getInternalID(): Array<string> {
    return this.internalID;
  }

  getParameters(): ParameterDefinitions {
    return this.paramDefs;
  }

  getTemporalRange(): TemporalRange {
    return this.temporalRange;
  }
  getSpatialRange(): SpatialRange {
    return this.spatialRange;
  }

  getDOI(): Array<string> {
    return this.doi;
  }

  getDownloadURL(): string {
    return this.downloadURL;
  }
  getContactPoints(): Array<string> {
    return this.contactPoints;
  }
  getKeywords(): Array<string> {
    return this.keywords;
  }
  getFrequencyUpdate(): string {
    return this.frequencyUpdate;
  }

  getStatus(): number {
    return this.statusNumber;
  }

  getStatusTimestamp(): string {
    return this.statusTimestamp;
  }

  getQualityAssurance(): string {
    return this.hasQualityAnnotation;
  }

  getLevel(): DistributionLevel[] {
    return this.level;
  }
  getDomainCode(): string {
    return this.domainCode;
  }

  /**
   * The function `getDomain` returns the name of the first child category, or undefined if there are no
   * children.
   * @returns a string value or undefined.
   */
  getDomain(): string | undefined {
    return this.categories?.children[0].name;
  }

  /**
   * The function "getCategories" returns the distribution categories or null.
   * @returns The method is returning a variable called "categories" of type "DistributionCategories" or
   * null.
   */
  getCategories(): DistributionCategories | null {
    return this.categories;
  }

  /**
   * The function "getAvailableContactPoints" returns an array of DistributionContactPoint objects.
   * @returns An array of DistributionContactPoint objects.
   */
  getAvailableContactPoints(): Array<DistributionContactPoint> {
    return this.availableContactPoints;
  }

}
