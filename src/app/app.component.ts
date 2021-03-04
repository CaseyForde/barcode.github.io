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
    const constraints = {
      width: {
          min: 640,
      },
      height: {
          min: 480,
      },
      aspectRatio: {
          min: 1,
          max: 2,
      }
  };
    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          constraints: {
            width: '800',
            height: '800',
            facingMode: 'environment', // or user
          },
        },
        frequency:'full',
        locator: {
          patchSize: 'medium',
          halfSample: true,
        },
        numOfWorkers: window.navigator.hardwareConcurrency || 2,
        locate: true,

        decoder: {
          readers: ['upc_reader', 'ean_reader']
        }
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


     //https://github.com/serratus/quaggaJS/issues/237#issuecomment-389667599
  private _getMedian(arr: number[]): number {
    arr.sort((a, b) => a - b);
    const half = Math.floor( arr.length / 2 );
    if (arr.length % 2 === 1) // Odd length
      return arr[ half ];
    return (arr[half - 1] + arr[half]) / 2.0;
  }

  onDetected (result) {
    var countDecodedCodes=0, err=0;
    result.codeResult.decodedCodes.forEach(element => {
      if (element.error!=undefined) {
        countDecodedCodes++;
        err+=parseFloat(element.error);
      }
    });
    if (err/countDecodedCodes < 0.1) {
      // console.log(result)
      // this.qrResultString = result.codeResult.code
      // alert(this.qrResultString)
        const errors: number[] = result.codeResult.decodedCodes
          .filter(_ => _.error !== undefined)
          .map(_ => _.error);
        var median
        errors .sort((a, b) => a - b);
        const half = Math.floor( errors .length / 2 );
        if (errors .length % 2 === 1) {// Odd length
          median =  errors[ half ];
        }
        median =  (errors[half - 1] + errors[half]) / 2.0;
        if (median < 0.10){
          console.log(result)
          console.log(err/countDecodedCodes)
          this.qrResultString = result.codeResult.code
          alert(this.qrResultString)
        }
        else{}
          // probably wrong

    } else {
      console.log("we here?")
    }


  }


  private onProcessed(result: any) {
    (result: {
      boxes: { filter: (arg0: (box: any) => boolean) => { forEach: (arg0: (box: any) => void) => void } };
      box: any;
      codeResult: { code: any };
      line: any;
      }) => {
      const drawingCtx = Quagga.canvas.ctx.overlay;
      const drawingCanvas = Quagga.canvas.dom.overlay;

      if (result) {
          if (result.boxes) {
              drawingCtx.clearRect(
                  0,
                  0,
                  parseInt(drawingCanvas.getAttribute('width'), 10),
                  parseInt(drawingCanvas.getAttribute('height'), 10)
              );
              result.boxes
                  .filter(box => box !== result.box)
                  .forEach(box => {
                  Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                      color: 'lightblue',
                      lineWidth: 3
                  });
                  });
          }

          if (result.box) {
              Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
                  color: 'lightgreen',
                  lineWidth: 3
              });
          }

          if (result.codeResult && result.codeResult.code) {
              Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, {
                  color: 'red',
                  lineWidth: 3
              });
          }
      }
      }
  }

}
