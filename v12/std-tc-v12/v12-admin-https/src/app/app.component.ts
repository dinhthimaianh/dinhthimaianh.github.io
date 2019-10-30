/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, AfterViewInit, OnInit } from '@angular/core';
import $ from 'jquery';
import { RestService } from './rest.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [RestService]
})
export class AppComponent implements AfterViewInit {
  title = 'app works!';
  private authenticated = false;
  visible: boolean;
  public role;
  private errorMessage;

  constructor(public restService: RestService) { this.visible = false; }

  ngOnInit(): void {
    this.checkPing();
  }

  checkPing(){
    return this.restService.checkExitCard()
      .then((results) => {
          if (results['participant'].length > 0) {
            if (results['participant'].includes('ADComposerCP')) {
                this.role = "Admin";
            } else if (results['participant'].includes('Staff')){
                this.role = "Staff";
            }
          }
      },
        (err: HttpErrorResponse) => {
        }
      );
  }

  hide() { this.visible = false; }

  show() { this.visible = true; }

  ngAfterViewInit() {
    $('.nav a').on('click', function(){
      $('.nav').find('.active').removeClass('active');
      $(this).parent().addClass('active');
    });

    $('.dropdown').on('show.bs.dropdown', function(e){
      $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
    });

    $('.dropdown').on('hide.bs.dropdown', function(e){
      $(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
    });

    $('.dropdown-menu li').on('click', function(){
      $(this).parent().parent().addClass('active');
    });
  }
}
