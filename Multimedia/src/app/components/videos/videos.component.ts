import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Inject } from '@angular/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
declare var videojs: any;

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css'],
})
export class VideosComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(private httpClient: HttpClient, public dialog: MatDialog) {}

  public playListType = true;

  private videoUrl = '';
  private originData: string = window.location.origin;
  public videoJSplayer: any;
  public posterUrl = '';
  public width = '900';
  public height = '506';

  private dataSetup: any = {
    aspectRatio: '640:267',
    preload: 'auto',
    controls: true,
    muted: false,
    autoplay: false,
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
    techOrder: ['html5', 'youtube'],
    sources: [
      {
        type: 'video/youtube',
        src: this.videoUrl,
        youtube: {
          ytControls: 2,
          iv_load_policy: 3,
          color: 'red',
          modestbranding: 1,
          rel: 0,
          fs: 1,
          customVars: {
            wmode: 'transparent',
            enablejsapi: 1,
            origin: this.originData,
          },
        },
      },
    ],
    plugins: {
      videoJsResolutionSwitcher: {
        default: 'high',
        dynamicLabel: true,
      },
    },
  };

  public dataSetupString: string = JSON.stringify(this.dataSetup);

  // Variable con lista de reproducción
  // tslint:disable-next-line: member-ordering
  public videoList;
  public videoListTotal;
  interval;

  // tslint:disable-next-line: variable-name
  repea_list = true;
  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.videoJSplayer.dispose();
  }
  ngAfterViewInit(): void {
    this.httpClient.get('assets/videos.json').subscribe((data) => {
      this.videoList = [];
      for (let i = 0; i < 3; i++) {
        this.videoList.push(data[i]);
      }
      // this.videoList = (data as Array).slice(0,3);
      this.videoListTotal = JSON.parse(JSON.stringify(data));
      this.initVideoJs();
    });
  }

  initVideoJs(): void {
    this.videoJSplayer = videojs('my_video');
    this.videoJSplayer.on('ended', () => {
      const index =
        // tslint:disable-next-line: triple-equals
        this.videoJSplayer.playlist.currentItem() == this.videoList.length - 1
          ? 0
          : this.videoJSplayer.playlist.currentItem() + 1;
      this.useOverlay(index);
    });
    // Como cargar video de youtube en el editor
    /*const newYoutubeUrl = 'http://www.youtube.com/watch?v=kfd288W8oMs';
    this.videoJSplayer.src({type: 'video/youtube', src: newYoutubeUrl});*/

    this.videoJSplayer.playlist(this.videoList);
    this.videoJSplayer.playlist.autoadvance(0);
    this.useOverlay(0);
    this.videoJSplayer.playlist.repeat(true);
    this.checkerQuitz();

    // Gestionar diferentes resoluciones
  }

  // tslint:disable-next-line: typedef
  checkOverlay() {
    const elements: HTMLElement[] = Array.from(
      document.querySelectorAll('.vjs-overlay')
    );
    elements.forEach((ov: HTMLElement) => {
      // tslint:disable-next-line: triple-equals
      if (
        // tslint:disable-next-line: triple-equals
        ov.innerHTML == 'This overlay will show up while the video is playing'
      ) {
        ov.style.display = 'none';
      }
    });
  }
  useOverlay(id: number): void {
    if (this.videoList[id] && this.videoList[id].overlay) {
      this.videoJSplayer.overlay(this.videoList[id].overlay);
    } else {
      this.videoJSplayer.overlay([{ end: 0 }]);
    }
    this.checkOverlay();
    /*this.videoJSplayer.overlay({
      content: 'Default overlay content',
      debug: false,
      overlays: [{
        content: 'The video is playing!',
        start: 'play',
        end: 'pause'
      }, {
        content: 'CCCCCCCCCCCCCCCCCCCCCCCCCC',
        start: 0,
        end: 15,
        align: 'bottom-left'
      }, {
        content: 'DDDDDDDDDDDDDDDDDDDDDDD',
        start: 0,
        end: 30,
        align: 'bottom'
      }, {
        content: 'EEEEEEEEEEEEEEEEEEEE',
        start: 0,
        end: 45,
        align: 'bottom-right'
      }, {
        content: 'FFFFFFFFFFFFFFFFFFF',
        start: 0,
        end: 'pause'
      }]
    });*/
  }

  /*
    Acciones:
      play-> inicia el video
      paused-> comprueba si esta pausado
      pause-> pausa el video
      currentTime-> Cambia el momento del video a x segundos
      whereYouAt = myPlayer.currentTime-> Obtiene el momento del video
      duration-> Duracion del video
  */

  startStop(): void {
    // console.log(!this.videoJSplayer.paused());
    // this.videoJSplayer.play();
    // this.videoJSplayer.paused(); check if paused
    // this.videoJSplayer.pause();
    // true, false
    // set current time to 2 minutes into the video
    // this.videoJSplayer.currentTime(2);
    // get the current time, should be 120 seconds
    // var whereYouAt = myPlayer.currentTime();
    // var lengthOfVideo = myPlayer.duration();
  }
  // tslint:disable-next-line: typedef
  checkerQuitz() {
    this.interval = setInterval(() => {
    }, 500);
  }
  checkTimeForm(quitz: any): boolean {
    if (this.videoJSplayer.currentTime() >= quitz.init && !quitz.is_correct) {
      this.videoJSplayer.pause();
    }
    return this.videoJSplayer.currentTime() >= quitz.init && !quitz.continue;
  }
  continueVideo(quitz: any): void {
    this.videoJSplayer.play();
    quitz.continue = true;
  }
  // tslint:disable-next-line: typedef
  checkAnswer(resp: string, quitz: any) {
    // tslint:disable-next-line: triple-equals
    if (resp == quitz.corrent_answer) {
      quitz.is_correct = 'correcto';
    } else {
      this.videoJSplayer.currentTime(quitz.new_time);
      this.videoJSplayer.play();
    }
  }
  anterior(): void {
    this.videoJSplayer.playlist.previous();
    this.useOverlay(this.videoJSplayer.playlist.currentItem());
  }

  posterior(): void {
    this.videoJSplayer.playlist.next();
    this.useOverlay(this.videoJSplayer.playlist.currentItem());
  }
  repetir(): void {
    this.repea_list = !this.repea_list;
    this.videoJSplayer.playlist.repeat(this.repea_list);
  }

  changeVideoFromList(video: any, i: number): void {
    const index = this.videoList.indexOf(video, 0);
    if (index > -1) {
      this.videoJSplayer.playlist.currentItem(index);
      this.useOverlay(this.videoJSplayer.playlist.currentItem());
    }
  }

  removeVideo(video: any): void {
    const index = this.videoList.indexOf(video, 0);
    if (index > -1) {
      this.videoList.splice(index, 1);
    }
    this.resetPlayer();
  }
  resetPlayer(): void {
    this.videoJSplayer.reset();
    this.initVideoJs();
    this.videoJSplayer.playlist.currentItem(0);
  }
  // tslint:disable-next-line: typedef
  addVideo() {
    this.openDialog();
  }
  // tslint:disable-next-line: typedef
  addVideoPL(video) {
    this.videoList.push(video);
    this.videoJSplayer.reset();
    this.initVideoJs();
    this.videoJSplayer.playlist.currentItem(this.videoList.length - 1);
  }

  /*private changeVideoFromYoutube( newId: string ): void {
    const newYoutubeUrl: string = 'http://www.youtube.com/watch?v=' + newId;
    this.videoJSplayer.src({type: 'video/youtube', src: newYoutubeUrl});
  }*/

  openDialog(): void {
    const dialogRef = this.dialog.open(YoutubeDialog, {
      width: '400px',
      data: { url: '' },
    });
    /*

{
    "sources": [{
        "src": "http://www.youtube.com/watch?v=kfd288W8oMs",
        "type": "video/youtube"
    }],
    "poster": "assets/video1.PNG"
},

*/
    dialogRef.afterClosed().subscribe((result) => {
      if (result.url) {
        this.videoList.push({
          sources: [
            {
              src: result.url,
              type: 'video/youtube',
            },
          ],
          poster: 'assets/logoInicialESI.jpg',
        });
        try {
          this.resetPlayer();
          this.videoJSplayer.playlist.currentItem(this.videoList.length - 1);
        } catch (err) {}
      }
    });
  }
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'youtube-dialog',
  templateUrl: './youtube-dialog.html',
})
// tslint:disable-next-line: component-class-suffix
export class YoutubeDialog {
  constructor(
    public dialogRef: MatDialogRef<YoutubeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('Pop up', this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onClick(data): void {
    this.data = data;
    // this.dialogRef.close();
  }
}
