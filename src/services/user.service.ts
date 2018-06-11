import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class UserService {

  constructor(private afDb: AngularFireDatabase, private afAuth: AngularFireAuth) { }
  registerWithEmailAndPassword (user) {
    return this.afAuth.auth.createUserWithEmailAndPassword(user.email, user.password);
  }
  signInWithEmailAndPassword (user) {
    return this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password);
  }
  createUser(user) {
    return this.afDb.object('users/' + user.uid).set(user);
  }
  getUsers() {
    return this.afDb.list('users/');
  }
  getUser(uid) {
    return this.afDb.object('users/' + uid);
  }
  setUserProperty(key, value, uid) {
   return this.afDb.object('users/' + uid + '/' + key).set(value);
  }
  updateProfilePicture(user, uid) {
    this.afDb.object('users/' + uid + '/nick').set(user.nick);
    this.afDb.object('users/' + uid + '/status').set(user.status);
    if(user.profile_picture){
      this.afDb.object('users/' + uid + '/profile_picture').set(user.profile_picture);
    }
    return this.afDb.object('users/' + uid + '/subnick').set(user.subnick);
  }
  addFriend(uid, friendId) {
    this.afDb.object('users/' + uid + '/friends/' + friendId).set(friendId);
    return this.afDb.object('users/' + friendId + '/friends/' + uid).set(uid);
  }
  logout(){
    return this.afAuth.auth.signOut();
  }
  isLogged() {
    const me = JSON.parse(localStorage.getItem('msn_user'));
    return !!me;
  }
}
