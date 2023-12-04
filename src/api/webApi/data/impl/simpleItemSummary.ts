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
import { Confirm } from 'api/webApi/utility/preconditions';
import { DataType } from 'api/webApi/classes/dataType.enum';
import { ItemSummary } from 'api/webApi/data/itemSummary.interface';
import { Point } from 'api/webApi/data/impl/simplePoint';


/**
 *
 */
export class SimpleItemSummary implements ItemSummary {

  private constructor(
    private readonly identifier: string,
    private readonly name: string,
    private readonly datatype: DataType,
    private readonly description: string,
    private readonly points: Point[],
  ) {
    this.identifier = identifier;
    this.name = name;
    this.description = description;
    this.datatype = datatype;
    this.points = points;
  }

  public static make(identifier: string, name: string, datatype: DataType, description: string): SimpleItemSummary {
    Confirm.requiresValid(identifier);
    Confirm.requiresValidString(name);
    Confirm.requiresValid(description);
    Confirm.requiresValid(datatype);
    return new SimpleItemSummary(identifier, name, datatype, description, new Array<Point>());
  }
  public static makeWithPoints(
    identifier: string,
    name: string,
    datatype: DataType,
    description: string,
    points: Point[],
  ): SimpleItemSummary {
    Confirm.requiresValid(identifier);
    Confirm.requiresValidString(name);
    Confirm.requiresValid(description);
    Confirm.requiresValid(datatype);
    Confirm.requiresValid(points);
    return new SimpleItemSummary(identifier, name, datatype, description, points);
  }
  // temorary
  public static makeDummyWithId(identifier: string, datatype?: DataType): SimpleItemSummary {
    Confirm.requiresValid(identifier);
    datatype = (datatype != null) ? datatype : DataType.UNKNOWN;
    const text = '***NOT A REAL ITEM SUMMARY***';
    return new SimpleItemSummary(identifier, text, datatype, text, new Array<Point>());
  }

  getName(): string {
    return this.name;
  }
  getIdentifier(): string {
    return this.identifier;
  }
  getDataType(): DataType {
    return this.datatype;
  }
  getDescription(): string {
    return this.description;
  }
  getPoints(): Point[] {
    return this.points;
  }

}

