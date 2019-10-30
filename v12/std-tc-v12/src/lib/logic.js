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

'use strict';

/**
 * Sample transaction
 * @param {fpt.edu.vn.UpdateMemberDetail} transaction
 * @transaction
*/


function updateMemberDetail( transaction ){
  var me = getCurrentParticipant();
  if (me == null) {
  	throw new Error("A participant mapping does not exist")
  }
  transaction.member.name = transaction.name
  transaction.member.major = transaction.major
  transaction.member.dob = transaction.dob
  transaction.member.address = transaction.address
  transaction.member.type = transaction.type
  return getParticipantRegistry('fpt.edu.vn.Member').then(function (registry) { registry.update(transaction.member) })
}


/**
 * A Member grants access to their Degree assets
 * @param {fpt.edu.vn.AuthorizeTranscriptAccess} transaction - authorize transaction
 * @transaction
 */


async function authorizeTranscriptAccess(transaction) {
	var me = getCurrentParticipant();
    if (me == null) {
        throw new Error("A participant mapping does not exist");
    }
    var requestorId = transaction.memberId;
    if (requestorId == null) {
        throw new Error("Invalid request. \"memberId\" should be defined");
    }
  	var ownerId = me.getIdentifier();
  	return query('getMemberByEmail', { email: requestorId }).then(function (memberReg){
      if(!memberReg[0]){
      	throw new Error("Invalid request. " + requestorId + " does not exist.");
      } else {
        return query('getTranscriptCopyByMemberId', { ownerId: ownerId }).then(function (records){

          var serializer = getSerializer();
          var transcript = serializer.toJSON(records[0]);

          var flag = 0
          for (var index = transcript.authorized.length - 1; index >= 0; --index) {
              if (transcript.authorized[index] === requestorId) {
                  throw new Error("Invalid request. " + requestorId + " has been granted rights.");
              }
          }
          transcript.authorized.push(requestorId);
          return getAssetRegistry("fpt.edu.vn.TranscriptCopy")
            .then(function (registry) { registry.update(serializer.fromJSON(transcript)) })
        })
      }
    })
}

/**
 * A Member grants access to their Degree assets
 * @param {fpt.edu.vn.RequestTranscriptCopy} transaction - authorize transaction
 * @transaction
 */


async function requestTranscriptCopy(transaction) {
	var me = getCurrentParticipant();
    if (me == null) {
        throw new Error("A participant mapping does not exist");
    }

  	var ownerId = me.getIdentifier();
  	let transcripts = await getAssetRegistry('fpt.edu.vn.Transcript');
    let checkExist = transcripts.exists(ownerId);
    let isExist = await checkExist.then(function(value) {return value;});
    if(isExist == false){
      	throw new Error("Invalid request. " + ownerId + " transcript does not exist.");
	} else {
      	let transcript = await query('getTranscriptByMemberId', { ownerId: ownerId });
      	var serializer = getSerializer();
      	var temp = serializer.toJSON(transcript[0]);
        var factory = getFactory();
        var transcriptCopy = factory.newResource('fpt.edu.vn', 'TranscriptCopy', ownerId);
      	transcriptCopy.course = [];
      	transcriptCopy.authorized = [];
	transcriptCopy.creditsTotal = 0
      	transcriptCopy.certificateLink = "";
      	var data = serializer.toJSON(transcriptCopy);
      	var n = temp.course.length;
      	data.course = temp.course;
      	data.avg = temp.avg;
      	data.creditsTotal = temp.creditsTotal;
      	data.certificateLink = temp.certificateLink;
	console.log(data.creditsTotal);
      	let registry = await getAssetRegistry("fpt.edu.vn.TranscriptCopy");
        await registry.add(serializer.fromJSON(data))
    }
}


/**
 * Sample transaction
 * @param {fpt.edu.vn.AddManyMembers} transaction
 * @transaction
*/


async function addManyMembers( transaction ){
  	var me = getCurrentParticipant();
    if (me == null) {
        throw new Error("A participant mapping does not exist");
    }
  	var factory = getFactory();
  	var serializer = getSerializer();
    var temp = serializer.toJSON(transaction);
  	var data = temp.data;
    var n = data.length;
    for (var index = n - 1; index >= 0; --index) {
      	let registry = await getParticipantRegistry("fpt.edu.vn.Member");
      	await registry.add(serializer.fromJSON(data[index]))
    }
}

/**
 * Sample transaction
 * @param {fpt.edu.vn.AddManyTranscripts} transaction
 * @transaction
*/


async function addManyTranscripts( transaction ){
  	var me = getCurrentParticipant();
    if (me == null) {
        throw new Error("A participant mapping does not exist");
    }
  	var factory = getFactory();
  	var serializer = getSerializer();
    var temp = serializer.toJSON(transaction);
  	var data = temp.data;
    var n = data.length;
  	let transcripts = await getAssetRegistry('fpt.edu.vn.Transcript');
    for (var index = n - 1; index >= 0; --index) {
      	let checkExist = transcripts.exists(data[index].owner);
      	let isExist = await checkExist.then(function(value) {return value;});
      	let courseList = await getAssetRegistry('fpt.edu.vn.Course');
      	if(isExist == false){
			var tc = factory.newResource("fpt.edu.vn", "Transcript", data[index].owner);
	        tc.course = [];
          	tc.avg = data[index].avg;
          	temp = serializer.toJSON(tc);
          	var creditsTotal = 0;
          	var m = data[index].course.length;
          	for (var i = m - 1; i >= 0; --i){
              	let courseObj = await courseList.get(data[index].course[i].courseName).then(function(value) {return value;})
                data[index].course[i].courseCredits = courseObj.courseCredits;
              	creditsTotal = creditsTotal + courseObj.courseCredits;
            }
	        temp.course = data[index].course;
            temp.creditsTotal = creditsTotal;
	        transcripts.add(serializer.fromJSON(temp));
		} else {
			let registry = await getAssetRegistry('fpt.edu.vn.Transcript');
			let memberReg = await query('getTranscriptByMemberId', { ownerId: data[index].owner });
	    	temp = serializer.toJSON(memberReg[0]);
          	var m = temp.course.length;
	      	var o = data[index].course.length;
          	var creditsTotal = 0;
          	for (var i = o - 1; i >= 0; --i){
         	  var flag = false;
              for (var j = m - 1; j >= 0; --j){
                  if(temp.course[j].courseName == data[index].course[i].courseName){
                      temp.course[j].courseGrade = data[index].course[i].courseGrade;
                      flag = true;
                  }
              }
              if(flag == false){
               	  let courseObj = await courseList.get(data[index].course[i].courseName).then(function(value) {return value;})
                  data[index].course[i].courseCredits = courseObj.courseCredits;
                  temp.course.push(data[index].course[i]);
                  creditsTotal = creditsTotal + courseObj.courseCredits;
              }
            }
          	temp.avg = data[index].avg
            temp.creditsTotal = temp.creditsTotal + creditsTotal;
            registry.update(serializer.fromJSON(temp))
		}
    }
}

/**
 * Sample transaction
 * @param {fpt.edu.vn.AddManyCourses} transaction
 * @transaction
*/


async function addManyCourses( transaction ){
  	var me = getCurrentParticipant();
    if (me == null) {
        throw new Error("A participant mapping does not exist");
    }
  	var factory = getFactory();
  	var serializer = getSerializer();
    var temp = serializer.toJSON(transaction);
  	var data = temp.data;
    var n = data.length;
    for (var index = n - 1; index >= 0; --index) {
      	let registry = await getAssetRegistry("fpt.edu.vn.Course");
      	await registry.add(serializer.fromJSON(data[index]))
    }
}


/**
 * Sample transaction
 * @param {fpt.edu.vn.RemoveAllTranscriptCopy} transaction
 * @transaction
*/

async function removeAllTranscriptCopy( transaction ){

	let registry = await getAssetRegistry('fpt.edu.vn.TranscriptCopy');
  	let transcript = await query('getAllTranscriptCopy');
    var serializer = getSerializer();
  	var n = transcript.length;
  	for (var i = n - 1; i >= 0; --i){
      	registry.remove(transcript[i].owner);
    }
}

