import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { UserService } from '../services/user.service';
import { ConversationService } from '../services/conversation.service';
import { RequestService } from '../services/request.service';
import { LoginPage } from '../pages/login/login';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ConversationPage } from '../pages/conversation/conversation';
import { MyFilterPipe, SortPipe } from './app.pipes';
import { AboutPage } from '../pages/about/about';
import { PrivacyPage } from '../pages/privacy/privacy';
import { Camera } from '@ionic-native/camera';
import { SettingsPage } from '../pages/settings/settings';
import { FcmProvider } from '../providers/fcm/fcm';
import { Firebase } from '@ionic-native/firebase';
import { HttpClientModule } from '@angular/common/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';

export const firebaseConfig = {
  apiKey: 'AIzaSyB7l5cIu6b7OGahxBtZWhER3vqV6xU6-lA',
  authDomain: 'msnp-fdd0e.firebaseapp.com',
  databaseURL: 'https://msnp-fdd0e.firebaseio.com',
  projectId: 'msnp-fdd0e',
  storageBucket: 'msnp-fdd0e.appspot.com',
  messagingSenderId: '368905821941'
};
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    LoginPage,
    ConversationPage,
    MyFilterPipe,
    SortPipe,
    AboutPage,
    PrivacyPage,
    SettingsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFontAwesomeModule,
    AngularFireStorageModule,
    HttpClientModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    LoginPage,
    ConversationPage,
    AboutPage,
    PrivacyPage,
    SettingsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserService,
    ConversationService,
    RequestService,
    Camera,
    FcmProvider,
    Firebase,
    InAppBrowser
  ]
})
export class AppModule {}
