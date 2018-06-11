import { Component, ViewChild } from '@angular/core';
import { AlertController, ModalController, Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { RequestService } from '../services/request.service';
import { UserService } from '../services/user.service';
import { AboutPage } from '../pages/about/about';
import { PrivacyPage } from '../pages/privacy/privacy';
import { SettingsPage } from '../pages/settings/settings';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, component: any}>;
  me: any = {};
  requests: any = [];
  shouldAdd: boolean;
  mailsShown: any = [];
  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
              private usersService: UserService,
              private requestService: RequestService,
              private userService: UserService,
              private modalCtrl: ModalController,
              public alertCtrl: AlertController) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Inicio', component: HomePage },
      { title: 'Acerca de', component: AboutPage },
      { title: 'Privacidad', component: PrivacyPage },
      { title: 'Configuración', component: SettingsPage }
    ];
    const user = JSON.parse(localStorage.getItem('msn_user'));
    if(!user) {
      this.presentModal();
    }

    this.me = JSON.parse(localStorage.getItem('msn_user'));
    if (!this.me) {
      return;
    }
    this.usersService.getUser(this.me.details.user.uid).valueChanges().subscribe((result) => {
      console.log(this.mailsShown);
      this.me = result;
      this.requestService.getRequestsForEmail(this.me.email).valueChanges().subscribe( (requests: any) => {
        this.requests = requests;
        this.requests = this.requests.filter((r) => {
          return r.status !== 'accepted' && r.status !== 'rejected';
        });
        this.requests.forEach((r) => {
          if(this.mailsShown.indexOf(r.sender.email) === -1) {
            this.mailsShown.push(r.sender.email);
            this.showRadio(r);
          }
        });
      });
    });

  }

  presentModal() {
    const modal = this.modalCtrl.create(LoginPage);
    modal.present();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
  logout() {
    if(!confirm('Seguro que deseas cerrar sesión?')){
      return;
    }
    this.usersService.logout().then(() => {
      localStorage.removeItem('msn_user');
      this.presentModal();
    });
  }
  showRadio(r) {
    let alert = this.alertCtrl.create();
    alert.setTitle('¡Solicitud de Amistad!');
    alert.setMessage(r.sender.email + 'te ha invitado a ser su amigo, deseas aceptar?');

    alert.addInput({
      type: 'radio',
      label: 'Sí.',
      value: 'yes',
      checked: true
    });
    alert.addInput({
      type: 'radio',
      label: 'No, gracias.',
      value: 'no',
      checked: false
    });

    alert.addButton({
      text: 'OK',
      handler: data => {
        if (data === 'yes') {
          this.requestService.setRequestStatus(r, 'accepted').then(() => {
            this.userService.addFriend(this.me.uid, r.sender.uid);
          });
        } else {
          this.requestService.setRequestStatus(r, 'rejected').then(() => {});
        }
      }
    });
    alert.addButton({
      text: 'Decidir más Tarde',
      handler: data => {
        this.requestService.setRequestStatus(r, 'decide_later').then(() => {});
      }
    });
    return alert.present();
  }
}
