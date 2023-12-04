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
import { SimpleTemporalRange } from './simpleTemporalRange';
import { Moment } from 'moment';
import * as moment from 'moment';
import { TemporalRange } from '../temporalRange.interface';


describe('test SimpleTemporalRange intersection:', () => {

    it('test all combinations against a bounded range', () => {

        const lower = moment('1-1-1980', 'MM-DD-YYYY');
        const upper = moment('1-1-2000', 'MM-DD-YYYY');

        // Target for testing
        const bounded = SimpleTemporalRange.makeBounded(lower, upper);

        // ----19----19----19----19----19----20----20----20---
        // ----75----78----80----82----98----00----02----05---
        //
        // --------------- [lower ===== upper] ---------------
        // --- A --- B --- C --- D --- E --- F --- G --- H ---

        const A = lower.clone().subtract(5, 'year');
        const B = lower.clone().subtract(2, 'year');
        const C = lower.clone();
        const D = lower.clone().add(2, 'year');
        const E = upper.clone().subtract(2, 'year');
        const F = upper.clone();
        const G = upper.clone().add(2, 'year');
        const H = upper.clone().add(5, 'year');

        const all: Array<Moment> = [null, A, B, C, D, E, F, G, H, null];

        const candidates: Array<TemporalRange> = [];
        const passWhenUpper: Array<Moment> = [D, E, F, G, H, null];
        const passWhenLower: Array<Moment> = [A, B, C, D, E, null];
        const expected: Array<boolean> = [];

        // Lower
        for (let i = 0; i < all.length; i++) {
            const low = all[i];

            // Upper
            for (let j = i; j < all.length; j++) {
                const up = all[j];
                candidates.push(SimpleTemporalRange.makeUnchecked(low, up));

                const ex = passWhenLower.indexOf(low) >= 0 && passWhenUpper.indexOf(up) >= 0;
                expected.push(ex);
            }
        }

        // Test
        for (let i = 0; i < candidates.length; i++) {

            const result1 = candidates[i].intersects(bounded, 'year');
            const result2 = bounded.intersects(candidates[i], 'year');

            expect(result1).toBe(expected[i]);
            expect(result2).toBe(expected[i]);

        }
    });

    it('test all combinations against a no upper bound range', () => {

        const lower = moment('1-1-1980', 'MM-DD-YYYY');
        const upper = moment('1-1-2000', 'MM-DD-YYYY');

        // Target for testing
        const noUpperBound = SimpleTemporalRange.makeWithoutUpperBound(lower);

        // ----19----19----19----19----19----20----20----20---
        // ----75----78----80----82----98----00----02----05---
        //
        // --------------- [lower ======================= ...]
        // --- A --- B --- C --- D --- E --- F --- G --- H ---

        const A = lower.clone().subtract(5, 'year');
        const B = lower.clone().subtract(2, 'year');
        const C = lower.clone();
        const D = lower.clone().add(2, 'year');
        const E = upper.clone().subtract(2, 'year');
        const F = upper.clone();
        const G = upper.clone().add(2, 'year');
        const H = upper.clone().add(5, 'year');

        const all: Array<Moment> = [null, A, B, C, D, E, F, G, H, null];

        const candidates: Array<TemporalRange> = [];
        const passWhenUpper: Array<Moment> = [D, E, F, G, H, null];
        const passWhenLower: Array<Moment> = [A, B, C, D, E, F, G, H, null];
        const expected: Array<boolean> = [];

        // Lower
        for (let i = 0; i < all.length; i++) {
            const low = all[i];

            // Upper
            for (let j = i; j < all.length; j++) {
                const up = all[j];
                candidates.push(SimpleTemporalRange.makeUnchecked(low, up));

                const ex = passWhenLower.indexOf(low) >= 0 && passWhenUpper.indexOf(up) >= 0;
                expected.push(ex);
            }
        }

        // Test
        for (let i = 0; i < candidates.length; i++) {

            const result1 = candidates[i].intersects(noUpperBound, 'year');
            const result2 = noUpperBound.intersects(candidates[i], 'year');

            expect(result1).toBe(expected[i]);
            expect(result2).toBe(expected[i]);

        }
    });


    it('test all combinations against a no lower bound range', () => {

        const lower = moment('1-1-1980', 'MM-DD-YYYY');
        const upper = moment('1-1-2000', 'MM-DD-YYYY');

        // Target for testing
        const noLowerBound = SimpleTemporalRange.makeWithoutLowerBound(upper);

        // ----19----19----19----19----19----20----20----20---
        // ----75----78----80----82----98----00----02----05---
        //
        // [... ======================= upper] ---------------
        // --- A --- B --- C --- D --- E --- F --- G --- H ---

        const A = lower.clone().subtract(5, 'year');
        const B = lower.clone().subtract(2, 'year');
        const C = lower.clone();
        const D = lower.clone().add(2, 'year');
        const E = upper.clone().subtract(2, 'year');
        const F = upper.clone();
        const G = upper.clone().add(2, 'year');
        const H = upper.clone().add(5, 'year');

        const all: Array<Moment> = [null, A, B, C, D, E, F, G, H, null];

        const candidates: Array<TemporalRange> = [];
        const passWhenUpper: Array<Moment> = [A, B, C, D, E, F, G, H, null];
        const passWhenLower: Array<Moment> = [A, B, C, D, E, null];
        const expected: Array<boolean> = [];

        // Lower
        for (let i = 0; i < all.length; i++) {
            const low = all[i];

            // Upper
            for (let j = i; j < all.length; j++) {
                const up = all[j];
                candidates.push(SimpleTemporalRange.makeUnchecked(low, up));

                const ex = passWhenLower.indexOf(low) >= 0 && passWhenUpper.indexOf(up) >= 0;
                expected.push(ex);
            }
        }

        // Test
        for (let i = 0; i < candidates.length; i++) {

            const result1 = candidates[i].intersects(noLowerBound, 'year');
            const result2 = noLowerBound.intersects(candidates[i], 'year');

            expect(result1).toBe(expected[i]);
            expect(result2).toBe(expected[i]);

        }
    });

    it('test all combinations against an unbounded range', () => {

        const lower = moment('1-1-1980', 'MM-DD-YYYY');
        const upper = moment('1-1-2000', 'MM-DD-YYYY');

        // Target for testing
        const unbounded = SimpleTemporalRange.makeUnbounded();

        // ----19----19----19----19----19----20----20----20---
        // ----75----78----80----82----98----00----02----05---
        //
        // ... =========================================== ...
        // --- A --- B --- C --- D --- E --- F --- G --- H ---

        const A = lower.clone().subtract(5, 'year');
        const B = lower.clone().subtract(2, 'year');
        const C = lower.clone();
        const D = lower.clone().add(2, 'year');
        const E = upper.clone().subtract(2, 'year');
        const F = upper.clone();
        const G = upper.clone().add(2, 'year');
        const H = upper.clone().add(5, 'year');

        const all: Array<Moment> = [null, A, B, C, D, E, F, G, H, null];

        const candidates: Array<TemporalRange> = [];
        const expected: Array<boolean> = [];

        // Lower
        for (let i = 0; i < all.length; i++) {
            const low = all[i];

            // Upper
            for (let j = i; j < all.length; j++) {
                const up = all[j];
                candidates.push(SimpleTemporalRange.makeUnchecked(low, up));
                expected.push(true);
            }
        }

        // Test
        for (let i = 0; i < candidates.length; i++) {

            const result1 = candidates[i].intersects(unbounded, 'year');
            const result2 = unbounded.intersects(candidates[i], 'year');

            expect(result1).toBe(expected[i]);
            expect(result2).toBe(expected[i]);

        }



    });

});
