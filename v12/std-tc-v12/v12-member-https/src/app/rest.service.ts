import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class RestService {
  obsTextMsg: Observable<any>
  constructor(private httpClient: HttpClient) {
  }

  checkWallet() {
    return this.httpClient.get('https://192.168.56.101:3000/api/wallet', {withCredentials: true}).toPromise();
  }

  checkIdentities(){
    return this.httpClient.get('https://192.168.56.101:3000/api/system/identities', {withCredentials: true}).toPromise();
  }

  checkExitCard(){
    return this.httpClient.get('https://192.168.56.101:3000/api/system/ping', {withCredentials: true}).toPromise();
  }

  importCard(data) {
    const formData = new FormData();
    formData.append('card', data);

    const headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    return this.httpClient.post('https://192.168.56.101:3000/api/wallet/import', formData, {
      withCredentials: true,
      headers
      }).toPromise();
  }

  getCurrentUser() {
    return this.httpClient.get('https://192.168.56.101:3000/api/system/ping', {withCredentials: true}).toPromise()
      .then((data) => {
        return data['participant'];
      });
  }
}
