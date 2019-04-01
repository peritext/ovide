/**
 * This module provides a preview for paged content, thanks to the awesome pagedjs polyfill
 * @module ovide/components/PagedPreviewer
 * NOTE:
 * THIS COMPONENT IS DIRTY AS FFFFFFFFFF......
 * ... BUT IT WORKS.
 * @todo find a way to do the same thing while having better manners
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import { inElectron } from '../../helpers/electronUtils';
import { render } from 'react-dom';
import LoadingScreen from '../LoadingScreen';

const webAppPrefix = window.location.href.includes( 'ovide' ) ? `${window.location.href.split( 'ovide' )[0] }ovide/` : `${window.location.href.split( '/' ).slice( 0, 3 ).join( '/' ) }/`;

class PreviewWrapper extends Component {

  constructor( props ) {
    super( props );
  }

  update = ( /*props*/ ) => {

    /**
     * We could use renderToStaticMarkup to render edition cont
     * but we use a ref in order to allow components
     * to do their stuff at componentDidMount hook (vega, ...)
     */
    let htmlContent = this.renderer.contentDocument.body.children[0].innerHTML;
    const stylesRegexp = /<style.*>([\w\W\n]*)<\/style>/gm;
    let additionalStyles = '';
    let match;
    while ( ( match = stylesRegexp.exec( htmlContent ) ) !== null ) {
      additionalStyles += match[1];
      htmlContent = htmlContent.slice( 0, match.index ) + htmlContent.slice( match.index + match[0].length );
      match.index = -1;
    }
    const { additionalHTML } = this.props;
    const html = `
  <!DOCTYPE html PUBLIC>
<html lang="en" lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <meta http-equiv="Content-Style-Type" content="text/css" />
    <title>
      PagedJS previewer
    </title>
${additionalHTML}
<!-- toaster lib -->
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css">
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/toastify-js"></script>

<script>this.ready=new Promise(function($){
      console.info('document ready, begining to prepare it');
      document.addEventListener('DOMContentLoaded',$,{once:true})
    })</script>

    <script src="https://unpkg.com/pagedjs@0.1.30/dist/paged.polyfill.js"></script>
    <!-- using a custom pagedjs for scaffolding (@todo report bugs found and fixes) -->
    <!--<script src="${inElectron ? '' : webAppPrefix}resources/pagedjs.js"></script>-->

    <script>
    // footnotes support courtesy of RLesur https://github.com/rstudio/pagedown/blob/master/inst/resources/js/hooks.js
        // Hooks for paged.js
    // Footnotes support
Paged.registerHandlers(class extends Paged.Handler {
  constructor(chunker, polisher, caller) {
    super(chunker, polisher, caller);

    this.splittedParagraphRefs = [];
  }

  beforeParsed(content) {
    console.info('spotting footnotes');
    var footnotes = content.querySelectorAll('.footnote');

    for (var footnote of footnotes) {
      var parentElement = footnote.parentElement;
      var footnoteCall = document.createElement('a');
      var footnoteNumber = footnote.dataset.notenumber;

      footnoteCall.className = 'footnote-ref'; // same class as Pandoc
      footnoteCall.setAttribute('id', 'fnref' + footnoteNumber); // same notation as Pandoc
      footnoteCall.setAttribute('href', '#' + footnote.id);
      footnoteCall.innerHTML = '<sup id="note-content-pointer-' + footnote.id + '">' + footnoteNumber +'</sup>';
      parentElement.insertBefore(footnoteCall, footnote);

      // Here comes a hack. Fortunately, it works with Chrome and FF.
      var handler = document.createElement('p');
      handler.className = 'footnoteHandler';
      parentElement.insertBefore(handler, footnote);
      handler.appendChild(footnote);
      handler.style.display = 'inline-block';
      handler.style.width = '100%';
      handler.style.float = 'right';
      handler.style.pageBreakInside = 'avoid';
    }
  }

  afterParsed() {
    console.info('parsing finished, rendering the pages');
    console.group('rendering pages');
    Toastify({
      text: "Rendering pages",
      duration: 2000
    }).showToast();
  }

  afterPageLayout(pageFragment, page, breakToken) {
    console.info('page %s is rendered', page.position + 1);

    function hasItemParent(node) {
      if (node.parentElement === null) {
        return false;
      } else {
        if (node.parentElement.tagName === 'LI') {
          return true;
        } else {
          return hasItemParent(node.parentElement);
        }
      }
    }
    // If a li item is broken, we store the reference of the p child element
    // see https://github.com/rstudio/pagedown/issues/23#issue-376548000
    if (breakToken !== undefined) {
      if (breakToken.node.nodeName === "#text" && hasItemParent(breakToken.node)) {
        this.splittedParagraphRefs.push(breakToken.node.parentElement.dataset.ref);
      }
    }
  }

  afterRendered(pages) {
    console.groupEnd('rendering pages');
    Toastify({
      text: "Attaching footnotes to " + pages.length + " pages",
      duration: 1000
    }).showToast();
    console.info('rendering done, attaching footnotes to %s pages', pages.length);
    for (var page of pages) {
      var footnotes = page.element.querySelectorAll('.footnote');
      if (footnotes.length === 0) {
        continue;
      }

      var pageContent = page.element.querySelector('.pagedjs_page_content');
      var hr = document.createElement('hr');
      var footnoteArea = document.createElement('div');

      pageContent.style.display = 'flex';
      pageContent.style.flexDirection = 'column';

      hr.className = 'footnote-break';
      hr.style.marginTop = 'auto';
      hr.style.marginBottom = 0;
      hr.style.marginLeft = 0;
      hr.style.marginRight = 'auto';
      pageContent.appendChild(hr);

      footnoteArea.className = 'footnote-area';
      pageContent.appendChild(footnoteArea);
      var footnoteIndex = 0;
      for (var footnote of footnotes) {
        footnoteIndex++;
        var handler = footnote.parentElement;

        footnoteArea.appendChild(footnote);
        handler.parentNode.removeChild(handler);

        var footnoteCall = document.getElementById('note-content-pointer-' + footnote.id);
        if (footnoteCall) {
          footnoteCall.innerHTML = '<sup id="note-content-pointer-' + footnote.id + '">' + footnoteIndex +'</sup>';
        }

        footnote.innerHTML = '<sup class="note-pointer"><a href="#note-content-pointer-' + footnote.id + '">' + footnoteIndex + '</a></sup>' + footnote.innerHTML;
        // footnote.style.fontSize = 'x-small';
        footnote.style.marginTop = 0;
        footnote.style.marginBottom = 0;
        footnote.style.paddingTop = 0;
        footnote.style.paddingBottom = 0;
        footnote.style.display = 'block';
      }
    }

    for (var ref of this.splittedParagraphRefs) {
      var paragraphFirstPage = document.querySelector('[data-split-to="' + ref + '"]');
      // We test whether the paragraph is empty
      // see https://github.com/rstudio/pagedown/issues/23#issue-376548000
      if (paragraphFirstPage.innerText === "") {
        paragraphFirstPage.parentElement.style.display = "none";
        var paragraphSecondPage = document.querySelector('[data-split-from="' + ref + '"]');
        paragraphSecondPage.parentElement.style.setProperty('list-style', 'inherit', 'important');
      }
    }
    console.info('footnotes positionning done');
    Toastify({
      text: "Rendering finished !",
      duration: 3000
    }).showToast();

  }
});/* end register handlers */
           
      // window.PagedConfig = {
      //   after: (flow) => console.log(flow.performance)
      // }

      /**
       * DOM observer use to retrigger the resize script when changing content in the page
       */
      var observeDOM = (function(){
          const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

          return function( obj, callback ){
            if( !obj || !obj.nodeType === 1 ) return; // validation

            if( MutationObserver ){
              // define a new observer
              var obs = new MutationObserver(function(mutations, observer){
                  callback(mutations);
              })
              // have the observer observe foo for changes in children
              obs.observe( obj, { childList:true, subtree:true });
            }
            
            else if( window.addEventListener ){
              obj.addEventListener('DOMNodeInserted', callback, false);
              obj.addEventListener('DOMNodeRemoved', callback, false);
            }
          }
        })();


      ready.then(function() {
         
        // resize logic
        let paged = new window.Paged.Previewer()
        let resizer = () => {
          let pages = document.querySelector(".pagedjs_pages");

          if (pages) {
            let scale = ((window.innerWidth * .9 ) / pages.offsetWidth);
            if (scale < 1) {
              const translateVal = (window.innerWidth / 2) - ((pages.offsetWidth * scale / 2) );
              const style = "scale(" + scale + ") translate(" + translateVal + "px, 0)";;
              pages.style.transform = style;
            } else {
              pages.style.transform = "none";
            }
          }
        };
        resizer();

        window.addEventListener("resize", resizer, false);

        paged.on("rendering", () => {
          resizer();
        });

        observeDOM(document.body, resizer);

      })

        
    </script>
    
    <style>
 :root {
  --color-mbox : rgba(0,0,0,0.2);
  --margin: 4px;
}

[contenteditable]:focus {
    outline: 0px solid transparent;
}

#controls {
  display: none;
}

@media screen {

  body {
    background-color: whitesmoke;
  }

  .pagedjs_pages{
    transform: translate(0.5);
  }

  .pagedjs_page {
    background-color: #fdfdfd;
    margin: calc(var(--margin) * 4) var(--margin);
    flex: none;
    box-shadow: 0 0 0 1px var(--color-mbox);
  }

  .pagedjs_pages {
    width: calc((var(--width) * 2) + (var(--margin) * 4));
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    transform-origin: 0 0;
    margin: 0 auto;
  }

  #controls {
    margin: 20px 0;
    text-align: center;
    display: block;
  }

  .pagedjs_first_page {
    margin-left: calc(50% + var(--margin));
  }
}

@media screen {
  .debug .pagedjs_margin-top .pagedjs_margin-top-left-corner,
  .debug .pagedjs_margin-top .pagedjs_margin-top-right-corner {
    box-shadow: 0 0 0 1px inset var(--color-mbox);
  }

  .debug .pagedjs_margin-top > div {
    box-shadow: 0 0 0 1px inset var(--color-mbox);
  }

  .debug .pagedjs_margin-right > div {
    box-shadow: 0 0 0 1px inset var(--color-mbox);
  }

  .debug .pagedjs_margin-bottom .pagedjs_margin-bottom-left-corner,
  .debug .pagedjs_margin-bottom .pagedjs_margin-bottom-right-corner {
    box-shadow: 0 0 0 1px inset var(--color-mbox);
  }

  .debug .pagedjs_margin-bottom > div {
    box-shadow: 0 0 0 1px inset var(--color-mbox);
  }

  .debug .pagedjs_margin-left > div {
    box-shadow: 0 0 0 1px inset var(--color-mbox);
  }
}

${additionalStyles}
    </style>
  </head>
<body>
  ${htmlContent}
</body>
</html>
  `;

    const element = this.preview;
    // write new content
    element.contentWindow.document.open();
    element.contentWindow.document.write( html );
    element.contentWindow.document.close();
  }

  render = () => {

    const bindRendererRef = ( el ) => {
      this.renderer = el;
    };
    const bindPreviewRef = ( el ) => {
      this.preview = el;
    };

    const {
      props: {
        style,
        Component: RenderingComponent
      }
    } = this;

    setTimeout( () => {
      const contentDocument = this.renderer && this.renderer.contentDocument;
      if ( contentDocument ) {
        let mount = contentDocument.getElementById( 'mount' );
        if ( !mount ) {
          mount = contentDocument.createElement( 'div' );
          mount.id = 'mount';
          contentDocument.body.appendChild( mount );
        }

        render(
          <RenderingComponent renderAdditionalHTML={ false } />
        , mount );
        setTimeout( () => this.update() );
      }
    } );

    return (
      <div
        style={ style }
      >
        <LoadingScreen />
        <iframe
          id={ 'preview' }
          name={ 'preview' }
          ref={ bindPreviewRef }
          style={ style }
        />
        <iframe
          id={ 'renderer' }
          name={ 'renderer' }
          ref={ bindRendererRef }
          style={ { display: 'none' } }
        />
      </div>
    );
  }
}

export default PreviewWrapper;

