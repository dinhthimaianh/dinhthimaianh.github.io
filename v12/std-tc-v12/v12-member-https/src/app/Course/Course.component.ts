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
import { CourseService } from './Course.service';
import 'rxjs/add/operator/toPromise';

import { RestService } from '../rest.service';
import { AppComponent } from '../app.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-course',
  templateUrl: './Course.component.html',
  styleUrls: ['./Course.component.css'],
  providers: [CourseService,RestService]
})
export class CourseComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
  private errorMessage;
  private authenticated = false;

  courseID = new FormControl('', Validators.required);
  courseName = new FormControl('', Validators.required);
  courseCredits = new FormControl('', Validators.required);
  courseGrade = new FormControl('', Validators.required);

  constructor(public serviceCourse: CourseService, fb: FormBuilder
                , private restService:RestService, public app: AppComponent) {
    this.myForm = fb.group({
      courseID: this.courseID,
      courseName: this.courseName,
      courseCredits: this.courseCredits,
      courseGrade: this.courseGrade
    });
  };

  ngOnInit(): void {
    this.checkPing();
  }
  checkPing(){
    return this.restService.checkExitCard()
      .then((results) => {
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
    return this.serviceCourse.getAll()
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
      $class: 'fpt.edu.vn.Course',
      'courseID': this.courseID.value,
      'courseName': this.courseName.value,
      'courseCredits': this.courseCredits.value,
      'courseGrade': this.courseGrade.value
    };

    this.myForm.setValue({
      'courseID': null,
      'courseName': null,
      'courseCredits': null,
      'courseGrade': null
    });

    return this.serviceCourse.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'courseID': null,
        'courseName': null,
        'courseCredits': null,
        'courseGrade': null
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
      $class: 'fpt.edu.vn.Course',
      'courseName': this.courseName.value,
      'courseCredits': this.courseCredits.value,
      'courseGrade': this.courseGrade.value
    };

    return this.serviceCourse.updateAsset(form.get('courseID').value, this.asset)
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

    return this.serviceCourse.deleteAsset(this.currentId)
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

    return this.serviceCourse.getAsset(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'courseID': null,
        'courseName': null,
        'courseCredits': null,
        'courseGrade': null
      };

      if (result.courseID) {
        formObject.courseID = result.courseID;
      } else {
        formObject.courseID = null;
      }

      if (result.courseName) {
        formObject.courseName = result.courseName;
      } else {
        formObject.courseName = null;
      }

      if (result.courseCredits) {
        formObject.courseCredits = result.courseCredits;
      } else {
        formObject.courseCredits = null;
      }

      if (result.courseGrade) {
        formObject.courseGrade = result.courseGrade;
      } else {
        formObject.courseGrade = null;
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
      'courseID': null,
      'courseName': null,
      'courseCredits': null,
      'courseGrade': null
      });
  }

}
