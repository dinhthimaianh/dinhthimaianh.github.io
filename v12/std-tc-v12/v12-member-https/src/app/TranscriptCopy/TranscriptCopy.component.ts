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
import { TranscriptCopyService } from './TranscriptCopy.service';
import 'rxjs/add/operator/toPromise';

import { RestService } from '../rest.service';
import { AppComponent } from '../app.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { MemberService } from '../Member/Member.service';
import 'rxjs/add/operator/toPromise';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
declare let $

import { PagerService } from '../paging.service';
import * as IPFS from 'ipfs-http-client';
import { Buffer} from 'buffer';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-transcriptcopy',
  templateUrl: './TranscriptCopy.component.html',
  styleUrls: ['./TranscriptCopy.component.css'],
  providers: [TranscriptCopyService, MemberService, RestService, PagerService]
})
export class TranscriptCopyComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
  private errorMessage;
  private currentUser;
  private allParticipants;
  private participant;
  private authenticated = false;

  private graduateTranscriptList;
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
  authorized = new FormControl('', Validators.required);
  creditsTotal = new FormControl('', Validators.required);
  certificateLink = new FormControl('', Validators.required);

  constructor(public serviceTranscriptCopy: TranscriptCopyService, fb: FormBuilder
              , public memberService: MemberService,private restService:RestService
              , public app: AppComponent, private pagerService: PagerService
              , private domSanitizer: DomSanitizer,private httpClient: HttpClient) {
    this.myForm = fb.group({
      owner: this.owner,
      course: this.course,
      avg: this.avg,
      authorized: this.authorized,
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
            this.loadParticipant();
          }
      },
        (err: HttpErrorResponse) => {
        }
      );
  }

  exportAsPDF(htmlID:string, tableID: string, owner:string) {
    this.participant = this.allParticipants[0];
    if(owner === this.participant.email){
        console.log(this.participant);
        var doc = new jsPDF();
        doc.setFontStyle('arial');
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        var img = new Image();
        img.src = '../../assets/images/img-logo-fe.jpg';
        doc.addImage(img, 'png', 20, 20);
        doc.line(10, 70,200, 70);
        doc.text('INTERIM ACADEMIC TRANSCRIPT', pageWidth / 2, 90, 'center')
        doc.autoTable({
            body: this.bodyRows(this.participant),
            startY: 95,
            theme: 'plain'
        });
        let finalY = doc.previousAutoTable.finalY;
        doc.autoTable({html: '#' + tableID, margin: {top: finalY + 10}});
        finalY = doc.previousAutoTable.finalY;
        doc.text('FPT University', pageWidth - 25, finalY + 15, 'right')
        doc.text('TS. Tran Ngoc Tuan', pageWidth - 20, finalY + 55, 'right')
        //doc.fromHTML($('#' + htmlID).get(0), 20,20);
        var fileName = owner + '_transcript.pdf'
        doc.save(fileName);
    } else {
        alert('You dont have right to print this transcript of ' + owner);
    }
  }
  headRows() {
      return [{
          email: 'Email',
          major: 'Major'
      }];
  }

  bodyRows(pdfBody) {
      let body = [];
      body.push({
          columnOne: 'Email: ' + pdfBody.email,
          columnTwo: 'Name: ' + pdfBody.name
        });
      body.push({
          columnOne: 'Roll no. : ' + pdfBody.memberCode,
          columnTwo: 'Major: ' + this.getMajors(pdfBody.major)
      });
      body.push({
          columnOne: 'Mode of study: full time'
      });
    return body;
  }

  getMajors(majorCode:string){
    switch(majorCode) {
       case "IA": {
          return "Information Assurance";
       }
       case "SE": {
          return "Software Engineering";
       }
       default: {
          return majorCode;
       }
    }
  }

  loadParticipant(): Promise<any> {
    const tempList = [];
    return this.memberService.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(participant => {
        tempList.push(participant);
      });
      this.allParticipants = tempList;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
        this.errorMessage = error;
      }
    });
  }

  loadAll(): Promise<any> {
    const tempList = [];
    var courseList = [];
    var gtList = [];
    var flag = true;
    return this.serviceTranscriptCopy.getAll()
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
      $class: 'fpt.edu.vn.TranscriptCopy',
      'owner': this.owner.value,
      'course': this.course.value,
      'avg': this.avg.value,
      'authorized': this.authorized.value,
      'creditsTotal': this.creditsTotal.value,
      'certificateLink': this.certificateLink.value
    };

    this.myForm.setValue({
      'owner': null,
      'course': null,
      'avg': null,
      'authorized': null,
      'creditsTotal': null,
      'certificateLink': null
    });

    return this.serviceTranscriptCopy.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'owner': null,
        'course': null,
        'avg': null,
        'authorized': null,
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
      $class: 'fpt.edu.vn.TranscriptCopy',
      'course': this.course.value,
      'avg': this.avg.value,
      'authorized': this.authorized.value,
      'creditsTotal': this.creditsTotal.value,
      'certificateLink': this.certificateLink.value
    };

    return this.serviceTranscriptCopy.updateAsset(form.get('owner').value, this.asset)
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

    return this.serviceTranscriptCopy.deleteAsset(this.currentId)
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

    return this.serviceTranscriptCopy.getAsset(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'owner': null,
        'course': null,
        'avg': null,
        'authorized': null,
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

      if (result.authorized) {
        formObject.authorized = result.authorized;
      } else {
        formObject.authorized = null;
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
      'authorized': null,
      'creditsTotal': null,
      'certificateLink': null
      });
  }

}
