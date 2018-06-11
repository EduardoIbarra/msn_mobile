import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class ConversationService {

  constructor(private afDb: AngularFireDatabase) { }
  createConversation(conversation) {
    return this.afDb.object('conversations/' + conversation.uid + '/' + conversation.timestamp).set(conversation);
  }
  getConversations() {
    return this.afDb.list('conversations/');
  }
  getConversation(uid) {
    return this.afDb.list('conversations/' + uid);
  }
  updateMessage(conversation, message) {
    return this.afDb.object('conversations/' + conversation + '/' + message.timestamp).set(message);
  }
}
