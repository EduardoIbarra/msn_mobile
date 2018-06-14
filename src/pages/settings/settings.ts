import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AngularFireStorage } from 'angularfire2/storage';
import { UserService } from '../../services/user.service';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  currentPictureId: any;
  me: any = {};
  user: any = {};
  picture: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public camera: Camera, private fbStorage: AngularFireStorage,
              public toastCtrl: ToastController,
              public userService: UserService) {
    this.me = JSON.parse(localStorage.getItem('msn_user'));
    this.user = this.me;
    this.userService.getUser(this.me.uid).valueChanges().subscribe((result: any) => {
      this.me = result;
      this.picture = (this.me.downloaded_picture) ? this.me.profile_picture : 'https://wir.skyrock.net/wir/v1/profilcrop/?c=mog&w=301&h=301&im=%2Fart%2FPRIP.85914100.3.0.png';
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
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
      this.picture = image;
      this.currentPictureId = Date.now();
      const pictures = this.fbStorage.ref('pictures/'+this.currentPictureId+'.jpg').putString(image, 'data_url');
      pictures.then((result) => {
        console.log(result);
      });
    } catch (e) {
      console.error(e);
    }
  }

  saveSettings() {
    if(this.currentPictureId) {
      this.picture = this.fbStorage.ref('pictures/'+this.currentPictureId+'.jpg').getDownloadURL();
      this.picture.subscribe((p)=>{
        this.userService.setProfilePicture(p, this.me.uid).then( () => {
          this.userService.updateProfilePicture(this.user, this.me.uid).then( () => {
            const toast = this.toastCtrl.create({
              message: 'Configuración Guardada!',
              duration: 3000
            });
            toast.present();
          });
        });
      });
    }else {
      this.userService.updateProfilePicture(this.user, this.me.uid).then( () => {
        const toast = this.toastCtrl.create({
          message: 'Configuración Guardada!',
          duration: 3000
        });
        toast.present();
      });
    }
  }

}
