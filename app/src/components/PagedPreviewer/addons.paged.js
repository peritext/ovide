/* eslint-disable */

/**
 * DOM observer use to retrigger the resize script when changing content in the page
 */
const observeDOM = ( function() {
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
          console.log( 'in constructor' );
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
            const handler = document.createElement( 'p' );
            handler.className = 'footnoteHandler';
            parentElement.insertBefore( handler, footnote );
            handler.appendChild( footnote );
            handler.style.display = 'inline-block';
            handler.style.width = '100%';
            handler.style.float = 'right';
            handler.style.pageBreakInside = 'avoid';
          }
        }

        afterParsed() {
          console.info( 'parsing finished, rendering the pages' );
          console.group( 'rendering pages' );
          Toastify( {
            text: 'Rendering pages',
            duration: 2000
          } ).showToast();
        }

        afterPageLayout( pageFragment, page, breakToken ) {
          console.info( 'page %s is rendered', page.position + 1 );
          if (page.position%20 === 0 && page.position) {
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
          Toastify( {
            text: `Attaching footnotes to ${ pages.length } pages`,
            duration: 1000
          } ).showToast();
          console.info( 'rendering done, attaching footnotes to %s pages', pages.length );
          for ( const page of pages ) {
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
            let footnoteIndex = 0;
            for ( const footnote of footnotes ) {
              footnoteIndex++;
              const handler = footnote.parentElement;

              footnoteArea.appendChild( footnote );
              handler.parentNode.removeChild( handler );

              const footnoteCall = document.getElementById( `note-content-pointer-${ footnote.id}` );
              if ( footnoteCall ) {
                footnoteCall.innerHTML = `<sup id="note-content-pointer-${ footnote.id }">${ footnoteIndex }</sup>`;
              }

              footnote.innerHTML = `<sup class="note-pointer"><a href="#note-content-pointer-${ footnote.id }">${ footnoteIndex }</a></sup>${ footnote.innerHTML}`;
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
          Toastify( {
            text: 'Rendering finished !',
            duration: 3000
          } ).showToast();

        }
        } );/* end register handlers */
    // resize logic
    const paged = new window.Paged.Previewer();
    const resizer = () => {
      const pages = document.querySelector( '.pagedjs_pages' );

      if ( pages ) {
        const scale = ( ( window.innerWidth * 0.9 ) / pages.offsetWidth );
        if ( scale < 1 ) {
          const translateVal = ( window.innerWidth / 2 ) - ( ( pages.offsetWidth * scale / 2 ) );
          const style = `scale(${ scale }) translate(${ translateVal }px, 0)`;
          pages.style.transform = style;
        }
 else {
          pages.style.transform = 'none';
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
