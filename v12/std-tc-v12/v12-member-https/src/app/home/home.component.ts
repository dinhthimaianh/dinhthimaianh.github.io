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
//import { Component } from '@angular/core';
import { Component, OnInit} from '@angular/core';

import { RestService } from '../rest.service';
import { AppComponent } from '../app.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [RestService]
})
export class HomeComponent implements OnInit{
  private authenticated = false;
  private showImportCard = false;
  public file: File;

  constructor (private restService: RestService, public app: AppComponent) {
  }

  ngOnInit() {
    this.checkPing();
  }

  checkPing(){
    return this.restService.checkExitCard()
      .then((results) => {
          if (results['identity'].length > 0) {
            this.authenticated = true;
            this.app.loadParticipant();
            this.app.show();
          }
      },
        (err: HttpErrorResponse) => {
          var errorx = err.error[Object.keys(err.error)[0]];
          if(errorx['message'] == 'A business network card has not been specified'){
              this.showImportCard = true;
          }
        }
      );
  }

  fileChange(event: EventTarget){
      let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
      let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
      let files: FileList = target.files;
      this.file = files[0];
  }


  onSignUp() {
    console.log(this.file);

    return this.restService.importCard(this.file).then(() => {this.checkPing();});
  }
}
