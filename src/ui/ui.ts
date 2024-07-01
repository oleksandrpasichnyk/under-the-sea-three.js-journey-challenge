import gsap from "gsap";
import { Container, Text } from "pixi.js";

export default class UI extends Container {
  private countdown!: Text;
  private speedMeter!: Text;

  constructor() {
    super();

    this.init();
  }

  public showSpeedMeter() {
    this.speedMeter.visible = true;
  }

  public hideSpeedMeter() {
    this.speedMeter.visible = false;
  }

  public updateSpeedMeter(value: number) {
    this.speedMeter.text = value.toFixed(0) + ' km/h';
  }

  public updateCountdown(value: number | string) {
    this.countdown.text = value.toString();
    
    let duration = 0.8;

    const scale = value === 0 ? 0.5 : 1;

    if (value === 0) {
      this.countdown.text = 'START';
      duration *= 1.2;
    }
    
    this.countdown.visible = true;

    this.countdown.scale.set(0);

    gsap.to(this.countdown.scale, {
      x: scale,
      y: scale,
      duration: duration,
      ease: 'sine.in',
      onComplete: () => {
        this.countdown.scale.set(0);
      }
    });

    gsap.to(this.countdown, {
      delay: duration * 0.6,
      alpha: 0,
      duration: duration * 0.4,
      ease: 'sine.in',
      onComplete: () => {
        this.countdown.visible = false;
        this.countdown.alpha = 1;
      }
    });
  }

  private init() {
    this.initCountdown();
    this.initSpeedMeter();
  }

  private initCountdown() {
    const countdown = this.countdown = new Text('3', {
      fontFamily: 'Courier New, monospace',
      fontSize: 500,
      fill: 0xffffff,
      
      // make bold

      fontWeight: 'bold',

      align: 'center',
      stroke: 0x2e4063,
      strokeThickness: 10,
    });


    countdown.anchor.set(0.5);
    this.addChild(countdown);

    countdown.visible = false;
  }

  private initSpeedMeter() {
    const speedMeter = this.speedMeter = new Text('0 ', {
      fontFamily: 'Courier New, monospace',
      fontSize: 50,
      fill: 0xffffff,
      fontWeight: '600',
      align: 'right',
      stroke: 0x2e4063,
      strokeThickness: 5,
    });

    speedMeter.anchor.set(1, 0.5);
    this.addChild(speedMeter);

    speedMeter.visible = false;
  }

  public resize() {
    const { innerWidth, innerHeight } = window;
    const countdown = this.countdown;
    const speedMeter = this.speedMeter;

    countdown.position.set(innerWidth / 2, innerHeight / 2);

    speedMeter.position.set(innerWidth - 100, innerHeight - 100);
  }
}