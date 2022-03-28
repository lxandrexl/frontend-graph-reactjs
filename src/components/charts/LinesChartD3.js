import React, { useState, useEffect, useRef } from 'react'
import * as d3 from "d3";
import moment from 'moment';
import "./css/linesChart3D.css";

const es_PE = {
    "decimal": ",",
    "thousands": ".",
    "grouping": [3],
    "currency": ["S/", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%d/%m/%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    "shortDays": ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
    "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
};

d3.formatLocale(es_PE);

export default function LinesChartD3(datos) {   
    
    console.log("datos => ",datos)    

    var textoFecha = moment(datos.options.dateGraphic).format('dddd[,] D [de] MMMM [del] YYYY');
    var fechaSpanish =  moment(datos.options.dateGraphic).format('DD[/]MM[/]YYYY');   
    
    const series = (typeof datos.series.length ==0) ? [[],[],[]] : datos.series;
    
    const [heightDivSvg, setHeightDivSvg] = useState(0)
    const ref = useRef(null)
    
    useEffect(() => {
        setHeightDivSvg(ref.current.clientHeight)
    })

    if(datos.series.length == 0){
        return (
            <> 
                <div className="content_svg_daily" ref={ref}>
                    <svg id="grafico_daily"></svg>
                    <div id='tooltip' ></div>
                </div>          
            </>
        )
    }else{

        const dataGrafico = series[0];
        const umbralMinimo = series[2];
        const umbralMaximo = series[1]; 
        let minimoValor = false; 
        let maximoValor = false; 
    
        const parseTime = d3.timeParse("%Y-%m-%d %I:%M:%S");

        if(!minimoValor && !maximoValor){
            minimoValor = dataGrafico[0].value; 
            maximoValor = dataGrafico[0].value;
            dataGrafico.forEach((d) => {
                minimoValor = (d.value < minimoValor) 
                    ? d.value
                    : minimoValor;
                maximoValor = (d.value > maximoValor) 
                    ? d.value
                    : maximoValor;                
            }); 

            if(umbralMaximo.length > 0){
                maximoValor = (maximoValor > umbralMaximo[0].value)
                    ? maximoValor
                    : umbralMaximo[0].value;               
            }  
            
            if(umbralMinimo.length > 0){
                minimoValor  = (minimoValor < umbralMinimo[0].value)
                    ? minimoValor
                    : umbralMinimo[0].value;
            }
            
            console.log("maximoValor => ",maximoValor)
            console.log("minimoValor => ",minimoValor)
        }

        if(typeof dataGrafico[0].date === 'string'){
            
            dataGrafico.forEach((d) => {                
                d.date = parseTime(d.date);
                d.value = +d.value;
            }); 
            
            if(umbralMaximo.length > 0){

                umbralMinimo.forEach((d) => {
                    d.date = parseTime(d.date);
                    d.value = +d.value;
                }); 
            
            }

            if(umbralMaximo.length > 0){

                umbralMaximo.forEach((d) => {
                    d.date = parseTime(d.date);
                    d.value = +d.value;
                }); 
            
            }
        }      
        
        // set the dimensions and margins of the graph
        const margin = { top: 20, right: 20, bottom: 20, left: 70 },
            width = 960 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        // append the svg object to the body of the page
        const svg = d3.select("#grafico_daily")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Add X axis and Y axis
        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);
        x.domain(d3.extent(dataGrafico, (d) => { return d.date; }));
        y.domain([
            (minimoValor-15 < 0) ? 0 : minimoValor-15, 
            maximoValor+15
        ]);    
        
        console.log("eee=> ",maximoValor)
        
        const ejex = document.querySelector('.ejex');

        if(!ejex){

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .attr("class", "ejex");

        svg.append("g")
            .call(d3.axisLeft(y))
            .attr("class", "ejey");

            // add the Line
        var valueLine = d3.line()
            .x((d) => { return x(d.date); })
            .y((d) => { return y(d.value); });
        
        svg.append("path")
            .data([dataGrafico])
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#00ab55")
            .attr("stroke-width", 2.5)
            .attr("d", valueLine)
    
        var lineUmbral = d3.line()
            .x((d) => { return x(d.date); })
            .y((d) => { return y(d.value); });

        if(umbralMaximo.length){
            svg.append("path")
                .data([umbralMaximo])
                .attr("class", "lineUmbralMaximo")
                .attr("fill", "none")
                .attr("stroke", "#ffc107")
                .attr("stroke-width", 2.5)
                .attr("d", lineUmbral)  
        }

        if(umbralMinimo.length){
            svg.append("path")
                .data([umbralMinimo])
                .attr("class", "lineUmbralMinimo")
                .attr("fill", "none")
                .attr("stroke", "#1890ff")
                .attr("stroke-width", 2.5)
                .attr("d", lineUmbral)
        }         
            
        const focus = svg
            .append("g")
            .attr("class", "focus")
            .style("display", "none");
        
        // append the x line
        focus
            .append("line")
            .attr("class", "x")
            .attr("fill", "none")
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.5)
            .attr("y1", 0)
            .attr("y2", height);
        
        // append the y line
        focus
            .append("line")
            .attr("class", "y")
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.5)
            .attr("fill", "none")
            .attr("x1", 0)
            .attr("x2", 0);
            
        // append the circle at the intersection
        focus
            .append("circle")
            .attr("class", "y")
            .style("fill", "none")
            .attr("r", 4); // radius
        
        // place the value at the intersection
        focus.append("text").attr("class", "y1").attr("dx", 8).attr("dy", "-.3em");
        focus.append("text").attr("class", "y2").attr("dx", 8).attr("dy", "-.3em");
        
        // place the date at the intersection
        focus.append("text").attr("class", "y3").attr("dx", 8).attr("dy", "1em");
        focus.append("text").attr("class", "y4").attr("dx", 8).attr("dy", "1em");
    
        var tooltip = d3.select("#tooltip");
            
        function mouseMove(event) {
            const bisect = d3.bisector((d) => d.date).left,
            x0 = x.invert(d3.pointer(event, this)[0]),
            i = bisect(dataGrafico, x0, 1),
            d0 = dataGrafico[i - 1],
            d1 = dataGrafico[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        
            focus
                .select("circle.y")
                .attr("transform", "translate(" + x(d.date) + "," + y(d.value) + ")");      
        
            if(umbralMaximo.length > 0 && umbralMinimo.length > 0){
                tooltip.html(
                    "<p>"+moment(d.date).format('dddd DD [de] MMMM [a las] HH:mm A')+"</p>"
                    +"<label><span class='circle dispositivo'></span><span class='bold_dispo'>Dispositivo: </span><span>"+d.value+" "+datos.options.abrevDaily+"</span></label>"
                    +"<label><span class='circle umbralmin'></span><span class='bold_minimo'>Umbral Mínimo: </span><span>"+umbralMinimo[0].value+" "+datos.options.abrevDaily+"</span></label>"
                    +"<label><span class='circle umbralmax'></span><span class='bold_maximo'>Umbral Máximo: </span><span>"+umbralMaximo[0].value+" "+datos.options.abrevDaily+"</span></label"
                );
            }else if(umbralMaximo.length > 0){
                tooltip.html(
                    "<p>"+moment(d.date).format('dddd DD [de] MMMM [a las] HH:mm A')+"</p>"
                    +"<label><span class='circle dispositivo'></span><span class='bold_dispo'>Dispositivo: </span><span>"+d.value+" "+datos.options.abrevDaily+"</span></label>"
                    +"<label><span class='circle umbralmax'></span><span class='bold_maximo'>Umbral Máximo: </span><span>"+umbralMaximo[0].value+" "+datos.options.abrevDaily+"</span></label"
                );
            }else if(umbralMinimo.length > 0){
                tooltip.html(
                    "<p>"+moment(d.date).format('dddd DD [de] MMMM [a las] HH:mm A')+"</p>"
                    +"<label><span class='circle dispositivo'></span><span class='bold_dispo'>Dispositivo: </span><span>"+d.value+" "+datos.options.abrevDaily+"</span></label>"
                    +"<label><span class='circle umbralmax'></span><span class='bold_maximo'>Umbral Máximo: </span><span>"+umbralMaximo[0].value+" "+datos.options.abrevDaily+"</span></label"
                );
            }else{
                tooltip.html(
                    "<p>"+moment(d.date).format('dddd DD [de] MMMM [a las] HH:mm A')+"</p>"
                    +"<label><span class='circle dispositivo'></span><span class='bold_dispo'>Dispositivo: </span><span>"+d.value+" "+datos.options.abrevDaily+"</span></label>"
                );
            }

            //console.log("event.pageY => ", event.pageY)

            if(event.pageX-280 > 750){
                if( event.pageY > 480){
                    tooltip
                        .style("top", (event.pageY-300)+"px")
                        .style("left",(event.pageX-500)+"px")
                }else{
                    tooltip
                        .style("top", (event.pageY-100)+"px")
                        .style("left",(event.pageX-500)+"px")
                }
                    
            }else{

                if( event.pageY > 480){
                    tooltip
                        .style("top", (event.pageY-200)+"px")
                        .style("left",(event.pageX-280)+"px")
                }else{
                    tooltip
                        .style("top", (event.pageY-100)+"px")
                        .style("left",(event.pageX-280)+"px")
                }                    
            }                 
            
            //console.log("event.pageX => ",event.pageX)
        }            
    
        svg
            .append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", () => {
                focus.style("display", null);
                tooltip.style("display", null);
            })
            .on("mouseout", () => {
                focus.style("display", "none");
                tooltip.style("display", "none");
            })
            .on("touchmove mousemove", mouseMove);
        }         
        
        return (
        <> 
            <div className="content_svg_daily" ref={ref}>
                <h1 className='h1graphic'>{datos.options.titleGraphic}</h1>                
                <h4 className="h4graphic">{datos.options.subtitleGraphic}</h4>
                <p className="pdetails">Fecha: <span>{textoFecha}</span></p>
                <svg id="grafico_daily"></svg>
                <p className='center abajografico'>Fecha: {fechaSpanish} desde las 00:00h hasta las 23:59h</p>
                <div id='tooltip' ></div>
            </div>          
        </>
        )

    }

    
    
  }