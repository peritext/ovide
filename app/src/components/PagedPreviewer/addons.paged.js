/* eslint-disable */

/**
 * DOM observer use to retrigger the resize script when changing content in the page
 */
if (!window.observeDOM) {
window.observeDOM = ( function() {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    return function( obj, callback ) {
      if ( !obj || !obj.nodeType === 1 ) return; // validation

      if ( MutationObserver ) {
        // define a new observer
        const obs = new MutationObserver( function( mutations, observer ) {
            callback( mutations );
        } );
        // have the observer observe foo for changes in children
        obs.observe( obj, { childList: true, subtree: true } );
      }

      else if ( window.addEventListener ) {
        obj.addEventListener( 'DOMNodeInserted', callback, false );
        obj.addEventListener( 'DOMNodeRemoved', callback, false );
      }
    };
  } )();
}

if ( window.Paged ) {

      /*
       * Hooks for paged.js
       * footnotes support courtesy of RLesur https://github.com/rstudio/pagedown/blob/master/inst/resources/js/hooks.js
       * Footnotes support
       */
        Paged.registerHandlers( class extends Paged.Handler {
        constructor( chunker, polisher, caller ) {
          super( chunker, polisher, caller );

          this.splittedParagraphRefs = [];
        }

        beforeParsed( content ) {
          console.info( 'spotting footnotes' );
          const footnotes = content.querySelectorAll( '.footnote' );
          for ( const footnote of footnotes ) {
            const parentElement = footnote.parentElement;
            const footnoteCall = document.createElement( 'a' );
            const footnoteNumber = footnote.dataset.notenumber;

            footnoteCall.className = 'footnote-ref'; // same class as Pandoc
            footnoteCall.setAttribute( 'id', `fnref${ footnoteNumber}` ); // same notation as Pandoc
            footnoteCall.setAttribute( 'href', `#${ footnote.id}` );
            footnoteCall.innerHTML = `<sup id="note-content-pointer-${ footnote.id }">${ footnoteNumber }</sup>`;
            parentElement.insertBefore( footnoteCall, footnote );

            // Here comes a hack. Fortunately, it works with Chrome and FF.
            const handler = document.createElement( 'div' );
            handler.className = 'footnoteHandler';
            parentElement.insertBefore( handler, footnote );
            handler.appendChild( footnote );
            handler.style.display = 'inline-block';
            handler.style.width = '100%';
            handler.style.float = 'right';
            handler.style.margin = '0';
            // handler.style.pageBreakInside = 'avoid';
          }
        }

        afterParsed() {
          console.info( 'parsing finished, rendering the pages' );
          console.group( 'rendering pages' );
          if (window.Toastify) {
            Toastify( {
              text: 'Rendering pages',
              duration: 2000
            } ).showToast();
          }
          
        }

        afterPageLayout( pageFragment, page, breakToken ) {
          console.info( 'page %s is rendered', page.position + 1 );
          if (page.position%20 === 0 && page.position && Toastify) {
            Toastify( {
              text: 'Rendering pages : ' + (page.position) + '/?',
              duration: 1000
            } ).showToast();
          }

          function hasItemParent( node ) {
            if ( node.parentElement === null ) {
              return false;
            }
          else {
              if ( node.parentElement.tagName === 'LI' ) {
                return true;
              }
            else {
                return hasItemParent( node.parentElement );
              }
            }
          }

          /*
           * If a li item is broken, we store the reference of the p child element
           * see https://github.com/rstudio/pagedown/issues/23#issue-376548000
           */
          if ( breakToken !== undefined ) {
            if ( breakToken.node.nodeName === '#text' && hasItemParent( breakToken.node ) ) {
              this.splittedParagraphRefs.push( breakToken.node.parentElement.dataset.ref );
            }
          }
        }

        afterRendered( pages ) {
          console.groupEnd( 'rendering pages' );
          if (window.Toastify) {
            Toastify( {
              text: `Attaching footnotes to ${ pages.length } pages`,
              duration: 1000
            } ).showToast();
          }
          console.info( 'rendering done, attaching footnotes to %s pages', pages.length );
          let footnoteIndex = 0;
          for ( const page of pages ) {
            // reset note number when changing section
            if (page.element.className.includes('pagedjs_section_first_page')) {
              console.log('reset footnote number');
              footnoteIndex = 0;
            }
            const footnotes = page.element.querySelectorAll( '.footnote' );
            if ( footnotes.length === 0 ) {
              continue;
            }

            const pageContent = page.element.querySelector( '.pagedjs_page_content' );
            const hr = document.createElement( 'hr' );
            const footnoteArea = document.createElement( 'div' );

            pageContent.style.display = 'flex';
            pageContent.style.flexDirection = 'column';

            hr.className = 'footnote-break';
            hr.style.marginTop = 'auto';
            hr.style.marginBottom = 0;
            hr.style.marginLeft = 0;
            hr.style.marginRight = 'auto';
            pageContent.appendChild( hr );

            footnoteArea.className = 'footnote-area';
            pageContent.appendChild( footnoteArea );
            for ( const footnote of footnotes ) {
              footnoteIndex++;
              const handler = footnote.parentElement;

              footnoteArea.appendChild( footnote );
              handler.parentNode.removeChild( handler );

              const footnoteCall = document.getElementById( `note-content-pointer-${ footnote.id}` );
              if ( footnoteCall ) {
                footnoteCall.innerHTML = `<sup id="note-content-pointer-${ footnote.id }">${ footnoteIndex }</sup>`;
              }

              footnote.innerHTML = `${footnote.id ? `<sup class="note-pointer"><a href="#note-content-pointer-${ footnote.id }">${ footnoteIndex }</a></sup>` : ''}${ footnote.innerHTML}`;
              // footnote.style.fontSize = 'x-small';
              footnote.style.marginTop = 0;
              footnote.style.marginBottom = 0;
              footnote.style.paddingTop = 0;
              footnote.style.paddingBottom = 0;
              footnote.style.display = 'block';
            }
          }

          for ( const ref of this.splittedParagraphRefs ) {
            const paragraphFirstPage = document.querySelector( `[data-split-to="${ ref }"]` );

            /*
             * We test whether the paragraph is empty
             * see https://github.com/rstudio/pagedown/issues/23#issue-376548000
             */
            if ( paragraphFirstPage.innerText === '' ) {
              paragraphFirstPage.parentElement.style.display = 'none';
              const paragraphSecondPage = document.querySelector( `[data-split-from="${ ref }"]` );
              paragraphSecondPage.parentElement.style.setProperty( 'list-style', 'inherit', 'important' );
            }

          
          }
          console.info( 'footnotes positionning done' );
          /**
           * If overflow adjustments handle them
           */
          const noOverflow = document.querySelectorAll('.pagedjs_no-page-overflow-y');
          // hacky : retrieving pages transform to apply it to overflow adjustments
          let pageScale = 1;
          const pagesContainer = document.querySelector( '.pagedjs_pages' )
          if (pagesContainer && pagesContainer.style.transform && pagesContainer.style.transform.match(/scale\((.+)\)/)) {
            pageScale = +pagesContainer.style.transform.match(/scale\((.+)\)/)[1];
          }
          [].forEach.call(noOverflow, (before, index1) => {
            [].forEach.call(noOverflow, (after, index2) => {
              if (index1 < index2) {
                if (before.parentNode.parentNode === after.parentNode.parentNode) {
                  const {top: yBefore, height: hBefore} = before.getBoundingClientRect();
                  const {top: yAfter, height: hAfter} = after.getBoundingClientRect();
                  if (yAfter >= yBefore && yAfter <= (yBefore + hBefore)) {
                    const absY = ((yAfter - yBefore) + hBefore) / pageScale;
                    before.parentNode.style.position = 'relative';
                    after.parentNode.style.position = 'relative';
                    after.style.top = absY + 'px';
                    console.log({yBefore, yAfter, hBefore})
                  }
                }
              }
            })
          })
          if(Toastify) {
            Toastify( {
              text: 'Rendering finished !',
              duration: 3000
            } ).showToast();
          }
          

        }
        } );/* end register handlers */
    // resize logic
    const paged = new window.Paged.Previewer();
    const resizer = () => {
      const pages = document.querySelector( '.pagedjs_pages' );

      if ( pages ) {
        const scale = ( ( window.innerWidth * .9 ) / pages.offsetWidth );
        if ( scale < 1 ) {
          const newWidth = pages.offsetWidth * scale;
          const newHeight = pages.offsetHeight * scale
          const translateX = (pages.offsetWidth - newWidth) / 2;
          const translateY = (pages.offsetHeight - newHeight) / 2;
          // console.log(pages.offsetHeight, translateY)
          const style = `translate(${ -translateX }px, ${-translateY}px) scale(${ scale }) `;
          pages.style.transform = style;
          // document.body.style.transform = style;
          // document.body.style['max-height'] = translateY;
        }
        else {
          document.body.style.transform = 'none';
        }
      }
    };
    resizer();

    window.addEventListener( 'resize', resizer, false );

    paged.on( 'rendering', () => {
      console.log( 'paged is rendering' );
      resizer();
    } );
    observeDOM( document.body, resizer );

  }
