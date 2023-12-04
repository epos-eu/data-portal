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
import { AAAIUser } from './aaaiUser.interface';
import { Observable } from 'rxjs';

/** Authentication Provider, abstraction via interface allow us to change the mode of authentication
 * without changes rippling throught he app. */
export interface AuthenticationProvider {
  /**
   * Attempt to login.
   */
  login(): void;

  /**
   * Attempt to logout.
   */
  logout(): void;

  watchForUserChange(): Observable<null | AAAIUser>;
  getUser(): null | AAAIUser;

  getManageUrl(): string;
}
