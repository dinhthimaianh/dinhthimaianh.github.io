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

import { AngularTestPage } from './app.po';
import { ExpectedConditions, browser, element, by } from 'protractor';
import {} from 'jasmine';


describe('Starting tests for v12-admin-https', function() {
  let page: AngularTestPage;

  beforeEach(() => {
    page = new AngularTestPage();
  });

  it('website title should be v12-admin-https', () => {
    page.navigateTo('/');
    return browser.getTitle().then((result)=>{
      expect(result).toBe('v12-admin-https');
    })
  });

  it('network-name should be std-tc-v12@0.0.1',() => {
    element(by.css('.network-name')).getWebElement()
    .then((webElement) => {
      return webElement.getText();
    })
    .then((txt) => {
      expect(txt).toBe('std-tc-v12@0.0.1.bna');
    });
  });

  it('navbar-brand should be v12-admin-https',() => {
    element(by.css('.navbar-brand')).getWebElement()
    .then((webElement) => {
      return webElement.getText();
    })
    .then((txt) => {
      expect(txt).toBe('v12-admin-https');
    });
  });

  
    it('Course component should be loadable',() => {
      page.navigateTo('/Course');
      browser.findElement(by.id('assetName'))
      .then((assetName) => {
        return assetName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('Course');
      });
    });

    it('Course table should have 5 columns',() => {
      page.navigateTo('/Course');
      element.all(by.css('.thead-cols th')).then(function(arr) {
        expect(arr.length).toEqual(5); // Addition of 1 for 'Action' column
      });
    });
  
    it('Transcript component should be loadable',() => {
      page.navigateTo('/Transcript');
      browser.findElement(by.id('assetName'))
      .then((assetName) => {
        return assetName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('Transcript');
      });
    });

    it('Transcript table should have 6 columns',() => {
      page.navigateTo('/Transcript');
      element.all(by.css('.thead-cols th')).then(function(arr) {
        expect(arr.length).toEqual(6); // Addition of 1 for 'Action' column
      });
    });
  
    it('TranscriptCopy component should be loadable',() => {
      page.navigateTo('/TranscriptCopy');
      browser.findElement(by.id('assetName'))
      .then((assetName) => {
        return assetName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('TranscriptCopy');
      });
    });

    it('TranscriptCopy table should have 7 columns',() => {
      page.navigateTo('/TranscriptCopy');
      element.all(by.css('.thead-cols th')).then(function(arr) {
        expect(arr.length).toEqual(7); // Addition of 1 for 'Action' column
      });
    });
  
    it('HistorianData component should be loadable',() => {
      page.navigateTo('/HistorianData');
      browser.findElement(by.id('assetName'))
      .then((assetName) => {
        return assetName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('HistorianData');
      });
    });

    it('HistorianData table should have 7 columns',() => {
      page.navigateTo('/HistorianData');
      element.all(by.css('.thead-cols th')).then(function(arr) {
        expect(arr.length).toEqual(7); // Addition of 1 for 'Action' column
      });
    });
  

  
    it('Member component should be loadable',() => {
      page.navigateTo('/Member');
      browser.findElement(by.id('participantName'))
      .then((participantName) => {
        return participantName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('Member');
      });
    });

    it('Member table should have 8 columns',() => {
      page.navigateTo('/Member');
      element.all(by.css('.thead-cols th')).then(function(arr) {
        expect(arr.length).toEqual(8); // Addition of 1 for 'Action' column
      });
    });
  

  
    it('UpdateMemberDetail component should be loadable',() => {
      page.navigateTo('/UpdateMemberDetail');
      browser.findElement(by.id('transactionName'))
      .then((transactionName) => {
        return transactionName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('UpdateMemberDetail');
      });
    });
  
    it('AuthorizeTranscriptAccess component should be loadable',() => {
      page.navigateTo('/AuthorizeTranscriptAccess');
      browser.findElement(by.id('transactionName'))
      .then((transactionName) => {
        return transactionName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('AuthorizeTranscriptAccess');
      });
    });
  
    it('RequestTranscriptCopy component should be loadable',() => {
      page.navigateTo('/RequestTranscriptCopy');
      browser.findElement(by.id('transactionName'))
      .then((transactionName) => {
        return transactionName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('RequestTranscriptCopy');
      });
    });
  
    it('AddManyMembers component should be loadable',() => {
      page.navigateTo('/AddManyMembers');
      browser.findElement(by.id('transactionName'))
      .then((transactionName) => {
        return transactionName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('AddManyMembers');
      });
    });
  
    it('AddManyTranscripts component should be loadable',() => {
      page.navigateTo('/AddManyTranscripts');
      browser.findElement(by.id('transactionName'))
      .then((transactionName) => {
        return transactionName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('AddManyTranscripts');
      });
    });
  
    it('RemoveAllTranscriptCopy component should be loadable',() => {
      page.navigateTo('/RemoveAllTranscriptCopy');
      browser.findElement(by.id('transactionName'))
      .then((transactionName) => {
        return transactionName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('RemoveAllTranscriptCopy');
      });
    });
  
    it('AddManyCourses component should be loadable',() => {
      page.navigateTo('/AddManyCourses');
      browser.findElement(by.id('transactionName'))
      .then((transactionName) => {
        return transactionName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('AddManyCourses');
      });
    });
  

});