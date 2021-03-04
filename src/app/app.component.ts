import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BarcodeFormat, Result } from '@zxing/library';
import { BrowserMultiFormatOneDReader, IScannerControls } from '@zxing/browser';
import Quagga from 'Quagga'
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { BehaviorSubject } from 'rxjs';
import { BrowserCodeReader, HTMLCanvasElementLuminanceSource, HybridBinarizer, BinaryBitmap } from '@zxing/library';

ZXingScannerComponent.prototype.getAnyVideoDevice = (): Promise<MediaStream> => {
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: { min: 640, ideal: 1920 },
      height: { min: 400, ideal: 1080 },
      aspectRatio: { ideal: 1.7777777778 }
    }
  });
};

BrowserCodeReader.prototype.decodeFromVideoDevice = async function(
  deviceId: string | undefined,
  previewElem: string | HTMLVideoElement | undefined,
  callbackFn: any,
): Promise<any> {

  // We had to comment this out because it is a private method...
  // BrowserCodeReader.checkCallbackFnOrThrow(callbackFn);

  let videoConstraints: MediaTrackConstraints;

  if (!deviceId) {
    videoConstraints = { facingMode: 'environment' };
  } else {
    videoConstraints = {
      deviceId: { exact: deviceId },
      width: { min: 640, ideal: 1920 },
      height: { min: 400, ideal: 1080 },
      aspectRatio: { ideal: 1.7777777778 }
    };
  }

  const constraints: MediaStreamConstraints = { video: videoConstraints };

  return await this.decodeFromConstraints(constraints, previewElem, callbackFn);
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
  ];

  hasDevices: boolean;
  hasPermission: boolean;

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
