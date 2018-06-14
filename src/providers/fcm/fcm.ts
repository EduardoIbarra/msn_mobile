import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';

/*
  Generated class for the FcmProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FcmProvider {

  constructor(public http: HttpClient, public firebaseNative: Firebase, public afdb: AngularFireDatabase,
              public platform: Platform, public afAuth: AngularFireAuth) {
    console.log('Hello FcmProvider Provider');
  }

  async getToken() {
    let token;
    if(this.platform.is('android')) {
      token = await this.firebaseNative.getToken();
    }
    if(this.platform.is('ios')) {
      token = await this.firebaseNative.getToken();
      await this.firebaseNative.grantPermission();
    }
    return this.saveTokenToFirebase(token);
  }
  public saveTokenToFirebase(token) {
    if(!token) return;
    this.afAuth.authState.subscribe( (user) => {
      const newDevice = {
        userId: user.uid,
        token: token
      };
      this.afdb.object('fcmTokens/' + token + '/').set(newDevice);
    });
  }
  public listenToNotification() {
    return this.firebaseNative.onNotificationOpen();
  }
}
