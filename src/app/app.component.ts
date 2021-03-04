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
    this.scanBarcode()
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

  scanBarcode(){
    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          constraints: {
            width: '790',
            height: '490',
            facingMode: 'environment' // or user
          },
        },
        frequency:'full',
        locator: {
          halfSample: true
        },
        numOfWorkers: 8,
        decoder: {
          readers: [
            // 'code_39_reader',
            'ean_reader',
            // 'ean_8_reader',
            'code_128_reader',
            //'code_39_vin_reader'
            //'codabar_reader',
            'upc_reader',
            'upc_e_reader',
            //'i2of5_reader'
          ]
        },
        locate: true
      },
      function(err) {
        if (err) {
          return console.log(err);
        }
        Quagga.start();
      }
    );
    Quagga.onDetected(this.onDetected);
    Quagga.onProcessed(this.onProcessed);
  }

  onDetected (result) {
    //add check for barcode from scan; use the getitembybarcode function
    var countDecodedCodes=0, err=0;
    result.codeResult.decodedCodes.forEach(element => {
      if (element.error!=undefined) {
        countDecodedCodes++;
        err+=parseFloat(element.error);
      }
    });
    if (err/countDecodedCodes < 0.05) {
      console.log(result)
      this.qrResultString = result.codeResult.code
      alert(this.qrResultString)
    } else {
      console.log("we here?")
    }
  }


  private onProcessed(result: any) {
    // let drawingCtx = Quagga.canvas.ctx.overlay,
    //   drawingCanvas = Quagga.canvas.dom.overlay;

    // if (result) {
    //   if (result.boxes) {
    //     drawingCtx.clearRect(
    //       0,
    //       0,
    //       parseInt(drawingCanvas.getAttribute('width'), 10),
    //       parseInt(drawingCanvas.getAttribute('height'), 10)
    //     );
    //     result.boxes
    //       .filter(function(box) {
    //         return box !== result.box;
    //       })
    //       .forEach(function(box) {
    //         Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
    //           color: 'green',
    //           lineWidth: 2
    //         });
    //       });
    //   }

    //   if (result.box) {
    //     Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
    //       color: '#00F',
    //       lineWidth: 2
    //     });
    //   }

    //   if (result.box) {
    //     Quagga.ImageDebug.drawPath(
    //       result.line,
    //       { x: 'x', y: 'y' },
    //       drawingCtx,
    //       { color: 'red', lineWidth: 3 }
    //     );
    //   }
    // }
  }
}
