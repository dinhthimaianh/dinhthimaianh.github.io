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

import { Component, OnInit } from '@angular/core';

import { RestService } from '../rest.service';
import { AppComponent } from '../app.component';
import { TranscriptService } from '../Transcript/Transcript.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import * as IPFS from 'ipfs-http-client';

@Component({
  selector: 'app-home',
  templateUrl: './GraduatedTranscripts.component.html',
  styleUrls: ['./GraduatedTranscripts.component.css'],
  providers: [TranscriptService, RestService]
})
export class GraduatedTranscriptsComponent {
  private authenticated = false;
  private allAssets;
  private asset;
  private currentId;
  private errorMessage;

  constructor (private restService: RestService, public app: AppComponent
              ,public serviceTranscript: TranscriptService, private httpClient: HttpClient) {
  }

  ngOnInit() {
      this.checkPing();
      var ipfs = IPFS({ host: '192.168.56.101', port: '8081', protocol: 'https' })
      const validCID = 'QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9Ba8nUH4uVv'

      ipfs.get(validCID + '/readme', function (err, files) {
        if(files){
          files.forEach((file) => {
            console.log(file.path)
            console.log(file.content.toString('utf8'))
          })
        }
      })
  }
  checkPing(){
    return this.restService.checkExitCard()
      .then((results) => {
          console.log(results['identity'])
          if (results['identity'].length > 0) {
            this.authenticated = true;
            this.app.show();
            this.loadAll();
          }
      },
        (err: HttpErrorResponse) => {
        }
      );
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.serviceTranscript.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(asset => {
        tempList.push(asset);
      });
      this.allAssets = tempList;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }
}
