import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace fpt.edu.vn{
   export enum TypeOfMember {
      Student,
      Staff,
      Employee,
   }
   export class Member extends Participant {
      email: string;
      memberCode: string;
      name: string;
      major: string;
      dob: Date;
      address: string;
      type: TypeOfMember;
   }
   export class Course extends Asset {
      courseID: string;
      courseName: string;
      courseCredits: number;
      courseGrade: number;
   }
   export class Transcript extends Asset {
      owner: string;
      course: Course[];
      avg: number;
      creditsTotal: number;
      certificateLink: string;
   }
   export class TranscriptCopy extends Asset {
      owner: string;
      course: Course[];
      avg: number;
      authorized: string[];
      creditsTotal: number;
      certificateLink: string;
   }
   export class HistorianData extends Asset {
      transactionId: string;
      transactionType: string;
      transactionInvoked: string;
      participantInvoking: string;
      identityUsed: string;
      transactionTimestamp: Date;
   }
   export abstract class MemberTransaction extends Transaction {
      member: Member;
   }
   export abstract class TranscriptTransaction extends Transaction {
   }
   export class UpdateMemberDetail extends MemberTransaction {
      name: string;
      major: string;
      dob: Date;
      address: string;
      type: TypeOfMember;
   }
   export class AuthorizeTranscriptAccess extends TranscriptTransaction {
      memberId: string;
   }
   export class RequestTranscriptCopy extends TranscriptTransaction {
      reason: string;
   }
   export class AddManyMembers extends Transaction {
      data: Member[];
   }
   export class AddManyTranscripts extends Transaction {
      data: Transcript[];
   }
   export class RemoveAllTranscriptCopy extends Transaction {
   }
   export class AddManyCourses extends Transaction {
      data: Course[];
   }
// }
