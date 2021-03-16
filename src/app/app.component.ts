import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Quagga from '@ericblade/quagga2';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { BehaviorSubject } from 'rxjs';
import { WindowService } from "./window.service";
import { BarcodeScannerLivestreamComponent } from "ngx-barcode-scanner";
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { BrowserMultiFormatOneDReader,BarcodeFormat,BrowserCodeReader,BrowserMultiFormatReader} from '@zxing/browser';
import { ChecksumException, DecodeHintType, FormatException, NotFoundException } from "@zxing/library";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit,AfterViewInit{
  // @ViewChild(BarcodeScannerLivestreamComponent)
  // barcodeScanner: BarcodeScannerLivestreamComponent;
  @ViewChild('video') video:HTMLVideoElement;
  value: string;
  isError = false;
  types:string[] = [
    "ean",
    "upc"
  ]
  hints = new Map();
  formats = [BarcodeFormat.UPC_A, BarcodeFormat.EAN_13, BarcodeFormat.UPC_EAN_EXTENSION/*, ...*/];

  codeReader:BrowserMultiFormatOneDReader;

  selectedDeviceId
  qrResultString: string;
  hasDevices: boolean;
  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);

  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.UPC_E,
    BarcodeFormat.UPC_A
  ];

  availableDevices: MediaDeviceInfo[];
  currentDevice: MediaDeviceInfo = null;

  constructor(private _window: WindowService,private el: ElementRef){

  }
  barcodeValue;
  ngOnInit(){
    BrowserCodeReader.listVideoInputDevices()
    .then((videoInputDevices) => {
      const sourceSelect = document.getElementById('sourceSelect')
      this.selectedDeviceId = videoInputDevices[0].deviceId
      if (videoInputDevices.length >= 1) {
        this.availableDevices = videoInputDevices
      }
    })
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, this.formats);
    this.codeReader = new BrowserMultiFormatOneDReader(this.hints)
  }
  onBarcodeScanned(code: any) {
    console.log(code)
  }

  ngAfterViewInit(){
    // this.barcodeScanner.start();
  }

  onClick(){
    this.decodeContinuously();
    console.log(`Started decode from camera with id ${this.selectedDeviceId}`)
  }

  // onError(error) {
  //   console.error(error);
  //   this.isError = true;
  // }

  // onValueChanges(result) {
  //   this.barcodeValue = result.codeResult.code;
  // }

  // onStarted(started) {
  //   console.log(started);
  // }

  decodeContinuously() {
    this.codeReader.decodeFromVideoDevice(this.selectedDeviceId,'video', (result, err) => {
      console.log()
      if (result) {
        // properly decoded qr code
        alert(result)
      }

      if (err) {
        // As long as this error belongs into one of the following categories
        // the code reader is going to continue as excepted. Any other error
        // will stop the decoding loop.
        //
        // Excepted Exceptions:
        //
        //  - NotFoundException
        //  - ChecksumException
        //  - FormatException

        if (err instanceof NotFoundException) {
          console.log('No QR code found.')
        }

        if (err instanceof ChecksumException) {
          console.log('A code was found, but it\'s read value was not valid.')
        }

        if (err instanceof FormatException) {
          console.log('A code was found, but it was in a invalid format.')
        }
      }
    })
  }

}
