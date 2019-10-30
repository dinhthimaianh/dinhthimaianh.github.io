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

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { TranscriptService } from './Transcript.service';
import 'rxjs/add/operator/toPromise';

import { RestService } from '../rest.service';
import { AppComponent } from '../app.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { PagerService } from '../paging.service';
import * as IPFS from 'ipfs-http-client';
import { Buffer} from 'buffer';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-transcript',
  templateUrl: './Transcript.component.html',
  styleUrls: ['./Transcript.component.css'],
  providers: [TranscriptService, RestService, PagerService]
})
export class TranscriptComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private graduateTranscriptList;
  private asset;
  private currentId;
  private errorMessage;
  public searchText : string;
  private authenticated = false;
  private pager: any = {};
  private pagerAll: any = {};
  private pagerGrad: any = {};
  private pagedItems;
  private pagedAllItems;
  private pagedGradItems;
  public file: File;
  private fileName;
  private fileList: FileList;
  private buffer;
  public imageUrl:any;
  public image: Blob;

  owner = new FormControl('', Validators.required);
  course = new FormControl('', Validators.required);
  avg = new FormControl('', Validators.required);
  creditsTotal = new FormControl('', Validators.required);
  certificateLink = new FormControl('', Validators.required);

  constructor(public serviceTranscript: TranscriptService, fb: FormBuilder
              , private restService:RestService, public app: AppComponent
              , private pagerService: PagerService, private domSanitizer: DomSanitizer,private httpClient: HttpClient) {
    this.myForm = fb.group({
      owner: this.owner,
      course: this.course,
      avg: this.avg,
      creditsTotal: this.creditsTotal,
      certificateLink: this.certificateLink
    });
  };

  ngOnInit(): void {
    this.checkPing();
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
    var courseList = [];
    var gtList = [];
    var flag = true;
    return this.serviceTranscript.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(asset => {
        courseList = asset.course;
        courseList.forEach(course => {
            if(course.courseGrade < 5) flag = false;
        })
        if(flag && asset.creditsTotal == 113){
            gtList.push(asset);
        }else{
          tempList.push(asset);
        }


      });
      this.allAssets = tempList;
      this.graduateTranscriptList = gtList;
      this.setPageAll(1);
      this.setPageGrad(1);
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

  setPage(page: number, course: any) {
        // get pager object from service
        this.pager = this.pagerService.getPager(course.length, page);
        // get current page of items
        this.pagedItems = course.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }
  setPageAll(page: number) {
        // get pager object from service
        this.pagerAll = this.pagerService.getPager(this.allAssets.length, page);
        // get current page of items
        this.pagedAllItems = this.allAssets.slice(this.pagerAll.startIndex, this.pagerAll.endIndex + 1);
  }
  setPageGrad(page: number) {
        // get pager object from service
        this.pagerGrad = this.pagerService.getPager(this.graduateTranscriptList.length, page);
        // get current page of items
        this.pagedGradItems = this.graduateTranscriptList.slice(this.pagerGrad.startIndex, this.pagerGrad.endIndex + 1);
  }

  fileChange(event: EventTarget){
      const reader = new FileReader();
      let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
      let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
      let files: FileList = target.files;
      const file = target.files[0];
      this.fileName = file.name;
      reader.readAsDataURL(file);
      reader.onload = () => {
          this.buffer = Buffer.from(reader.result);
       };
  }

  insertCert(form: any) {
    var ipfs = IPFS({ host: '192.168.56.101', port: '5007', protocol: 'https' });
    ipfs.add(this.buffer)
      .then((response) => {
        let url = response[0].hash
        this.asset = {
          $class: 'fpt.edu.vn.Transcript',
          'course': this.course.value,
          'avg': this.avg.value,
          'creditsTotal': this.creditsTotal.value,
          'certificateLink': url
        };
        return this.serviceTranscript.updateAsset(form.get('owner').value, this.asset)
        .toPromise()
        .then(() => {
          this.errorMessage = null;
          this.loadAll();
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
    )
  }


  async dataURItoBlob(dataURI) {
      var ipfs = IPFS({ host: '192.168.56.101', port: '8081', protocol: 'https' })
      let result = await ipfs.get('/ipfs/' + dataURI);
      this.imageUrl = await this.httpClient.get('https://192.168.56.101:8081/ipfs/' + dataURI, {responseType: 'text'}).toPromise();
  }


	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the asset field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the asset updateDialog.
   * @param {String} name - the name of the asset field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified asset field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'fpt.edu.vn.Transcript',
      'owner': this.owner.value,
      'course': this.course.value,
      'avg': this.avg.value,
      'creditsTotal': this.creditsTotal.value,
      'certificateLink': this.certificateLink.value
    };

    this.myForm.setValue({
      'owner': null,
      'course': null,
      'avg': null,
      'creditsTotal': null,
      'certificateLink': null
    });

    return this.serviceTranscript.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'owner': null,
        'course': null,
        'avg': null,
        'creditsTotal': null,
        'certificateLink': null
      });
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
          this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else {
          this.errorMessage = error;
      }
    });
  }


  updateAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'fpt.edu.vn.Transcript',
      'course': this.course.value,
      'avg': this.avg.value,
      'creditsTotal': this.creditsTotal.value,
      'certificateLink': this.certificateLink.value
    };

    return this.serviceTranscript.updateAsset(form.get('owner').value, this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
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


  deleteAsset(): Promise<any> {

    return this.serviceTranscript.deleteAsset(this.currentId)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
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

  setId(id: any): void {
    this.currentId = id;
  }

  getForm(id: any): Promise<any> {

    return this.serviceTranscript.getAsset(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'owner': null,
        'course': null,
        'avg': null,
        'creditsTotal': null,
        'certificateLink': null
      };

      if (result.owner) {
        formObject.owner = result.owner;
      } else {
        formObject.owner = null;
      }

      if (result.course) {
        formObject.course = result.course;
      } else {
        formObject.course = null;
      }

      if (result.avg) {
        formObject.avg = result.avg;
      } else {
        formObject.avg = null;
      }

      if (result.creditsTotal) {
        formObject.creditsTotal = result.creditsTotal;
      } else {
        formObject.creditsTotal = null;
      }

      if (result.certificateLink) {
        formObject.certificateLink = result.certificateLink;
      } else {
        formObject.certificateLink = null;
      }

      this.myForm.setValue(formObject);

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

  resetForm(): void {
    this.myForm.setValue({
      'owner': null,
      'course': null,
      'avg': null,
      'creditsTotal': null,
      'certificateLink': null
      });
  }

}
