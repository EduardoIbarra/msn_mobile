import { Component, ViewChild } from '@angular/core';
import { ModalController, Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login';
import { RequestService } from '../services/request.service';
import { UserService } from '../services/user.service';

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
              public modalCtrl: ModalController) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'List', component: ListPage }
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
            this.dialogService.addDialog(FriendRequestModalComponent, {scope: this, currentRequest: r});
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
}
