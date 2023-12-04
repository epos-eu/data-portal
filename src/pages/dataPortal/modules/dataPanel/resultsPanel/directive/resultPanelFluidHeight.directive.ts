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
import {
    AfterViewInit,
    Directive,
    ElementRef,
    HostBinding,
    Input,
    OnDestroy,
    Renderer2,
} from '@angular/core';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';


@Unsubscriber('subscriptions')
@Directive({
    selector: '[appResultPanelFluidHeight]',
})
export class ResultPanelFluidHeightDirective implements AfterViewInit, OnDestroy {
    @Input() minHeight: number;
    @Input() offsetHeight: number | undefined;
    @Input('appResultPanelFluidHeight') topOffset: number | undefined;
    @HostBinding('style.overflow-y') overflowY = 'auto';

    private domElement: HTMLElement;
    private resizeSub: Subscription;

    private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

    constructor(private renderer: Renderer2,
        private elementRef: ElementRef,
        private readonly panelsEvent: PanelsEmitterService) {
        // get ref HTML element
        this.domElement = this.elementRef.nativeElement as HTMLElement;

        // register on window resize event
        this.resizeSub = fromEvent(window, 'resize')
            .pipe(throttleTime(500), debounceTime(500))
            .subscribe(() => this.setHeight());
    }

    ngAfterViewInit(): void {
        this.setHeight();

        this.subscriptions.push(
            this.panelsEvent.invokeDataPanelToggle.subscribe(() => {
                this.setHeight();
            })
        );

    }

    ngOnDestroy(): void {
        this.resizeSub.unsubscribe();
    }

    /**
     * It sets the height of the element
     */
    private setHeight() {
        const windowHeight = window?.innerHeight;
        const topOffset = this.topOffset || this.calcTopOffset();
        const offsetHeight = this.offsetHeight || 0;
        let height = windowHeight - topOffset - offsetHeight;

        if (this.minHeight && height < this.minHeight) {
            height = this.minHeight;
        }

        this.renderer.setStyle(this.domElement, 'height', `${height}px`);
    }

    /**
     * It returns the distance from the top of the page to the top of the element
     * @returns The top offset of the element.
     */
    private calcTopOffset(): number {
        try {
            const rect = this.domElement.getBoundingClientRect();
            const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;

            return rect.top + scrollTop;
        } catch (e) {
            return 0;
        }
    }

}
