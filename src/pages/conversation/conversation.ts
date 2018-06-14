import { Component, ViewChild } from '@angular/core';
import { Content, NavParams } from 'ionic-angular';
import { UserService } from '../../services/user.service';
import { ConversationService } from '../../services/conversation.service';
import { FcmProvider } from '../../providers/fcm/fcm';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'page-conversation',
  templateUrl: 'conversation.html'
})
export class ConversationPage {
  currentPictureId: any;
  pictureUpload: any;
  friend: any = {};
  form: any = {message: ''};
  friendId: any = null;
  me: any = {};
  conversation: any = [];
  ids: any = [];
  shake = false;
  picture: any;
  my_picture: any;
  @ViewChild(Content) content: Content;
  constructor(private userService: UserService, public navParams: NavParams,
              private fcm: FcmProvider,
              public camera: Camera, private fbStorage: AngularFireStorage,
              private conversationService: ConversationService) {
    this.me = JSON.parse(localStorage.getItem('msn_user'));
    this.my_picture = (this.me.downloaded_picture) ? this.me.profile_picture
      : 'https://wir.skyrock.net/wir/v1/profilcrop/?c=mog&w=301&h=301&im=%2Fart%2FPRIP.85914100.3.0.png';
    this.friendId = this.navParams.get('uid');
    this.ids = [this.me.details.user.uid, this.friendId].sort();
    this.userService.getUser(this.friendId).valueChanges().subscribe((user) => {
      this.friend = user;
      this.picture = (this.friend.downloaded_picture) ? this.friend.profile_picture : 'https://wir.skyrock.net/wir/v1/profilcrop/?c=mog&w=301&h=301&im=%2Fart%2FPRIP.85914100.3.0.png';
      console.log(this.friend);
      this.conversationService.getConversation(this.ids.join('||')).valueChanges()
        .subscribe((result) => {
          if (!result) {
            return;
          }
          this.conversation = Object.keys(result).map(function (key) { return result[key]; });
          this.conversation.forEach((m: any) => {
            if (!m.seen && m.sender !== this.me.details.user.uid) {
              m.seen = true;
              if (m.type === 'zumbido') {
                this.doZumbido();
              } else if (m.type === 'text') {
                const audio = new Audio('assets/sound/new_message.m4a');
                audio.play();
              }
              this.conversationService.updateMessage(this.ids.join('||'), m);
            }
          });
          this.scrollToBottom();
        });
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if(!this.content) {
        return;
      }
      this.content.scrollToBottom();
    }, 500);
  }
  getUserNickById(id) {
    if (id === this.friendId) {
      return this.friend.nick;
    } else if (id === this.me.details.user.uid) {
      return this.me.nick;
    }
  }

  ngOnInit() {
  }
  doZumbido() {
    const audio = new Audio('assets/sound/zumbido.m4a');
    audio.play();
    this.shake = true;
    window.setTimeout(() => {
      this.shake = false;
    }, 800);
  }
  sendZumbido() {
    this.doZumbido();
    const messageObject: any = {
      uid: this.ids.join('||'),
      timestamp: Date.now(),
      sender: this.me.details.user.uid,
      receiver: this.friendId,
      type: 'zumbido',
    };
    this.conversationService.createConversation(messageObject);
  }
  sendMessage() {
    const messageObject: any = {
      uid: this.ids.join('||'),
      timestamp: Date.now(),
      sender: this.me.details.user.uid,
      receiver: this.friendId,
      type: 'text',
      content: this.form.message.replace(/\n$/, '')
    };
    this.conversationService.createConversation(messageObject).then(() => {
      const notificationMessage = {
        type: 'text',
        friend_uid: this.me.uid,
        friend_name: this.me.nick,
        picture: this.my_picture,
        message: messageObject.content,
        timestamp: Date.now() + ''
      };
      this.fcm.sendMessage(this.friendId, notificationMessage);
    });
    this.form.message = '';
  }

  async takePicture(source) {
    try {
      let cameraOptions: CameraOptions = {
        quality: 50,
        targetWidth: 800,
        targetHeight: 800,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true,
        allowEdit: true
      };
      cameraOptions.sourceType = (source == 'camera') ?  this.camera.PictureSourceType.CAMERA : this.camera.PictureSourceType.PHOTOLIBRARY;
      const result = await this.camera.getPicture(cameraOptions);
      const image = `data:image/jpeg;base64,${result}`;
      this.me.profile_picture = null;
      this.pictureUpload = image;
      this.currentPictureId = Date.now();
      const pictures = this.fbStorage.ref('pictures/'+this.currentPictureId+'.jpg').putString(image, 'data_url');
      pictures.then((result) => {
        this.picture = this.fbStorage.ref('pictures/'+this.currentPictureId+'.jpg').getDownloadURL();
        this.picture.subscribe((p)=>{
          const messageObject: any = {
            uid: this.ids.join('||'),
            timestamp: Date.now(),
            sender: this.me.details.user.uid,
            receiver: this.friendId,
            type: 'picture',
            content: p
          };
          this.conversationService.createConversation(messageObject).then(() => {
            const notificationMessage = {
              type: 'picture',
              friend_uid: this.me.uid,
              friend_name: this.me.nick,
              picture: this.my_picture,
              message: messageObject.content,
              timestamp: Date.now() + ''
            };
            this.fcm.sendMessage(this.friendId, notificationMessage);
          });
        });
      });
    } catch (e) {
      console.error(e);
    }
  }
}
