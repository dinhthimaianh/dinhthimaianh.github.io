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
import { AddManyMembersService } from './AddManyMembers.service';
import 'rxjs/add/operator/toPromise';

import { RestService } from '../rest.service';
import { AppComponent } from '../app.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-addmanymembers',
  templateUrl: './AddManyMembers.component.html',
  styleUrls: ['./AddManyMembers.component.css'],
  providers: [AddManyMembersService, RestService]
})
export class AddManyMembersComponent implements OnInit {

  myForm: FormGroup;

  private allTransactions;
  private Transaction;
  private currentId;
  private errorMessage;
  private authenticated = false;
  private emailList;

  data = new FormControl('', Validators.required);
  transactionId = new FormControl('', Validators.required);
  timestamp = new FormControl('', Validators.required);


  constructor(private serviceAddManyMembers: AddManyMembersService, fb: FormBuilder
              , private restService:RestService, public app: AppComponent) {
    this.myForm = fb.group({
      data: this.data,
      transactionId: this.transactionId,
      timestamp: this.timestamp
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

  issueID(){
    var n = this.emailList.length;
    for(var i = n - 1; i >= 0; --i){
      this.restService.signUp(this.emailList[i]);
    }
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.serviceAddManyMembers.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(transaction => {
        tempList.push(transaction);
      });
      this.allTransactions = tempList;
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

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the transaction field to update
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
   * only). This is used for checkboxes in the transaction updateDialog.
   * @param {String} name - the name of the transaction field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified transaction field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addTransaction(form: any): Promise<any> {
    this.Transaction = {
      $class: 'fpt.edu.vn.AddManyMembers',
      'data': (<HTMLInputElement>document.getElementById('dataUpload')).value,
      'transactionId': this.transactionId.value,
      'timestamp': this.timestamp.value
    };

    var json_object = (<HTMLInputElement>document.getElementById('dataUpload')).value;
    json_object = json_object.replace('[', '');
    json_object = json_object.replace(']','');
    json_object = json_object.replace(/},/g,'}*');
    var jsonArr = json_object.split('*');
    var n = jsonArr.length
    var list = [];
    var obj;
    var email;
    for (var index = n - 1; index >= 0; --index){
        obj = JSON.parse(jsonArr[index]);
        email = JSON.stringify(obj.email);
        email = email.replace(/"/g,'');
        list.push(email);
    }
    this.emailList = list;

    this.myForm.setValue({
      'data': null,
      'transactionId': null,
      'timestamp': null
    });

    return this.serviceAddManyMembers.addTransaction(this.Transaction)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'data': null,
        'transactionId': null,
        'timestamp': null
      });
      this.issueID();
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else {
        this.errorMessage = error;
      }
    });
  }

  updateTransaction(form: any): Promise<any> {
    this.Transaction = {
      $class: 'fpt.edu.vn.AddManyMembers',
      'data': this.data.value,
      'timestamp': this.timestamp.value
    };

    return this.serviceAddManyMembers.updateTransaction(form.get('transactionId').value, this.Transaction)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
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

  deleteTransaction(): Promise<any> {

    return this.serviceAddManyMembers.deleteTransaction(this.currentId)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
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

    return this.serviceAddManyMembers.getTransaction(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'data': null,
        'transactionId': null,
        'timestamp': null
      };

      if (result.data) {
        formObject.data = result.data;
      } else {
        formObject.data = null;
      }

      if (result.transactionId) {
        formObject.transactionId = result.transactionId;
      } else {
        formObject.transactionId = null;
      }

      if (result.timestamp) {
        formObject.timestamp = result.timestamp;
      } else {
        formObject.timestamp = null;
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
      'data': null,
      'transactionId': null,
      'timestamp': null
    });
  }
}
