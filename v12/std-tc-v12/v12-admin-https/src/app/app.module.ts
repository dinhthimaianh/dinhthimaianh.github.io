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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { DataService } from './data.service';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

import { CourseComponent } from './Course/Course.component';
import { TranscriptComponent } from './Transcript/Transcript.component';
import { TranscriptCopyComponent } from './TranscriptCopy/TranscriptCopy.component';
import { HistorianDataComponent } from './HistorianData/HistorianData.component';

import { MemberComponent } from './Member/Member.component';

import { UpdateMemberDetailComponent } from './UpdateMemberDetail/UpdateMemberDetail.component';
import { AuthorizeTranscriptAccessComponent } from './AuthorizeTranscriptAccess/AuthorizeTranscriptAccess.component';
import { RequestTranscriptCopyComponent } from './RequestTranscriptCopy/RequestTranscriptCopy.component';
import { AddManyMembersComponent } from './AddManyMembers/AddManyMembers.component';
import { AddManyTranscriptsComponent } from './AddManyTranscripts/AddManyTranscripts.component';
import { RemoveAllTranscriptCopyComponent } from './RemoveAllTranscriptCopy/RemoveAllTranscriptCopy.component';
import { AddManyCoursesComponent } from './AddManyCourses/AddManyCourses.component';

import { GrdFilterPipe } from './grd-filter.pipe';
import { ExcelService } from './excel.service';
import { PagerService } from './paging.service'
import { HttpClientModule } from '@angular/common/http';

  @NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CourseComponent,
    TranscriptComponent,
    TranscriptCopyComponent,
    HistorianDataComponent,
    MemberComponent,
    UpdateMemberDetailComponent,
    AuthorizeTranscriptAccessComponent,
    RequestTranscriptCopyComponent,
    AddManyMembersComponent,
    AddManyTranscriptsComponent,
    RemoveAllTranscriptCopyComponent,
    AddManyCoursesComponent,
    GrdFilterPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    DataService,
    ExcelService,
    PagerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
