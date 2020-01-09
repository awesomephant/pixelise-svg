import React from 'react';
import SVGCanvas from './SVGCanvas.js'
import Settings from './Settings.js'
import './css/App.css';

export default class App extends React.Component {

  constructor() {
    super()
    this.state = {
      width: 0,
      height: 0,
      settings: {
        resX: 145,
        resY: 160,
        samples: 100,
        enableGrid: true
      }
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
    this.updateSetting = this.updateSetting.bind(this)
  }
  
  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  updateSetting(setting, value) {
    console.log(`Updating setting ${setting} to ${value}`);
    this.setState((prevState) => {
      if (prevState.settings[setting] !== null) {
        prevState.settings[setting] = value;
      } else {
        console.error(`Attempted to update non-existing setting ${setting}`)
      }
      return prevState;
    })
  }
  render() {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Pixelise SVG</h1>
        </header>
        <main className='app-wrap'>
          <SVGCanvas width='1300' height='660' samples={this.state.settings.samples} resX={this.state.settings.resX} resY={this.state.settings.resY} enableGrid={this.state.settings.enableGrid}></SVGCanvas>
          <Settings updateSetting={this.updateSetting} settings={this.state.settings}></Settings>
        </main>
      </div>
    );
  }
}