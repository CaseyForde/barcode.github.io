import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BarcodeFormat, BrowserBarcodeReader, Result , BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException} from '@zxing/library';
import Quagga from '@ericblade/quagga2';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { BehaviorSubject } from 'rxjs';
import { MultiFormatReader,BrowserCodeReader, HTMLCanvasElementLuminanceSource, HybridBinarizer, BinaryBitmap } from '@zxing/library';
import { WindowService } from "./window.service";
import { BarcodeScannerLivestreamComponent } from "ngx-barcode-scanner";
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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
  codeReader = new BrowserMultiFormatReader()
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
    this.codeReader.getVideoInputDevices()
    .then((videoInputDevices) => {
      const sourceSelect = document.getElementById('sourceSelect')
      this.selectedDeviceId = videoInputDevices[0].deviceId
      if (videoInputDevices.length >= 1) {
        this.availableDevices = videoInputDevices
      }
    })
  }
  onBarcodeScanned(code: any) {
    console.log(code)
  }

  ngAfterViewInit(){
    // this.barcodeScanner.start();
  }

  onClick(){
    this.decodeContinuously(this.codeReader, this.selectedDeviceId);
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

  decodeContinuously(codeReader, selectedDeviceId) {
    codeReader.decodeFromInputVideoDeviceContinuously(selectedDeviceId, 'video', (result, err) => {
      console.log()
      if (result) {
        // properly decoded qr code
        console.log('Found QR code!', result)
        document.getElementById('result').textContent = result.text
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
