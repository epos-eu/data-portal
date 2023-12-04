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

export enum ParameterProperty {
  NONE = 'none',
  START_DATE = 'schema:startDate',
  END_DATE = 'schema:endDate',
  EASTERN_LONGITUDE = 'epos:easternmostLongitude',
  WESTERN_LONGITUDE = 'epos:westernmostLongitude',
  NORTHERN_LATITUDE = 'epos:northernmostLatitude',
  SOUTHERN_LATITUDE = 'epos:southernmostLatitude',
  OUTPUT_FORMAT = 'schema:encodingFormat',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ParameterProperty {
  export const fromProperty = (name: string): ParameterProperty => {
    const key = Object.keys(ParameterProperty).find((thisKey: string) => ParameterProperty[thisKey] === name);
    return (key != null) ? ParameterProperty[key] as ParameterProperty : ParameterProperty.NONE;
  };
}
