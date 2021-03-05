import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BarcodeFormat, BrowserBarcodeReader, Result } from '@zxing/library';
import { BrowserMultiFormatOneDReader, IScannerControls } from '@zxing/browser';
import Quagga from 'Quagga'
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { BehaviorSubject } from 'rxjs';
import { MultiFormatReader,BrowserCodeReader, HTMLCanvasElementLuminanceSource, HybridBinarizer, BinaryBitmap } from '@zxing/library';
import { WindowService } from "./window.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit,AfterViewInit{
  @ViewChild('video') video
  @ViewChild('canvas') canvas
  @ViewChild('img') img
  @ViewChild('frame') frame
  @ViewChild('scanner') scanner;

  availableDevices: MediaDeviceInfo[];
  currentDevice: MediaDeviceInfo = null;
  videoStream
  barcodeReader = new BrowserBarcodeReader()
  hidden:boolean = true
  timeout = 1000 // time between frames
  scale = 0.5 // size of crop frame

  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.EAN_13,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E
  ];

  decoder;
  decoder_retail;
  hasDevices: boolean;
  hasPermission: boolean;
  detectionHash = {}
  qrResultString: string;

  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  tryHarder = false;
  imageSrc: string | ArrayBuffer;


  constructor(private _window: WindowService,private el: ElementRef){

  }

  ngOnInit(){

  }

  ngAfterViewInit(){
    // if (('BarcodeDetector' in window) && (this.windowFormats)) {
    //   alert('Barcode scanning is supported.');
    //   this.decoder = new window['BarcodeDetector']({formats: ['code_39', 'codabar', 'ean_13']})
    // }else {
    //   alert('Barcode Detector is not supported!');
    // }
    setTimeout(()=>{                           //<<<---using ()=> syntax
      this.openScanner()
    }, 3000);
  }
  //IMAGE SOLUTION FUNCTIONS
  onFileSelected(event){
    const file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.imageSrc = reader.result;
      reader.readAsDataURL(file);
    }
  }

  async windowFormats(){
    let formats = await (window['BarcodeDetector'].getSupportedFormats()).includes('ean_13','upc_a')
    return  formats
  }
  clearResult(): void {
    this.qrResultString = null;
  }

  onClick(){
    if(this.decoder){
      this.decoder.detect(document.getElementById('blah'))
      .then(detectedCodes => {
        for (const barcode of detectedCodes) {
          this.qrResultString = barcode
          console.log(barcode);
        }
      }).catch(() => {
        console.error("Barcode Detection failed, boo.");
      })
    }
  }

  onClick2(){
    this.openScanner()
  }


  //ZXING FUNCTIONS BELOW
  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onCodeResult(resultString: string) {
    this.qrResultString = resultString;
  }

  onDeviceSelectChange(selected: string) {
    const device = this.availableDevices.find(x => x.deviceId === selected);
    this.currentDevice = device || null;
  }


  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable$.next(isCompatible || false);
  }

  toggleTorch(): void {
    this.torchEnabled = !this.torchEnabled;
  }

  toggleTryHarder(): void {
    this.tryHarder = !this.tryHarder;
  }
  //Zxing Library
  onFoundBarcode(result){
    console.log(result)
  }

  playEvent(){
    console.log('this.this.not wuking')
      // get video's intrinsic width and height, eg 640x480,
      // and set canvas to it to match.
      this.canvas.width = this.video.videoWidth
      this.canvas.height = this.video.videoHeight

      // set position of orange frame in video
      this.frame.style.width = this.video.clientWidth * this.scale + 'px'
      this.frame.style.height = this.video.clientHeight * this.scale + 'px'
      this.frame.style.left =
        (window.innerWidth - this.video.clientWidth * this.scale) / 2 + 'px'
      this.frame.style.top =
        (window.innerHeight - this.video.clientHeight * this.scale) / 2 + 'px'

      // start the barcode reader process

      this.scanFrame()
  }

  openScanner() {
    this.showScanner()

    // get html element
    // turn on the video stream
    const constraints = { video: true }
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      this.videoStream = stream
      this.video.srcObject = stream
    })
  }

  scanFrame = () => {
    console.log('this..is it working?')
    if (this.videoStream) {
      // copy the video stream image onto the canvas
      this.canvas.getContext('2d').drawImage(
        this.video,
        // source x, y, w, h:
        (this.video.videoWidth - this.video.videoWidth * this.scale) / 2,
        (this.video.videoHeight - this.video.videoHeight * this.scale) / 2,
        this.video.videoWidth * this.scale,
        this.video.videoHeight * this.scale,
        // dest x, y, w, h:
        0,
        0,
        this.canvas.width,
        this.canvas.height
      )

      // convert the canvas image to an image blob and stick it in an image element
      this.canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        // when the image is loaded, feed it to the barcode reader
        this.img.onload = async () => {
          this.barcodeReader
            // .decodeFromImage(img) // decodes but doesn't show img
            .decodeFromImage(null, url)
            .then(this.found) // calls onFoundBarcode with the barcode string
            .catch(this.notfound)
            .finally(this.releaseMemory)
          this.img.onload = null
          setTimeout(this.scanFrame, this.timeout) // repeat
        }
        this.img.src = url // load the image blob
        console.log(this.img.src)
      })
    }
  }

  found = (result) => {
    this.onFoundBarcode(result.text)
    this.closeScanner()
  }

  notfound =(err) => {
    if (err.name !== 'NotFoundException') {
      console.error(err)
    }
  }

  releaseMemory = ()=>{
    URL.revokeObjectURL(this.img.url) // release image blob memory
    this.img.url = null
  }

  closeScanner() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop()) // stop webcam feed
      this.videoStream = null
    }
    this.hideScanner()
    this.barcodeReader.reset()
  }

  showScanner() {
    this.hidden = false
  }

  hideScanner() {
    this.hidden = true
  }


  crop = (videoWidth: number, videoHeight: number) => {
    const scanHeight = videoHeight / 2;
    const scanWidth = videoWidth / 2;
    const xOffset = (videoHeight - scanHeight) / 2;
    const yOffset = (videoWidth - scanWidth) / 2;

    return { scanHeight, scanWidth, xOffset, yOffset };
  }


}
