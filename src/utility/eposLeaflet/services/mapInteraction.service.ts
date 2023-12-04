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
import { Injectable } from '@angular/core';
import { BoundingBox } from 'api/webApi/data/boundingBox.interface';
import { SimpleBoundingBox } from 'api/webApi/data/impl/simpleBoundingBox';
import { Subject } from 'rxjs';
import { LoadingService } from 'services/loading.service';
import { Model } from 'services/model/model.service';
import { Accessor } from 'utility/accessor';


/** The MapInteractionService class provides methods for interacting with a map, such as setting the
spatial range, centering the map on a bounding box or coordinates, and triggering events when
clicking on the map. */
@Injectable()
export class MapInteractionService {

  static initialLatLng: [number, number] = [44, 3.15];
  static initialZoom = 5;

  public readonly startBBox = new Accessor<boolean>(false);
  public readonly centerMapBBox = new Accessor<BoundingBox>(SimpleBoundingBox.makeUnbounded());
  public readonly editableSpatialRange = new Accessor<BoundingBox>(SimpleBoundingBox.makeUnbounded());
  public readonly spatialRange = new Accessor<BoundingBox>(SimpleBoundingBox.makeUnbounded());
  public readonly mapBBox = new Accessor<BoundingBox>(SimpleBoundingBox.makeUnbounded());
  public readonly pointOnlayerTriggered = new Subject<null | Map<string, Array<number> | string>>();
  public readonly overlayPane = new Subject<boolean>();

  /**
   * The constructor function takes in a model and a loading service as parameters and assigns them to
   * private and public properties respectively.
   * @param {Model} model - The "model" parameter is of type "Model". It is a private readonly
   * property, which means it can only be accessed within the class and its value cannot be changed
   * once it is assigned.
   * @param {LoadingService} loadingService - The `loadingService` parameter is of type
   * `LoadingService`. It is a public property that can be accessed from outside the class.
   */
  constructor(
    private readonly model: Model,
    public loadingService: LoadingService,
  ) {
  }

  /**
   * The function sets the spatial range and data search bounds based on the given bounding box, with
   * an option to force the update even if the bounding box is not bounded.
   * @param {BoundingBox} bbox - The parameter "bbox" is of type BoundingBox. It represents the
   * bounding box that will be used to set the spatial range.
   * @param [force=false] - The "force" parameter is a boolean value that determines whether to set the
   * bounding box spatial range even if the given bounding box is not bounded. If "force" is set to
   * true, the spatial range will be set regardless of whether the bounding box is bounded or not. If
   * "force" is
   */
  public setBoundingBoxSpatialRangeFromControl(bbox: BoundingBox, force = false): void {
    if (bbox.isBounded() || force) {
      this.spatialRange.set(bbox);
      this.model.dataSearchBounds.set(bbox);
    }
  }

  /**
   * The function "resetAll" resets various bounding boxes and flags to their initial values.
   */
  public resetAll(): void {
    const resetBbox = SimpleBoundingBox.makeUnbounded();
    this.startBBox.set(false);
    this.centerOnInitial();
    this.editableSpatialRange.set(resetBbox);
    this.spatialRange.set(resetBbox);
    this.mapBBox.set(resetBbox);
  }

  /**
   * The function "centerOnInitial" sets the center of the map to the initial latitude and longitude
   * coordinates.
   */
  public centerOnInitial(): void {
    this.centerMapBBox.set(
      new SimpleBoundingBox(
        MapInteractionService.initialLatLng[0],
        MapInteractionService.initialLatLng[1],
        MapInteractionService.initialLatLng[0],
        MapInteractionService.initialLatLng[1]
      )
    );
  }

  /**
   * The function "centerMapOnBoundingBox" sets the center of the map to the given bounding box.
   * @param {BoundingBox} bbox - The parameter `bbox` is of type `BoundingBox`.
   */
  public centerMapOnBoundingBox(bbox: BoundingBox): void {
    this.centerMapBBox.set(bbox);
  }

  /**
   * The function "clickOnMaps" triggers an event with information about a clicked point on a map.
   * @param {string} layerId - A string representing the ID of the layer on the map.
   * @param {string | null} propertyId - The propertyId parameter is a string or null value. It
   * represents the ID of a property associated with the map layer.
   * @param coordinates - The "coordinates" parameter is an array of numbers representing the latitude
   * and longitude values of a location on a map. It should have two elements, where the first element
   * is the latitude and the second element is the longitude.
   * @param {boolean} imageOverlay - The `imageOverlay` parameter is a boolean value that indicates
   * whether an image overlay should be displayed on the map. If `imageOverlay` is `true`, an image
   * overlay will be displayed. If `imageOverlay` is `false`, no image overlay will be displayed.
   */
  public clickOnMaps(layerId: string, propertyId: string | null, coordinates: Array<number>, imageOverlay: boolean): void {
    const pointsOnMap = new Map();
    pointsOnMap.set('layerId', layerId);
    pointsOnMap.set('coordinates', coordinates);
    pointsOnMap.set('propertyId', propertyId);
    pointsOnMap.set('imageOverlay', imageOverlay);
    this.pointOnlayerTriggered.next(pointsOnMap as null | Map<string, Array<number> | string>);
  }

  /**
   * The function `centerMapOnCoordinates` takes an array of coordinates and sets the map's bounding
   * box to center on those coordinates.
   * @param coordinates - The `coordinates` parameter is an array of numbers representing the latitude
   * and longitude values of a location. The first element of the array represents the latitude, and
   * the second element represents the longitude.
   */
  public centerMapOnCoordinates(coordinates: Array<number>): void {
    this.centerMapBBox.set(
      new SimpleBoundingBox(
        coordinates[1],
        coordinates[0],
        coordinates[1],
        coordinates[0]
      )
    );
  }

  /**
   * The function sets the value of the overlayPane variable to the given boolean value.
   * @param {boolean} val - The "val" parameter is a boolean value that determines whether the overlay
   * pane should be set or not.
   */
  public setOverlayPane(val: boolean): void {
    this.overlayPane.next(val);
  }

}
