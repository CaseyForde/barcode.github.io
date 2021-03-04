import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BarcodeFormat, Result } from '@zxing/library';
import { BrowserMultiFormatOneDReader, IScannerControls } from '@zxing/browser';
import Quagga from 'Quagga'
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { BehaviorSubject } from 'rxjs';
import { BrowserCodeReader, HTMLCanvasElementLuminanceSource, HybridBinarizer, BinaryBitmap } from '@zxing/library';

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
  @ViewChild('scanner') scanner: ZXingScannerComponent

  availableDevices: MediaDeviceInfo[];
  currentDevice: MediaDeviceInfo = null;

  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.EAN_13,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E
  ];


  hasDevices: boolean;
  hasPermission: boolean;
  detectionHash = {}
  qrResultString: string;

  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  tryHarder = false;


  constructor(){

  }

  ngOnInit(){

  }

  ngAfterViewInit(){

  }
  clearResult(): void {
    this.qrResultString = null;
  }

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

}
