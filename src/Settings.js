import React from 'react';
import Slider from './Slider.js';
import Toggle from './Toggle.js';
import './Settings.css';

// const equal = require('fast-deep-equal/es6/react');

export default class Settings extends React.Component {
    constructor() {
        super();
        this.handleChange = this.handleChange.bind(this);
        this.resultToFile = this.resultToFile.bind(this);
    }
    handleChange(e) {
        const setting = e.target.getAttribute('name');
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        this.props.updateSetting(setting, value)
    }
    resultToFile() {
        var svgUrl = URL.createObjectURL(this.props.svgBlob);
        var downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "newesttree.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    render() {
        return (
            <div className='settings'>
                <Slider changeHandler={this.handleChange} value={this.props.settings.resX} title='Resolution X' id='resX' min='1' max='300' step='1'></Slider>
                <Slider changeHandler={this.handleChange} value={this.props.settings.resY} title='Resolution Y' id='resY' min='1' max='300' step='1'></Slider>
                <Slider changeHandler={this.handleChange} value={this.props.settings.samples} title='Samples' id='samples' min='10' max='300' step='1'></Slider>
                <Toggle value={this.props.settings.enableGrid} id='enableGrid' changeHandler={this.handleChange} title='Enable Grid'></Toggle>
                <a href='#1' className='btn' onClick={this.resultToFile}>Download SVG</a>
            </div>
        )
    }
}