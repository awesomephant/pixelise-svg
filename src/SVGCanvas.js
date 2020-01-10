import React from 'react';
import './css/SVGCanvas.css'
import { SVG } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.topoly.js'
import { testPath } from './testPath.js';

const equal = require('fast-deep-equal/es6/react');

export default class SVGCanvas extends React.Component {
    constructor() {
        super()
        this.state = {
            inputPaths: [testPath],
            outputPolygons: []
        }
        this.c = null;
        this.cg = null;
        this.outputDrawing = React.createRef()
        this.componentDidMount = this.componentDidMount.bind(this)
        this.drawResult = this.drawResult.bind(this)
        this.processPath = this.processPath.bind(this)
        this.drawGrid = this.drawGrid.bind(this)
        this.handleDrop = this.handleDrop.bind(this)
        this.updateBlob = this.updateBlob.bind(this)
    }
    componentDidMount() {
        this.c = SVG().addTo('#workDrawing');
        this.cg = SVG().addTo('#drawing').size(this.props.width, this.props.height).attr('class', 'grid')
        this.drawGrid();
        this.drawResult();
        this.updateBlob()
    }
    
    componentDidUpdate(prevProps) {
        this.drawGrid();
        if (!equal(this.props, prevProps)) {
            this.drawResult();
            this.updateBlob()
        }
    }

    handleDragOver(e) {
        e.stopPropagation();
        e.preventDefault()
    }

    handleDragEnter(e) {
        e.stopPropagation();
    }

    parseSVG(s) {
        const svg = SVG(s);
        const paths = svg.find('path')
        let pathStrings = []
        console.log(`${paths.length} path elements found.`)
        for (let i = 0; i < paths.length; i++) {
            let p = paths[i];
            pathStrings.push(p.node.attributes.d.nodeValue);
        }
        this.setState({ inputPaths: pathStrings })
    }

    handleDrop(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        if (ev.dataTransfer.items) {
            if (ev.dataTransfer.items[0].kind === 'file') {
                var file = ev.dataTransfer.items[0].getAsFile();
                if (file.type === 'image/svg+xml') {
                    file.text().then(text => { this.parseSVG(text) })
                }
            }
        }
    }

    drawGrid() {
        this.cg.clear()
        if (this.props.enableGrid) {
            for (let i = 0; i < this.props.resY; i++) {
                let y = (this.props.height / this.props.resY) * i;
                this.cg.polygon([[0, y], [this.props.width, y]]);
            }
            for (let i = 0; i < this.props.resX; i++) {
                let x = (this.props.width / this.props.resX) * i;
                this.cg.polygon([[x, 0], [x, this.props.height]]);
            }
        }
    }

    processPath(path) {
        let inputPath = this.c.path(path);
        let polygon = inputPath.toPoly(this.props.samples)
        let points = polygon._array;
        let roundedPoints = [];
        let orthogonalPoints = [];

        // Round points to nearest grid points
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            let intervalX = this.props.width / this.props.resX
            let intervalY = this.props.height / this.props.resY
            let x = Math.round(p[0] / intervalX) * intervalX;
            let y = Math.round(p[1] / intervalY) * intervalY;
            roundedPoints.push([x, y])
        }

        // Insert points to ensure right angles 
        orthogonalPoints.push(roundedPoints[0])
        let result = []
        for (let i = 1; i < roundedPoints.length; i++) {
            let currentPoint = roundedPoints[i];
            let previousPoint = roundedPoints[i - 1];
            if (currentPoint[0] !== previousPoint[0] && currentPoint[1] !== previousPoint[1]) {
                let newPoint = [currentPoint[0], previousPoint[1]];
                orthogonalPoints.push(newPoint)
                result.push(newPoint.join(','))
            }
            if (currentPoint[0] !== previousPoint[0] || currentPoint[1] !== previousPoint[1]) {
                orthogonalPoints.push(currentPoint)
                result.push(currentPoint.join(','))
            }
        }

        return result;
    }

    updateBlob() {
        const svgData = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="1300" height="660">' + this.outputDrawing.current.innerHTML + '</svg>';
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        this.props.handleSVGBlob(svgBlob)
    }

    drawResult() {
        this.c.clear()
        let results = []
        for (let i = 0; i < this.state.inputPaths.length; i++) {
            results.push(this.processPath(this.state.inputPaths[i]))
        }

        this.setState({ outputPolygons: results })
    }
    render() {
        const polygons = this.state.outputPolygons.map((poly, i) => {
            return (<polygon key={i} style={{stroke: 'black'}} className='result' points={poly.join(' ')}></polygon>)
        })
        return (
            <div onDrop={this.handleDrop} onDragOver={this.handleDragOver} onDragEnter={this.handleDragEnter} className='drawing' id='drawing'>
                <svg className='outputDrawing' ref={this.outputDrawing} width={this.props.width} height={this.props.height}>
                    {polygons}
                </svg>
                <div className='workDrawing' id='workDrawing'></div>
            </div>
        )
    }
}