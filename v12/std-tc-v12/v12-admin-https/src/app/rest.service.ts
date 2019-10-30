import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import * as FileSaver from 'file-saver';


@Injectable()
export class RestService {
  obsTextMsg: Observable<any>
  constructor(private httpClient: HttpClient) {
  }

  checkWallet() {
    return this.httpClient.get('https://192.168.56.101:3001/api/wallet', {withCredentials: true}).toPromise();
  }

  checkIdentities(){
    return this.httpClient.get('https://192.168.56.101:3001/api/system/identities', {withCredentials: true}).toPromise();
  }

  checkExitCard(){
    return this.httpClient.get('https://192.168.56.101:3001/api/system/ping', {withCredentials: true}).toPromise();
  }

  saveFile(buffer: any, fileName: string): void {
    FileSaver.saveAs(buffer, fileName + '.card');
  }

  signUp(data) {
    const identity = {
      participant : 'fpt.edu.vn.Member#' + data,
      userID : data,
      options: {}
    };
    return this.httpClient.post('https://192.168.56.101:3001/api/system/identities/issue', identity, {responseType: 'blob', withCredentials: true}).toPromise()
    .then((cardData: Blob) => {

      const file = new File([cardData], data + '.card', {type: 'application/octet-stream', lastModified: Date.now()});
      this.saveFile(file, data);
    });
  }

  importCard(data) {
    const formData = new FormData();
    formData.append('card', data);

    const headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    return this.httpClient.post('https://192.168.56.101:3001/api/wallet/import', formData, {
      withCredentials: true,
      headers
      }).toPromise();
  }

  getCurrentUser() {
    return this.httpClient.get('http://192.168.56.101:3001/api/system/ping', {withCredentials: true}).toPromise()
      .then((data) => {
        return data['participant'];
      });
  }
}
