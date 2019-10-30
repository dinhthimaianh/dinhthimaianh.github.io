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
import { HistorianDataService } from './HistorianData.service';
import 'rxjs/add/operator/toPromise';

import { RestService } from '../rest.service';
import { AppComponent } from '../app.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-historiandata',
  templateUrl: './HistorianData.component.html',
  styleUrls: ['./HistorianData.component.css'],
  providers: [HistorianDataService,RestService]
})
export class HistorianDataComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
  private errorMessage;
  private authenticated = false;

  transactionId = new FormControl('', Validators.required);
  transactionType = new FormControl('', Validators.required);
  transactionInvoked = new FormControl('', Validators.required);
  participantInvoking = new FormControl('', Validators.required);
  identityUsed = new FormControl('', Validators.required);
  transactionTimestamp = new FormControl('', Validators.required);

  constructor(public serviceHistorianData: HistorianDataService, fb: FormBuilder
                , private httpClient: HttpClient,public app: AppComponent, private restService:RestService) {
    this.myForm = fb.group({
      transactionId: this.transactionId,
      transactionType: this.transactionType,
      transactionInvoked: this.transactionInvoked,
      participantInvoking: this.participantInvoking,
      identityUsed: this.identityUsed,
      transactionTimestamp: this.transactionTimestamp
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

    return this.httpClient.get('https://192.168.56.101:3001/api/system/historian', {withCredentials: true})
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      var n = result['length'];
      var data = "";
      var index;
      for(var i = 0; i < n; i++){
          data = result[i].transactionType;
          if(data.includes('fpt.edu.vn')){
            console.log(result[i].transactionType);
            result[i].transactionType = result[i].transactionType.replace('fpt.edu.vn.', "");
            index = result[i].participantInvoking.indexOf('#');
            result[i].participantInvoking = result[i].participantInvoking.substring(index + 1, result[i].participantInvoking.length);
            index = result[i].transactionTimestamp.indexOf('T');
            result[i].transactionTimestamp = result[i].transactionTimestamp.substring(0, index);
            tempList.push(result[i]);
          }
      }

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
      $class: 'fpt.edu.vn.HistorianData',
      'transactionId': this.transactionId.value,
      'transactionType': this.transactionType.value,
      'transactionInvoked': this.transactionInvoked.value,
      'participantInvoking': this.participantInvoking.value,
      'identityUsed': this.identityUsed.value,
      'transactionTimestamp': this.transactionTimestamp.value
    };

    this.myForm.setValue({
      'transactionId': null,
      'transactionType': null,
      'transactionInvoked': null,
      'participantInvoking': null,
      'identityUsed': null,
      'transactionTimestamp': null
    });

    return this.serviceHistorianData.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'transactionId': null,
        'transactionType': null,
        'transactionInvoked': null,
        'participantInvoking': null,
        'identityUsed': null,
        'transactionTimestamp': null
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
      $class: 'fpt.edu.vn.HistorianData',
      'transactionType': this.transactionType.value,
      'transactionInvoked': this.transactionInvoked.value,
      'participantInvoking': this.participantInvoking.value,
      'identityUsed': this.identityUsed.value,
      'transactionTimestamp': this.transactionTimestamp.value
    };

    return this.serviceHistorianData.updateAsset(form.get('transactionId').value, this.asset)
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

    return this.serviceHistorianData.deleteAsset(this.currentId)
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

    return this.serviceHistorianData.getAsset(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'transactionId': null,
        'transactionType': null,
        'transactionInvoked': null,
        'participantInvoking': null,
        'identityUsed': null,
        'transactionTimestamp': null
      };

      if (result.transactionId) {
        formObject.transactionId = result.transactionId;
      } else {
        formObject.transactionId = null;
      }

      if (result.transactionType) {
        formObject.transactionType = result.transactionType;
      } else {
        formObject.transactionType = null;
      }

      if (result.transactionInvoked) {
        formObject.transactionInvoked = result.transactionInvoked;
      } else {
        formObject.transactionInvoked = null;
      }

      if (result.participantInvoking) {
        formObject.participantInvoking = result.participantInvoking;
      } else {
        formObject.participantInvoking = null;
      }

      if (result.identityUsed) {
        formObject.identityUsed = result.identityUsed;
      } else {
        formObject.identityUsed = null;
      }

      if (result.transactionTimestamp) {
        formObject.transactionTimestamp = result.transactionTimestamp;
      } else {
        formObject.transactionTimestamp = null;
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
      'transactionId': null,
      'transactionType': null,
      'transactionInvoked': null,
      'participantInvoking': null,
      'identityUsed': null,
      'transactionTimestamp': null
      });
  }

}
