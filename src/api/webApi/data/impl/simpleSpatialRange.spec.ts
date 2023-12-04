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
import { } from 'jasmine';
import { SpatialRange } from '../spatialRange.interface';
import { SimpleSpatialRange } from './simpleSpatialRange';
import { SimpleBoundingBox } from './simpleBoundingBox';


describe('test SimpleSpatialRange intersection:', () => {

    it('test all combinations against each other', () => {

        // Spatial ranges
        const pointInEurope: SpatialRange = SimpleSpatialRange.makePoint(-1.0773, 52.87896);
        const unknown: SpatialRange = SimpleSpatialRange.makeUnknown();
        const unbounded: SpatialRange = SimpleSpatialRange.makeUnbounded();
        const europe: SpatialRange = SimpleSpatialRange.makeGeoRect(SimpleBoundingBox.makeFromArray([60, 15, 30, -15]));
        const africa: SpatialRange = SimpleSpatialRange.makeGeoRect(SimpleBoundingBox.makeFromArray([40, 55, -40, -20]));
        const hawaii: SpatialRange = SimpleSpatialRange.makeGeoRect(SimpleBoundingBox.makeFromArray([22, -151, 16, -161]));
        const pacificIncAntiMeridian: SpatialRange = SimpleSpatialRange.makeGeoRect(SimpleBoundingBox.makeFromArray([58, -71, -37, 140]));
        const northAmerica: SpatialRange = SimpleSpatialRange.makeGeoRect(SimpleBoundingBox.makeFromArray([69, -53, 16, -162]));
        const australia: SpatialRange = SimpleSpatialRange.makeGeoRect(SimpleBoundingBox.makeFromArray([-4, 162, -46, 104]));

        // Test cases
        const expected: Map<Case, boolean> = new Map();


        // pointInEurope with...
        expected.set(new Case('pointInEurope & pointInEurope', pointInEurope, pointInEurope), true);
        expected.set(new Case('pointInEurope & unknown', pointInEurope, unknown), false);
        expected.set(new Case('pointInEurope & unbounded', pointInEurope, unbounded), true); // any unbounded should still match an unknown
        expected.set(new Case('pointInEurope & europe', pointInEurope, europe), true);
        expected.set(new Case('pointInEurope & africa', pointInEurope, africa), false);
        expected.set(new Case('pointInEurope & hawaii', pointInEurope, hawaii), false);
        expected.set(new Case('pointInEurope & pacificIncAntiMeridian', pointInEurope, pacificIncAntiMeridian), false);
        expected.set(new Case('pointInEurope & northAmerica', pointInEurope, northAmerica), false);
        expected.set(new Case('pointInEurope & australia', pointInEurope, australia), false);

        // Unknown with...
        expected.set(new Case('unknown & unknown', unknown, unknown), false);
        expected.set(new Case('unknown & unbounded', unknown, unbounded), true); // any unbounded should still match an unknown
        expected.set(new Case('unknown & europe', unknown, europe), false);
        expected.set(new Case('unknown & africa', unknown, africa), false);
        expected.set(new Case('unknown & hawaii', unknown, hawaii), false);
        expected.set(new Case('unknown & pacificIncAntiMeridian', unknown, pacificIncAntiMeridian), false);
        expected.set(new Case('unknown & northAmerica', unknown, northAmerica), false);
        expected.set(new Case('unknown & australia', unknown, australia), false);

        // Unbounded with...
        expected.set(new Case('unbounded & unbounded', unbounded, unbounded), true);
        expected.set(new Case('unbounded & unknown', unbounded, unknown), true); // any unbounded should still match an unknown
        expected.set(new Case('unbounded & europe', unbounded, europe), true);
        expected.set(new Case('unbounded & africa', unbounded, africa), true);
        expected.set(new Case('unbounded & hawaii', unbounded, hawaii), true);
        expected.set(new Case('unbounded & pacificIncAntiMeridian', unbounded, pacificIncAntiMeridian), true);
        expected.set(new Case('unbounded & northAmerica', unbounded, northAmerica), true);
        expected.set(new Case('unbounded & australia', unbounded, australia), true);

        // Europe with...
        expected.set(new Case('europe & unknown', europe, unknown), false);
        expected.set(new Case('europe & unbounded', europe, unbounded), true);
        expected.set(new Case('europe & europe', europe, europe), true);
        expected.set(new Case('europe & africa', europe, africa), true);
        expected.set(new Case('europe & hawaii', europe, hawaii), false);
        expected.set(new Case('europe & pacificIncAntiMeridian', europe, pacificIncAntiMeridian), false);
        expected.set(new Case('europe & northAmerica', europe, northAmerica), false);
        expected.set(new Case('europe & australia', europe, australia), false);

        // Africa with...
        expected.set(new Case('africa & unknown', africa, unknown), false);
        expected.set(new Case('africa & unbounded', africa, unbounded), true);
        expected.set(new Case('africa & europe', africa, europe), true);
        expected.set(new Case('africa & africa', africa, africa), true);
        expected.set(new Case('africa & hawaii', africa, hawaii), false);
        expected.set(new Case('africa & pacificIncAntiMeridian', africa, pacificIncAntiMeridian), false);
        expected.set(new Case('africa & northAmerica', africa, northAmerica), false);
        expected.set(new Case('africa & australia', africa, australia), false);

        // Hawaii with...
        expected.set(new Case('hawaii & unknown', hawaii, unknown), false);
        expected.set(new Case('hawaii & unbounded', hawaii, unbounded), true);
        expected.set(new Case('hawaii & europe', hawaii, europe), false);
        expected.set(new Case('hawaii & africa', hawaii, africa), false);
        expected.set(new Case('hawaii & hawaii', hawaii, hawaii), true);
        expected.set(new Case('hawaii & pacificIncAntiMeridian', hawaii, pacificIncAntiMeridian), true);
        expected.set(new Case('hawaii & northAmerica', hawaii, northAmerica), true);
        expected.set(new Case('hawaii & australia', hawaii, australia), false);

        // Pacific with...
        expected.set(new Case('pacificIncAntiMeridian & unknown', pacificIncAntiMeridian, unknown), false);
        expected.set(new Case('pacificIncAntiMeridian & unbounded', pacificIncAntiMeridian, unbounded), true);
        expected.set(new Case('pacificIncAntiMeridian & europe', pacificIncAntiMeridian, europe), false);
        expected.set(new Case('pacificIncAntiMeridian & africa', pacificIncAntiMeridian, africa), false);
        expected.set(new Case('pacificIncAntiMeridian & hawaii', pacificIncAntiMeridian, hawaii), true);
        expected.set(new Case('pacificIncAntiMeridian & pacificIncAntiMeridian', pacificIncAntiMeridian, pacificIncAntiMeridian), true);
        expected.set(new Case('pacificIncAntiMeridian & northAmerica', pacificIncAntiMeridian, northAmerica), true);
        expected.set(new Case('pacificIncAntiMeridian & australia', pacificIncAntiMeridian, australia), true);

        // North America with...
        expected.set(new Case('northAmerica & unknown', northAmerica, unknown), false);
        expected.set(new Case('northAmerica & unbounded', northAmerica, unbounded), true);
        expected.set(new Case('northAmerica & europe', northAmerica, europe), false);
        expected.set(new Case('northAmerica & africa', northAmerica, africa), false);
        expected.set(new Case('northAmerica & hawaii', northAmerica, hawaii), true);
        expected.set(new Case('northAmerica & pacificIncAntiMeridian', northAmerica, pacificIncAntiMeridian), true);
        expected.set(new Case('northAmerica & northAmerica', northAmerica, northAmerica), true);
        expected.set(new Case('northAmerica & australia', northAmerica, australia), false);

        // Australia with...
        expected.set(new Case('australia & unknown', australia, unknown), false);
        expected.set(new Case('australia & unbounded', australia, unbounded), true);
        expected.set(new Case('australia & europe', australia, europe), false);
        expected.set(new Case('australia & africa', australia, africa), false);
        expected.set(new Case('australia & hawaii', australia, hawaii), false);
        expected.set(new Case('australia & pacificIncAntiMeridian', australia, pacificIncAntiMeridian), true);
        expected.set(new Case('australia & northAmerica', australia, northAmerica), false);
        expected.set(new Case('australia & australia', australia, australia), true);


        // TEST each case
        expected.forEach((ex: boolean, test: Case) => {

            const actual = test.a.intersects(test.b);
            expect(actual).toBe(ex, 'Failed: ' + test.name);

        });


    });


});


class Case {
    constructor(readonly name: string, readonly a: SpatialRange, readonly b: SpatialRange) { }
}
