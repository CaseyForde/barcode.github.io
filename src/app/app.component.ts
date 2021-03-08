import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BarcodeFormat, BrowserBarcodeReader, Result } from '@zxing/library';
import { BrowserMultiFormatOneDReader, IScannerControls } from '@zxing/browser';
import Quagga from 'Quagga'
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { BehaviorSubject } from 'rxjs';
import { MultiFormatReader,BrowserCodeReader, HTMLCanvasElementLuminanceSource, HybridBinarizer, BinaryBitmap } from '@zxing/library';
import { WindowService } from "./window.service";

BrowserCodeReader.prototype.createBinaryBitmap = function (mediaElement) {
  const captureCanvasContext = this.getCaptureCanvasContext(mediaElement);
  this.drawImageOnCanvas(captureCanvasContext, mediaElement);
  const captureCanvas = this.getCaptureCanvas(mediaElement);

  const allWidth = captureCanvas.width;
  const allHeight = captureCanvas.height;
  const squareSize = Math.min(allWidth, allHeight) / 2;
  const top = (allHeight - squareSize) / 2;
  const left = (allWidth - squareSize) / 2;

  document.getElementById('scan-area').style.width = `${squareSize}px`;
  document.getElementById('scan-area').style.height = `${squareSize}px`;

  const canvas = document.createElement('canvas');
  canvas.width = squareSize;
  canvas.height = squareSize;
  const ctx = canvas.getContext('2d');
  ctx.rect(0, 0, squareSize, squareSize);
  ctx.fillStyle = 'white';
  ctx.fill();

  ctx.putImageData(captureCanvasContext.getImageData(left, top, squareSize, squareSize), 0, 0);

  const luminanceSource = new HTMLCanvasElementLuminanceSource(canvas);
  const hybridBinarizer = new HybridBinarizer(luminanceSource);

  return new BinaryBitmap(hybridBinarizer);
};

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
  selectedDeviceId: string;


  constructor(private _window: WindowService,private el: ElementRef){

  }

  ngOnInit(){

  }

  ngAfterViewInit(){
    if (('BarcodeDetector' in window) && (this.windowFormats)) {
      alert('Barcode scanning is supported.');
      this.decoder = new window['BarcodeDetector']({formats: ['code_39', 'codabar', 'ean_13']})
    }else {
      alert('Barcode Detector is not supported!');
    }
    let selectedDeviceId;
    console.log('ZXing code reader initialized')
    this.barcodeReader.getVideoInputDevices()
        .then((videoInputDevices) => {
            this.selectedDeviceId = videoInputDevices[1].deviceId })
  }

  start(){
    this.barcodeReader.decodeOnceFromVideoDevice(this.selectedDeviceId, 'video').then((result) => {
      console.log(result)
      // this.qrResultString = result
  }).catch((err) => {
      console.error(err)
      // document.getElementById('result').textContent = err
  })
  console.log(`Started continous decode from camera with id ${this.selectedDeviceId}`)

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



  crop = (videoWidth: number, videoHeight: number) => {
    const scanHeight = videoHeight / 2;
    const scanWidth = videoWidth / 2;
    const xOffset = (videoHeight - scanHeight) / 2;
    const yOffset = (videoWidth - scanWidth) / 2;

    return { scanHeight, scanWidth, xOffset, yOffset };
  }


}
