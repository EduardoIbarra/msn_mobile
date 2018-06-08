import { Component } from '@angular/core';
import { AlertController, NavController } from 'ionic-angular';
import { RequestService } from '../../services/request.service';
import { UserService } from '../../services/user.service';
import { ConversationPage } from '../conversation/conversation';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  users: any = [];
  me: any = {};
  editingSubnick = false;
  subnick = '';
  closeResult: string;
  requestEmail: string;
  searchQuery = '';
  constructor(private usersService: UserService,
              private navContrller: NavController,
              public alertCtrl: AlertController,
              private requestService: RequestService) {
    this.usersService.getUsers().valueChanges().subscribe((result) => {
      this.users = result;
    });
    this.me = JSON.parse(localStorage.getItem('msn_user'));
    this.usersService.getUser(this.me.details.user.uid).valueChanges().subscribe((result: any) => {
      this.me = result;
      this.me.friends = Object.keys(this.me.friends).map(function (key) { return result.friends[key]; });
      this.me.friends.forEach((f, i) => {
        this.usersService.getUser(f).valueChanges().subscribe((mf) => {
          this.me.friends[i] = mf;
        });
      });
      console.log(this.me.friends);
    });
    const audio = new Audio('assets/sound/online.m4a');
    audio.play();
  }

  ngOnInit() {
  }
  setUserProperty(key, value) {
    return this.usersService.setUserProperty(key, value, this.me.uid);
  }
  startEditingSubnick() {
    this.editingSubnick = true;
  }
  setSubnick() {
    this.setUserProperty('subnick', this.me.subnick).then(() => {
      this.editingSubnick = false;
    });
    document.getElementById('subnickTxt').focus();
  }
  openChat(uid) {
    this.navContrller.push(ConversationPage, {uid: uid});
  }
  sendRequest() {
    const prompt = this.alertCtrl.create({
      title: 'Agregar Amigo',
      message: "Ingresa el email del amigo que deseas agregar. ¡Le enviaremos tu solicitud!",
      inputs: [
        {
          name: 'email',
          placeholder: 'Email'
        },
      ],
      buttons: [
        {text: 'Cancel',
          handler: data => {
            console.log(data);
          }
        },
        {text: 'Save',
          handler: data => {
            const request = {
              timestamp: Date.now(),
              receiver_email: data.email,
              sender: this.me,
              status: 'pending'
            };
            this.requestService.createRequest(request);
          }
        }
      ]
    });
    prompt.present();
  }

}
