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
import { MemberService } from './Member.service';
import 'rxjs/add/operator/toPromise';

import {ExcelService} from '../excel.service';
import { RestService } from '../rest.service';
import { AppComponent } from '../app.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-member',
  templateUrl: './Member.component.html',
  styleUrls: ['./Member.component.css'],
  providers: [MemberService, RestService]
})
export class MemberComponent implements OnInit {

  myForm: FormGroup;

  private allParticipants;
  private participant;
  private currentId;
  private errorMessage;
  public searchEmail : string;
  public searchName : string;
  public searchMajor : string;
  public searchRole : string;
  private majorType;
  private authenticated = false;

  email = new FormControl('', Validators.required);
  memberCode = new FormControl('', Validators.required);
  name = new FormControl('', Validators.required);
  major = new FormControl('', Validators.required);
  dob = new FormControl('', Validators.required);
  address = new FormControl('', Validators.required);
  type = new FormControl('', Validators.required);


  constructor(public serviceMember: MemberService, fb: FormBuilder
              , private excelService:ExcelService, private restService:RestService, public app: AppComponent) {
    this.myForm = fb.group({
      email: this.email,
      memberCode: this.memberCode,
      name: this.name,
      major: this.major,
      dob: this.dob,
      address: this.address,
      type: this.type
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
  exportAsXLSX():void {
    var list = [];
    list = this.allParticipants;
    var n = list.length;
    for(var i = 0; i < n; i++){
      var regex = "$class";
      delete list[i][regex];
    }
    this.excelService.exportAsExcelFile(list, 'memberFile');
  }

  loadAll(): Promise<any> {
    const tempList = [];
    this.majorType = [];
    return this.serviceMember.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(participant => {
        if(this.majorType.indexOf(participant.major) < 0){
            this.majorType.push(participant.major);
        }
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

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the participant field to update
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
   * only). This is used for checkboxes in the participant updateDialog.
   * @param {String} name - the name of the participant field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified participant field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addParticipant(form: any): Promise<any> {
    this.participant = {
      $class: 'fpt.edu.vn.Member',
      'email': this.email.value,
      'memberCode': this.memberCode.value,
      'name': this.name.value,
      'major': this.major.value,
      'dob': this.dob.value,
      'address': this.address.value,
      'type': this.type.value
    };

    this.myForm.setValue({
      'email': null,
      'memberCode': null,
      'name': null,
      'major': null,
      'dob': null,
      'address': null,
      'type': null
    });

    return this.serviceMember.addParticipant(this.participant)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'email': null,
        'memberCode': null,
        'name': null,
        'major': null,
        'dob': null,
        'address': null,
        'type': null
      });
      this.restService.signUp(this.participant.email);
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


   updateParticipant(form: any): Promise<any> {
    this.participant = {
      $class: 'fpt.edu.vn.Member',
      'memberCode': this.memberCode.value,
      'name': this.name.value,
      'major': this.major.value,
      'dob': this.dob.value,
      'address': this.address.value,
      'type': this.type.value
    };

    return this.serviceMember.updateParticipant(form.get('email').value, this.participant)
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


  deleteParticipant(): Promise<any> {

    return this.serviceMember.deleteParticipant(this.currentId)
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

    return this.serviceMember.getparticipant(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'email': null,
        'memberCode': null,
        'name': null,
        'major': null,
        'dob': null,
        'address': null,
        'type': null
      };

      if (result.email) {
        formObject.email = result.email;
      } else {
        formObject.email = null;
      }

      if (result.memberCode) {
        formObject.memberCode = result.memberCode;
      } else {
        formObject.memberCode = null;
      }

      if (result.name) {
        formObject.name = result.name;
      } else {
        formObject.name = null;
      }

      if (result.major) {
        formObject.major = result.major;
      } else {
        formObject.major = null;
      }

      if (result.dob) {
        formObject.dob = result.dob;
      } else {
        formObject.dob = null;
      }

      if (result.address) {
        formObject.address = result.address;
      } else {
        formObject.address = null;
      }

      if (result.type) {
        formObject.type = result.type;
      } else {
        formObject.type = null;
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
      'email': null,
      'memberCode': null,
      'name': null,
      'major': null,
      'dob': null,
      'address': null,
      'type': null
    });
  }
}
