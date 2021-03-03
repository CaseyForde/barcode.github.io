import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BarcodeFormat, Result } from '@zxing/library';
import { BrowserMultiFormatOneDReader } from '@zxing/browser';
import Quagga from 'Quagga'
import { ZXingScannerComponent } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit,AfterViewInit{
  @ViewChild('scanner') scanner: ZXingScannerComponent

  permission:boolean = false;
  enabled:boolean = false;
  title: string;
  torch = false;
  failures = 0
  hasDevices: boolean;
  hasPermission: boolean;
  qrResult: Result;
  availableDevices: MediaDeviceInfo[];
  currentDevice: MediaDeviceInfo = null;


  constructor(){

  }

  ngOnInit(){

  }

  ngAfterViewInit(){
    this.scannerInit()
  }

  onClick(){
    console.log(this.availableDevices)
  }


  // onFileSelected(event){
  //   if (event.target.files && event.target.files[0]) {
  //     this.file = event.target.files[0];
  //     const file = event.target.files[0];
  //     const reader = new FileReader();
  //     reader.onload = () => this.imageSrc = reader.result;
  //     reader.readAsDataURL(file);
  //   }
  // }

  onDetect(result: string): void {
    alert(result);
  }

  onTorchCompatible(event){
    console.log(event,'torch')
  }

  camerasFoundHandler(event){
    console.log(event,'cameras found')
  }

  camerasNotFoundHandler(event){
    console.log('Not cammeras found')
  }
  scanSuccessHandler(event){

  }

  scanErrorHandler(event){

  }
  scanFailureHandler(event){
    console.log("Failure")
    this.failures++
  }

  scannerInit() {

    this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
      this.hasDevices = true;
      this.availableDevices = devices;
      this.currentDevice = null;

     // this.compareWith = this.compareWithFn;
      this.onDeviceSelectChange(devices[devices.length - 1].deviceId);
    });

    this.scanner.camerasNotFound.subscribe(() => this.hasDevices = false);
    this.scanner.scanComplete.subscribe((result: Result) => this.qrResult = result);
    this.scanner.permissionResponse.subscribe((perm: boolean) => this.hasPermission = perm);
  }

  onDeviceSelectChange(selected: string) {

    for (const device of this.availableDevices) {
        if (device.deviceId === selected) {
          this.currentDevice = device;
        }
      }
    }
}
