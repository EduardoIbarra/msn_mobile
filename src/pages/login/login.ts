import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { UserService } from '../../services/user.service';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  user: any = {
    nick: null,
    email: null,
    password: null,
    password2: null
  };
  operation = 'login';
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public viewCtrl: ViewController, public usersService: UserService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
  login() {
    this.usersService.signInWithEmailAndPassword(this.user).then((data: any) => {
      this.usersService.getUser(data.user.uid).valueChanges().subscribe((u: any) => {
        u.details = data;
        localStorage.setItem('msn_user', JSON.stringify(u));
        this.dismiss();
      });
    }).catch((e) => {
      console.log(e);
      alert('Error: ' + e.message);
    });
  }
  register() {
    this.usersService.registerWithEmailAndPassword(this.user).then((data: any) => {
      data.created_at = Date.now();
      const thisUser: any = {uid: data.uid, email: data.email, nick: this.user.nick};
      this.usersService.createUser(thisUser).then((user) => {
        this.operation = 'login';
        alert('Registrado con éxito, ya puedes hacer Login.');
      });
    }).catch((e) => {
      console.log(e);
      alert('Error: ' + e.message);
    });
  }
}
