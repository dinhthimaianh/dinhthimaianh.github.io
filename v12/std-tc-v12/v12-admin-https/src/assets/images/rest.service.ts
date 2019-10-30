import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as FileSaver from 'file-saver';


@Injectable()
export class RestService {

  constructor(private httpClient: HttpClient) {
  }

  saveFile(buffer: any, fileName: string): void {
    FileSaver.saveAs(buffer, fileName + '.card');
    //fs.writeFile('/home/user/std-tc-v10/std-tc-v10-admin/bncFiles/' + fileName + '.card', buffer, function(err) {})
  }

  checkWallet() {
    return this.httpClient.get('http://192.168.56.101:3000/api/wallet', {withCredentials: true}).toPromise();
  }

  signUp(data) {
    console.log(data);
    const identity = {
      participant: 'fpt.edu.vn.Member#' + data,
      userID: data,
      options: {}
    };
    return this.httpClient.post('http://192.168.56.101:3001/api/system/identities/issue', identity, {responseType: 'blob'}).toPromise()
    .then((cardData: Blob) => {

      const file = new File([cardData], data.id + '.card', {type: 'application/octet-stream', lastModified: Date.now()});
      this.saveFile(file, data)
      /*
      const formData = new FormData();
      formData.append('card', file);

      const headers = new HttpHeaders();
      headers.set('Content-Type', 'multipart/form-data');
      return this.httpClient.post('https://192.168.56.101:3000/api/wallet/import', formData, {
        withCredentials: true,
        headers
        }).toPromise();
        */
    });
    /*
    return this.httpClient.post('http://localhost:3001/api/fpt.edu.vn.Member', member).toPromise()
      .then(() => {
        const identity = {
          participant: 'fpt.edu.vn.Member#' + data.email,
          userID: data.email,
          options: {}
        };

        return this.httpClient.post('http://localhost:3001/api/system/identities/issue', identity, {responseType: 'blob'}).toPromise();
      })
      .then((cardData: Blob) => {
        console.log('CARD-DATA', cardData);
        const file = new File([cardData], 'myCard.card', {type: 'application/octet-stream', lastModified: Date.now()});

        const formData = new FormData();
        formData.append('card', file);

        const headers = new HttpHeaders();
        headers.set('Content-Type', 'multipart/form-data');
        return this.httpClient.post('http://localhost:3000/api/wallet/import', formData, {
          withCredentials: true,
          headers
        }).toPromise();
      });
      */
  }

  getCurrentUser() {
    return this.httpClient.get('http://192.168.56.101:3000/api/system/ping', {withCredentials: true}).toPromise()
      .then((data) => {
        return data['participant'];
      });
  }
}
