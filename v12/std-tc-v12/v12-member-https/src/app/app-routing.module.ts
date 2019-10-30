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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

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

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'Course', component: CourseComponent },
  { path: 'Transcript', component: TranscriptComponent },
  { path: 'TranscriptCopy', component: TranscriptCopyComponent },
  { path: 'HistorianData', component: HistorianDataComponent },
  { path: 'Member', component: MemberComponent },
  { path: 'UpdateMemberDetail', component: UpdateMemberDetailComponent },
  { path: 'AuthorizeTranscriptAccess', component: AuthorizeTranscriptAccessComponent },
  { path: 'RequestTranscriptCopy', component: RequestTranscriptCopyComponent },
  { path: 'AddManyMembers', component: AddManyMembersComponent },
  { path: 'AddManyTranscripts', component: AddManyTranscriptsComponent },
  { path: 'RemoveAllTranscriptCopy', component: RemoveAllTranscriptCopyComponent },
  { path: 'AddManyCourses', component: AddManyCoursesComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
 imports: [RouterModule.forRoot(routes)],
 exports: [RouterModule],
 providers: []
})
export class AppRoutingModule { }
